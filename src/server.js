/**
 * Imports
 */
const express = require("express");
const next = require("next");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const checkLogin = require("./checklogin");
const websocket = require("./websocket");
require('dotenv').config()

const jwtSecret = process.env.JWT_SECRET;
const expiration = process.env.JWT_EXPIRATION;

var urlimgtemp = "/defaultprofilepic.jpg";

/**
 * Variables que guardan la instancia del server con express y puerto y el ws
 */

const server = express();
const port = parseInt(process.env.PORT, 10) || 3000;

/**
 * Pool para la BBDD
 */

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
});

websocket(pool);

server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(cookieParser());

server.get("/logout", async (req, res, next) => {
  const eToken = req.cookies.token;
  const eUser = req.cookies.user;
  if (eToken) {
    res.clearCookie("token");
  }
  if (eUser) {
    res.clearCookie("user");
  }
  return res.redirect("/login");
});

server.use(checkLogin);


/**
 * Enlazar NextJS con Express. Obtener handler.
 */
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

/**
 * Funciones de la BBDD
 */

async function authenticate(email, passwd) {
  try {
    var userUsername, userPasswdCr, userEmail;
    var query = "SELECT name, passwdCr, email FROM user WHERE email = ?";
    const connection = await pool.getConnection();

    var [result, fields] = await connection.query(query, [email]);
    connection.release();
    if (result.length) {
      userUsername = result[0].name;
      userPasswdCr = result[0].passwdCr;
      userEmail = result[0].email;
      const verified = bcrypt.compareSync(passwd, userPasswdCr);
      if (verified) {
        var response = {
          username: userUsername,
          email: userEmail,
          imgpath: urlimgtemp
        };
      } else {
        var response = { error: "The password is invalid." };
      }
    } else {
      var response = { error: "This email doesn't exist." };
    }
    return response;
  }
  catch (err) {
    throw err;
  }
}

async function signup(username, email, passwd) {
  try {
    var query = "INSERT INTO user VALUES (?, ?, ?)";
    var checkname = "SELECT name FROM user WHERE name = ?"
    var checkemail = "SELECT email FROM user WHERE email = ?"
    const connection = await pool.getConnection();

    var [existName, fields] = await connection.query(checkname, [username]);
    if (existName.length) {
      var response = { error: "This username already exist" };
      return response;
    }
    var [existEmail, fields] = await connection.query(checkemail, [email]);
    if (existEmail.length) {
      var response = { error: "This email is already in use" };
      return response;
    }

    var passwdCr = bcrypt.hashSync(passwd, 10);
    var response = {};
    await connection.query(query, [username, passwdCr, email]);
    connection.release();
    var response = {
      username: username,
      email: email,
      imgpath: urlimgtemp
    };

    return response;
  }
  catch (err) {
    throw err;
  }
}

async function update(username, email, passwd, origEmail, origUsername) {
  try {
    var auxName, auxEmail, passwdCr;
    var query = "UPDATE user SET name = ?, passwdCr = ?, email = ? WHERE email = ?";
    var checkname = "SELECT name FROM user WHERE name = ?"
    var checkemail = "SELECT email FROM user WHERE email = ?"
    var getPass = "SELECT passwdCr FROM user WHERE email = ?";
    const connection = await pool.getConnection();
    console.log("entrando 1");
    if (username != null) {
      console.log("entrando 2");
      var [existName, fields] = await connection.query(checkname, [username]);
      if (existName.length) {
        var response = { error: "This username is already in use" };
        return response;
      }
      else {
        console.log("entrando 3");
        auxName = username;
      }
    }
    else {
      console.log("entrando 4");
      auxName = origUsername;
    }
    if (email != null) {
      console.log("entrando 5");
      var [existEmail, fields] = await connection.query(checkemail, [email]);
      if (existEmail.length) {
        var response = { error: "This email is already in use" };
        return response;
      }
      else {
        auxEmail = email;
      }
    }
    else {
      auxEmail = origEmail;
    }
    if (passwd != null) {
      console.log("entrando 9");
      passwdCr = bcrypt.hashSync(passwd, 10);
    }
    else{
      console.log("entrando 10");
      var [existPasswd, fields] = await connection.query(getPass, [origEmail]);
      passwdCr = existPasswd[0].passwdCr;
    }
    console.log("entrando 11");
    var response = {};
    await connection.query(query, [auxName, passwdCr, auxEmail, origEmail]);
    connection.release();
    var response = {
      username: auxName,
      email: auxEmail,
      imgpath: urlimgtemp
    };

    return response;
  }
  catch (err) {
    throw err;
  }
}

/**
 * Peticiones gestionadas por express
 */
server.get("", (req, res) => {
  return res.redirect("/login");
});


server.post("/login", checkLogin, async (req, res, next) => {
  var email = req.body.email;
  var passwd = req.body.password;
  try {
    var validation = await authenticate(email, passwd);
    if (validation.error) {
      return res.json(validation);
    }
    else {
      var token = jsonwebtoken.sign({ validation }, jwtSecret, { expiresIn: expiration });
      res.cookie("token", token, { httpOnly: true });
      res.cookie("user", JSON.stringify(validation), { httpOnly: true });
      return res.json({ ok: "ok" });
    }
  } catch (err) {
    console.error(err);
  }
});

server.post("/register", checkLogin, async (req, res, next) => {
  var username = req.body.username;
  var email = req.body.email;
  var passwd = req.body.password;
  try {
    var validation = await signup(username, email, passwd);
    if (validation.error) {
      return res.json(validation);
    }
    else {
      var token = jsonwebtoken.sign({ validation }, jwtSecret, { expiresIn: expiration });
      res.cookie("token", token, { httpOnly: true });
      res.cookie("user", JSON.stringify(validation), { httpOnly: true });
      return res.json({ ok: "ok" });
    }
  }
  catch (err) {
    console.error(err)
  }
});

server.post("/update", checkLogin, async (req, res, next) => {
  var username = req.body.sendName;
  var email = req.body.sendEmail;
  var passwd = req.body.sendPasswd;
  var origEmail = req.body.keyEmail;
  var origUsername = req.body.keyName;
  try {
    var validation = await update(username, email, passwd, origEmail, origUsername);
    if (validation.error) {
      return res.json(validation);
    }
    else {
      res.clearCookie("token");
      res.clearCookie("user");
      var token = jsonwebtoken.sign({ validation }, jwtSecret, { expiresIn: expiration });
      res.cookie("token", token, { httpOnly: true, });
      res.cookie("user", JSON.stringify(validation), { httpOnly: true });
      return res.json({ ok: "ok" });
    }
  }
  catch (err) {
    console.error(err)
  }
});

/**
 * Peticiones gestionadas por NextJS
 */
nextApp.prepare().then(() => {
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`[!] Ready on http://localhost:${port}`);
  });
});

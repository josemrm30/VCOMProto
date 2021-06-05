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
//const routerServer = require("./routesServer");  //rutas modulares, continuar en el futuro.

const jwtSecret = "probando12345";
const expiration = "1d";

/**
 * Variables que guardan la instancia del server con express y puerto y el ws
 */

const server = express();
const port = parseInt(process.env.PORT, 10) || 3000;

/**
 * Pool para la BBDD
 */

 const pool = mysql.createPool({
  host: "localhost",
  user: "vcomdbuser",
  password: "GQjsHCdwpinWvnqX",
  database: "vcommult",
  charset: "utf8mb4"
});

websocket(pool);

server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(cookieParser());

server.get("/logout", async (req, res, next) => {
  const logged = req.cookies.token;
  if (logged) {
    res.clearCookie("token");
    res.clearCookie("username");
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
    var userName, userPasswdCr, userEmail, userBirthdate;
    var query =
      "SELECT name, passwdCr, email, birthdate FROM user WHERE email = ?";
    const connection = await pool.getConnection();

    var [result, fields] = await connection.query(query, [email]);
    connection.release();
    if (result.length) {
      userName = result[0].name;
      userPasswdCr = result[0].passwdCr;
      userEmail = result[0].email;
      userBirthdate = result[0].birthdate;
      const verified = bcrypt.compareSync(passwd, userPasswdCr);
      if (verified) {
        var response = {
          name: userName,
          email: userEmail,
          birthdate: userBirthdate,
        };
      } else {
        var response = { error: "The password is invalid." };
      }
    } else {
      var response = { error: "The email not exist." };
    }
    return response;
  }
  catch (err) {
    var response = { error: "The username or email already exist" };
    return response;
  }
}

async function signup(username, email, passwd, bday) {
  try {
    var query = "INSERT INTO user VALUES (?, ?, ?, ?)";
    const connection = await pool.getConnection();

    var passwdCr = bcrypt.hashSync(passwd, 10);
    var response = {};
    await connection.query(query, [username, passwdCr, email, bday]);
    connection.release();

    var response = {
      name: username,
      email: email,
      birthdate: bday
    };
    console.log("probando" + response);
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
      console.error(validation.error);
    } else {
      var token = jsonwebtoken.sign({ validation }, jwtSecret, {
        expiresIn: expiration,
      });

      res.cookie("token", token, { httpOnly: true });
      res.cookie("username", validation.name, { httpOnly: true });
      res.json({ token });
    }
  } catch (err) {
    console.error(err);
  }
});

server.post("/register", checkLogin, async (req, res, next) => {
  var username = req.body.username;
  var email = req.body.email;
  var passwd = req.body.password;
  var bdate = req.body.birthdate;
  try {
    var validation = await signup(username, email, passwd, bdate);
    console.log("probando2" + validation);
    if (validation.error) {
      console.error(validation.error);
    }
    else {
      var token = jsonwebtoken.sign({ validation }, jwtSecret, { expiresIn: expiration });

      res.cookie('token', token, { httpOnly: true });
      res.json({ token });
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

/**
 * Imports
 */
const express = require("express");
const next = require("next");
const ws = require("ws");
const uuid = require("node-uuid");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const withAuth = require("./middleware");
//const routerServer = require("./routesServer");  //rutas modulares, continuar en el futuro.

const jwtSecret = "probando12345";
const expiration = "1d";



/**
 * Variables que guardan la instancia del server con express y puerto y el ws
 */
var conexiones = {}; //Diccionario [String (user id): Socket (client)]
var users = {};
const server = express();
const port = parseInt(process.env.PORT, 10) || 3000;
const logged = false;
const wss = new ws.Server({ port: 8085 });

server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(cookieParser());


/**
 * Pool para la BBDD
 */

const pool = mysql.createPool({
  host: "localhost",
  user: "vcomdbuser",
  password: "GQjsHCdwpinWvnqX",
  database: "vcommult",
});

wss.on("connection", (client) => {
  client.on("message", (e) => {
    //Al recibir un mensaje (e->evento)
    console.log("Nuevo mensaje --> ", e, JSON.parse(e))
    var data = JSON.parse(e);
    switch (
    data.tipo //Según el tipo, hago algo.
    ) {
      case "disconnect": //Si un usuario se desconecta cerramos su conexión y lo eliminamos de la lista de users online
        conexiones[data.userid].close();
        delete conexiones[data.userid];
        delete users[data.userid];
        Object.keys(conexiones).forEach((id) => {
          //Además, lo notificamos a los demás
          conexiones[id].send(
            JSON.stringify({
              tipo: "useroffline",
              userid: data.userid,
            })
          );
        });
        console.log(
          `El usuario con id ${data.userid} se ha desconectado. (${Object.keys(conexiones).length
          })`
        );
        break;
      case "username": //Nuevo usuario. Generamos su uid y se lo notificamos al resto.
        client.username = data.contenido;
        client.id = uuid.v4();
        users[client.id] = data.contenido;
        console.log(
          "Nuevo cliente, ID: " + client.id + ". Username: " + client.username
        );
        client.send(
          JSON.stringify({
            //Le doy al nuevo user su id y la lista de users online
            tipo: "getID",
            userid: client.id,
            listausers: users,
          })
        );
        Object.keys(conexiones).forEach((id) => {
          //Notifico a los demás el nuevo miembro.
          conexiones[id].send(
            JSON.stringify({
              tipo: "useronline",
              username: client.username,
              userid: client.id,
            })
          );
        });
        conexiones[client.id] = client;
        break;
      case "icecandidate": //Pasamos al usuario con id "send" el ice candidate.
        if (conexiones[data.receiverid]) {
          conexiones[data.receiverid].send(e);
        }
        break;
      case "sdp":
        if (conexiones[data.receiverid]) {
          conexiones[data.receiverid].send(e);
        }
        break;
      case "hangup":
        if(conexiones[data.receiverid]){
          conexiones[data.receiverid].send(e);
        }
        break;
      case "rol":
        if (conexiones[data.receiverid]) {
          conexiones[data.receiverid].send(e);
        }
        break;
      default:
        //El server no entiende el tipo de mensaje y no puede hacer nada. F
        console.log("No se ha entendido el tipo de mensaje: " + data.tipo);
        break;
    }
  });
});

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
    var query = "SELECT name, passwdCr, email, birthdate FROM user WHERE email = ?";
    const connection = await pool.getConnection();

    var [result, fields] = await connection.query(query, [email]);
    connection.release();
    userName = result[0].name;
    userPasswdCr = result[0].passwdCr;
    userEmail = result[0].email;
    userBirthdate = result[0].birthdate;
    const verified = bcrypt.compareSync(passwd, userPasswdCr);
    if (verified) {
      var response = {
        name: userName,
        email: userEmail,
        birthdate: userBirthdate
      };
    }
    else {
      var response = { error: "The password is invalid." };
    }
    return response;
  }
  catch (err) {
    throw err;
  }
}

/**
 * Verificación si ya estás loggeado
 */

async function checkLogin(req, res, next) {
  const loged = req.cookies.token;
  if (loged) {
    const tokenOk = jsonwebtoken.verify(loged, jwtSecret);
    if (tokenOk) {
      res.redirect("/main");
    }
  }
  else {
    next();
  }
}

/**
 * Peticiones gestionadas por express
 */
server.get("", (req, res) => {
  return res.redirect("/login");
});


server.get("/login", async (req, res, next) => {
  await checkLogin(req, res, next);
});

server.get("/register", async (req, res, next) => {
  await checkLogin(req, res, next);
});

server.get("/logout", async (req, res, next) => {
  const loged = req.cookies.token;
  if (loged) {
    const tokenOk = jsonwebtoken.verify(loged, jwtSecret);
    if (tokenOk) {
      res.clearCookie('token');
      res.redirect("/login");
    }
  }
  else {
    next();
  }
});

server.post("/login", async (req, res, next) => {
  await checkLogin(req, res, next);
  var email = req.body.email;
  var passwd = req.body.password;
  try {
    var validation = await authenticate(email, passwd);
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


server.get("/main", withAuth, (req, res, next) => {
  next();
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

/**
 * Imports
 */
const express = require("express");
const next = require("next");
/**
 * Variables que guardan la instancia del server con express y puerto
 */
const server = express();
const port = parseInt(process.env.PORT, 10) || 3000;
const logged = false;

/**
 * Enlazar NextJS con Express. Obtener handler.
 */
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

/**
 * Peticiones gestionadas por express
 */
server.get("", (peticion, respuesta) => {
  if (logged){
    return respuesta.redirect("/main");
  }
  else{
    return respuesta.redirect("/login");
  }
});

server.post("/main", (peticion, respuesta) => {
  return respuesta.json("/register");
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
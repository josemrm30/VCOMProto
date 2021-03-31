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

/**
 * Enlazar NextJS con Express. Obtener handler.
 */
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

/**
 * Peticiones gestionadas por express
 */
server.post("/", (peticion, respuesta) => {
  return respuesta.json(peticion.headers);
});

server.get("/test", (peticion, respuesta) => {
  respuesta.send("<h1>SISISISIS</h1>");
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
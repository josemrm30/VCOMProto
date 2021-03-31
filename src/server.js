import express from "express";
import next from "next";

// configuracion de servidor
const server = express();
const port = parseInt(process.env.PORT, 10) || 3000;

server.post("/", (peticion, respuesta) => {
  return respuesta.json(peticion.headers);
});

// configuracion de next
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
const ws = require("ws");
const uuid = require("node-uuid");

function websocket() {
    var conexiones = {}; //Diccionario [String (user id): Socket (client)]
    var users = {};


    const wss = new ws.Server({ port: 8085 });
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
                    if (conexiones[data.receiverid]) {
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
}
module.exports = websocket;
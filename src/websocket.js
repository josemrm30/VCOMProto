const ws = require("ws");

function websocket(pool) {
  var conexionesApp = {}; //Diccionario [String (user id): Socket (client)]
  var conexionesFriends = {};
  var users = {};

  const wss = new ws.Server({ port: 8085 });
  wss.on("connection", (client, req) => {
    client.on("message", async (e) => {
      //Al recibir un mensaje (e->evento)
      console.log("Nuevo mensaje --> ", e, JSON.parse(e));
      var data = JSON.parse(e);
      switch (
        data.tipo //Según el tipo, hago algo.
      ) {
        case "disconnect": //Si un usuario se desconecta cerramos su conexión y lo eliminamos de la lista de users online
          if (data.pagina == "app") {
            conexionesApp[data.userid].close();
            delete conexionesApp[data.userid];
            Object.keys(conexionesApp).forEach((id) => {
              //Además, lo notificamos a los demás
              conexionesApp[id].send(
                JSON.stringify({
                  tipo: "useroffline",
                  userid: data.userid,
                })
              );
            });
          } else {
            conexionesFriends[data.userid].close();
            delete conexionesFriends[data.userid];
          }
          console.log(
            `El usuario con id ${data.userid} se ha desconectado. Pagina: ${
              data.pagina
            } App: (${Object.keys(conexionesApp).length}) Friends: ${
              Object.keys(conexionesFriends).length
            }`
          );
          break;
        case "username": //Nuevo usuario. Generamos su uid y se lo notificamos al resto.
          client.username = data.contenido;
          if (data.pagina == "app") {
            conexionesApp[client.username] = client;
          } else {
            conexionesFriends[client.username] = client;
          }
          console.log("Nuevo cliente, Username: " + client.username);
          break;
        case "icecandidate": //Pasamos al usuario con id "send" el ice candidate.
          if (conexionesApp[data.receiverid]) {
            conexionesApp[data.receiverid].send(e);
          }
          break;
        case "sdp":
          if (conexionesApp[data.receiverid]) {
            conexionesApp[data.receiverid].send(e);
          }
          break;
        case "hangup":
          if (conexionesApp[data.receiverid]) {
            conexionesApp[data.receiverid].send(e);
          }
          break;
        case "rol":
          if (conexionesApp[data.receiverid]) {
            conexionesApp[data.receiverid].send(e);
          }
          break;
        case "chatmsg":
          //Insertar en la bbdd...
          try {
            const connection = await pool.getConnection();
            await connection.query(
              "INSERT INTO chat_entry VALUES (?, ?, ?, ?) ",
              [null, data.chatid, data.senderid, data.message]
            );
            connection.release();
            if (conexionesApp[data.receiverid]) {
              conexionesApp[data.receiverid].send(e);
            }
          } catch (err) {
            console.log(err);
          }
          break;
        case "resolverpeti":
          try {
            const connection = await pool.getConnection();
            if (data.aceptar) {
              await connection.query(
                "UPDATE friend SET accepted=1 WHERE id=?",
                [data.id]
              );
            } else {
              await connection.query("DELETE FROM friend WHERE id=?", [
                data.id,
              ]);
            }
          } catch (err) {
            console.log(err);
          }
          break;
        case "sendpeti":
          try {
            const connection = await pool.getConnection();
            const results = await connection.query(
              "INSERT INTO friend VALUES (?,?,?,?,0)",
              [null, client.username, data.user, 0]
            );
            console.log(results);
            if (conexionesFriends[data.username]) {
              conexionesFriends[data.username].send(
                JSON.stringify({
                  tipo: "nuevapeticion",
                  id: results.insertId,
                  user: client.username,
                })
              );
            }
            client.send(
              JSON.stringify({
                tipo: "success",
                msg:
                  "Se ha enviado una petición de amistad a " + data.user + ".",
              })
            );
          } catch (err) {
            console.log(err);
            client.send(
              JSON.stringify({
                tipo: "error",
                msg:
                  "No se pudo añadir al usuario " + data.user + " como amigo.",
              })
            );
          }
          break;
        case "newchat":
          try {
            const connection = await pool.getConnection();
            const query = await connection.query(
              "SELECT id FROM chat WHERE id IN (SELECT id FROM chat_user WHERE user = ?)",
              [client.username]
            );
            console.log(query);
            const results = await connection.query(
              "INSERT INTO chat VALUES (null,null)",
              null
            );
            await connection.query(
              "INSERT INTO chat_entry VALUES (null, ?, ?)",
              [client.username]
            )

            await connection.query(
              "INSERT INTO chat_entry VALUES (null, ?, ?)",
              [data.username]
            )
            console.log(results);
            if (conexionesFriends[data.username]) {
              conexionesFriends[data.username].send(
                JSON.stringify({
                  tipo: "nuevapeticion",
                  id: results.insertId,
                  user: client.username,
                })
              );
            }
            client.send(
              JSON.stringify({
                tipo: "success",
                msg:
                  "Se ha enviado una petición de amistad a " + data.user + ".",
              })
            );
          } catch (err) {
            console.log(err);
            client.send(
              JSON.stringify({
                tipo: "error",
                msg:
                  "No se pudo añadir al usuario " + data.user + " como amigo.",
              })
            );
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

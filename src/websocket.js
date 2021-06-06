const ws = require("ws");

function websocket(pool) {
  var conexionesApp = {}; //Diccionario [String (user id): Socket (client)]
  var conexionesFriends = {};

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
              const [petfilas, petcampos] = await connection.query(
                "SELECT * FROM friend WHERE id=?",
                [data.id]
              );
              if (conexionesFriends[petfilas[0].user1]) {
                conexionesFriends[petfilas[0].user1].send(
                  JSON.stringify({
                    tipo: "newfriend",
                    id: petfilas[0].id,
                    user: petfilas[0].user2,
                    since: new Date(),
                  })
                );
              }
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
            if (conexionesFriends[data.user]) {
              conexionesFriends[data.user].send(
                JSON.stringify({
                  tipo: "nuevapeticion",
                  id: results.insertId,
                  user: client.username,
                })
              );
            }
            client.send(
              JSON.stringify({
                tipo: "info",
                content:
                  "Se ha enviado una petición de amistad a " + data.user + ".",
              })
            );
          } catch (err) {
            console.log(err);
            client.send(
              JSON.stringify({
                tipo: "error",
                content:
                  "No se pudo enviar una petición de amistad al usuario " +
                  data.user +
                  ". ¿Estás seguro de que existe o de que no le has enviado ya una petición?",
              })
            );
          }
          break;
        case "delfriend":
          try {
            const connection = await pool.getConnection();
            const [petfilas, petcampos] = await connection.query(
              "SELECT * FROM friend WHERE id=?",
              [data.id]
            );
            await connection.query("DELETE FROM friend WHERE id=?", [data.id]);
            var userEnviar = client.username == petcampos[0].user1 ? petcampos[0].user2 : petcampos[0].user1;
            if(conexionesFriends[userEnviar]){
              conexionesFriends[userEnviar].send(JSON.stringify({
                tipo: "delfriend",
                id: data.id
              }))
            }
            client.send(JSON.stringify({
              tipo: "success",
              content: "Has eliminado a " + userEnviar + " de tu lista de amigos."
            }))
          } catch (err){
            client.send(JSON.stringify({
              tipo: "error",
              content: "Hubo un error al procesar la solicitud en el servidor."
            }))
          }
        case "newchat":
          try {
            const connection = await pool.getConnection();
            const [userchatsfields, userchatscampos] = await connection.query(
              "SELECT chat FROM chat_user WHERE user = ? AND chat IN (SELECT chat FROM chat_user WHERE user = ?)", 
              [client.username, data.username]
            );
            if(userchatsfields.length){
              client.send(JSON.stringify({
                tipo: "info",
                content: "Ya tiene un chat con el usuario " + data.username + "."
              }));
              return;
            }
            const insertChat = await connection.query(
              "INSERT INTO chat VALUES (null,null)"
            );
            const insertId = insertChat[0].insertId;
            await connection.query(
              "INSERT INTO chat_user VALUES (null, ?, ?)",
              [client.username, insertId]
            );

            await connection.query(
              "INSERT INTO chat_user VALUES (null, ?, ?)",
              [data.username, insertId]
            );

            client.send(
              JSON.stringify({
                tipo: "success",
                content: "Se ha creado un chat con " + data.username + ". Visite la sección principal para empezar a chatear!",
              })
            );
          } catch (err) {
            console.log(err);
            client.send(
              JSON.stringify({
                tipo: "error",
                content: "No se pudo crear un chat con " + data.username + ".",
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

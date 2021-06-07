const ws = require("ws");

function websocket(pool) {
  var conexionesApp = {}; //Diccionario [String (user id): Socket (client)] - Conexiones a la app principal
  var conexionesFriends = {}; //Diccionario [String (user id): Socket (client)] - Conexiones a la lista de amigos

  const wss = new ws.Server({ port: 8085 });
  wss.on("connection", (client, req) => {
    client.on("message", async (e) => {
      //Al recibir un mensaje (e->evento)
      console.log("Nuevo mensaje --> ", JSON.parse(e));
      var data = JSON.parse(e);
      switch (
        data.tipo //Según el tipo, hago algo.
      ) {
        case "disconnect": //Si un usuario se desconecta cerramos su conexión y lo eliminamos de la lista de users online
          if (data.pagina == "app") {
            conexionesApp[data.userid].close();
            delete conexionesApp[data.userid];
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
        case "username": //Nuevo usuario. Guardamos su conexión
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
        case "ring":
          if (conexionesApp[data.username]) {
            const ring = JSON.stringify({
              tipo: "ring",
              chatid: data.chatid,
              username: client.username,
            });
            conexionesApp[data.username].send(ring);
          } else {
            //El cliente no existe, asi que no se puede realizar una llamada
            setTimeout(() => {
              client.send(
                JSON.stringify({
                  tipo: "declinecall",
                  username: data.username,
                  chatid: data.chatid,
                })
              );
              client.send(
                JSON.stringify({
                  tipo: "error",
                  content:
                    "El usuario " +
                    data.username +
                    " está desconectado o no puede recibir llamadas.",
                })
              );
            }, 1500); //Emular al menos una espera para que no sea directo y el usuario se entere del rechazo
          }
          break;
        /*
        case "rol":
        if (conexionesApp[data.receiverid]) {
          conexionesApp[data.receiverid].send(e);
        }
        break;
        */
        case "declinecall":
          if (conexionesApp[data.username]) {
            conexionesApp[data.username].send(e);
          }
          break;
        case "chatmsg": //En caso de que llegue un nuevo mensaje
          try {
            const connection = await pool.getConnection();
            await connection.query(
              //Lo guardo en la BBDD como entrada de un chat (persistencia)
              "INSERT INTO chat_entry VALUES (?, ?, ?, ?) ",
              [null, data.chatid, data.senderid, data.message]
            );
            connection.release();
            if (conexionesApp[data.receiverid]) {
              //Se lo envio al otro usuario si esta online
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
              //Si la petición ha sido aceptada, la actualizo en la BBDD
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
                    //Como ha sido aceptada, indico al usuario que envió la petición el exito.
                    tipo: "newfriend",
                    id: petfilas[0].id,
                    user: petfilas[0].user2,
                    since: new Date(),
                  })
                );
              }
            } else {
              //Si no ha sido aceptada, la elimino.
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
            const connection = await pool.getConnection(); //Inserto la petición como no aceptada en la BBDD
            const [alreayFriendsFields, campos] = await connection.query(
              //Busco si no eran amigos anteriormente.
              "SELECT id FROM friend WHERE user1 = ? AND user2 = ? OR user2 = ? AND user1 = ?",
              [client.username, data.user, client.username, data.user]
            );
            console.log(alreayFriendsFields);
            if (alreayFriendsFields.length) {
              //Si lo eran (hay resultados), notificar error
              client.send(
                JSON.stringify({
                  tipo: "error",
                  content:
                    "No se pudo enviar una petición de amistad al usuario " +
                    data.user +
                    " porque ya es tu amigo.",
                })
              );
              return;
            }
            const results = await connection.query(
              //Si no, insertar nueva petición no aceptada en la bbdd
              "INSERT INTO friend VALUES (?,?,?,?,0)",
              [null, client.username, data.user, 0]
            );
            console.log(results);
            if (conexionesFriends[data.user]) {
              //Si el usuario destino esta online, enviar la petición para que se actualice su interfaz
              conexionesFriends[data.user].send(
                JSON.stringify({
                  tipo: "nuevapeticion",
                  id: results.insertId,
                  user: client.username,
                })
              );
            }
            client.send(
              //Notificar al usuario que envió la petición el éxito de la operación.
              JSON.stringify({
                tipo: "info",
                content:
                  "Se ha enviado una petición de amistad a " + data.user + ".",
              })
            );
          } catch (err) {
            //En caso de error (por ejemplo, foreigns keys erroneas) enviar notificación al usuario
            console.log(err);
            client.send(
              JSON.stringify({
                tipo: "error",
                content:
                  "No se pudo enviar una petición de amistad al usuario " +
                  data.user +
                  ". ¿Estás seguro de que existe?",
              })
            );
          }
          break;
        case "delfriend": //Eliminar amigo
          try {
            const connection = await pool.getConnection();
            const [petfilas, petcampos] = await connection.query(
              //Obtener petición completa
              "SELECT * FROM friend WHERE id=?",
              [data.id]
            );

            var userEnviar = //Saber a que usuario enviar el mensaje "delfriend" para que actualice su interfaz
              client.username == petfilas[0].user1
                ? petfilas[0].user2
                : petfilas[0].user1;

            await connection.query("DELETE FROM friend WHERE id=?", [data.id]); //Eliminar petición de la bbdd

            if (conexionesFriends[userEnviar]) {
              conexionesFriends[userEnviar].send(
                JSON.stringify({
                  tipo: "delfriend",
                  id: data.id,
                })
              );
            }
            client.send(
              JSON.stringify({
                tipo: "success",
                content:
                  "Has eliminado a " + userEnviar + " de tu lista de amigos.",
              })
            );
          } catch (err) {
            console.log(err);
            client.send(
              JSON.stringify({
                tipo: "error",
                content:
                  "Hubo un error al procesar la solicitud en el servidor.",
              })
            );
          }
          break;
        case "newchat": //Creación de un nuevo chat
          try {
            const connection = await pool.getConnection();
            const [userchatsfields, userchatscampos] = await connection.query(
              //Comprobar si no existe ya un chat con ese usuario
              "SELECT chat FROM chat_user WHERE user = ? AND chat IN (SELECT chat FROM chat_user WHERE user = ?)",
              [client.username, data.username]
            );
            if (userchatsfields.length) {
              //Si lo hay, notificar
              client.send(
                JSON.stringify({
                  tipo: "info",
                  content:
                    "Ya tiene un chat con el usuario " + data.username + ".",
                })
              );
              return;
            }
            //Si no, crear nuevo chat y relacionar a los usuarios mediante este.
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
                content:
                  "Se ha creado un chat con " +
                  data.username +
                  ". Visite la sección principal para empezar a chatear!",
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

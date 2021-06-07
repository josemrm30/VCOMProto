import {
  FriendElement,
  FriendRequest,
  FriendRequestTextBox,
} from "../../components/friend";
import { Headfoot } from "../../components/headfoot";
import do_query from "../../api/db";
import FriendEntry from "../../utils/friend_entry";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

//Componente encargado de la página de amigos (Forma funcional)
const Friends = (props) => {
  var ws = null; //Conexión a WS
  const user = props.username;
  const [friends, setFriends] = useState(props.friendlist); //Lista de amigos
  const [peticiones, setPeticiones] = useState(props.petitionlist); //Lista de peticiones

  //Función para manejar los mensajes del servidor al cliente
  const onmessage = function (e) {
    var msg = JSON.parse(e.data);
    switch (msg.tipo) {
      case "success": //Presentar un toast con un mensaje exitoso
        toast.success(msg.content);
        break;
      case "info": //Presentar un toast informativo
        toast.info(msg.content);
        break;
      case "error": //Presentar un toast con un error
        toast.error(msg.content);
        break;
      case "nuevapeticion": //Obtener una petición de amistad enviada al cliente
        //console.log("NUEVA PETICION");
        setPeticiones((prevPeticiones) => ({ //Actualizar el estado con la nueva petición
          ...prevPeticiones,
          [msg.id]: new FriendEntry(msg.id, msg.user, new Date(), false),
        }));
        break;
      case "newfriend": //Actualizar lista de amigos en caso de que se acepte la petición
        setFriends((prevFriends) => ({ //Actualizar el estado
          ...prevFriends,
          [msg.id]: new FriendEntry(msg.id, msg.user, msg.since, true),
        }));
        toast.success("¡" + msg.user + " acepto tu solicitud de amistad!");
        break;
      case "delfriend": //Eliminar un amigo
        setFriends((prevFriends) => {
          var updated = [...prevFriends];
          delete updated[msg.id];
          return updated;
        });
        break;
    }
  };

  //Configurar la conexión al server WS
  const setupWS = function () {
    ws = new WebSocket("ws://" + window.location.hostname + ":8085");
    ws.addEventListener("open", (e) => {
      console.log("Conectado a ws server... ");
      ws.send(
        JSON.stringify({
          tipo: "username",
          pagina: "friends",
          contenido: user,
        })
      );
    });
    ws.addEventListener("message", (e) => {
      onmessage(e);
    }); //Asignar como listener de los eventos "message" la función onmessagelsn
    ws.addEventListener("close", () => {
      console.log("Adios");
    });
  };

  //Hook que permite la incialización de la conexión ws en caso de que no exista. Es necesario declarar las dependencias (ws) en su segundo
  //parámetro como un array.
  useEffect(() => {
    console.log(ws);
    if (!ws) {
      setupWS();
    }
  }, [ws]);

  //Función llamada a la hora de tratar una petición de amistad
  const tratarPeticion = function (peticion, aceptada) {
    var peticionesUpdate = { ...peticiones };
    peticion.accepted = aceptada;
    if (aceptada) { //Si ha sido aceptada, tengo nuevo amigo
      setFriends((prevFriends) => ({
        ...prevFriends,
        [peticion.id]: peticion,
      }));
    }
    delete peticionesUpdate[peticion.id]; //Borro de la lista de peticiones
    setPeticiones(peticionesUpdate);
    ws.send( //Envio si la petición ha sido aceptada o no.
      JSON.stringify({
        tipo: "resolverpeti",
        id: peticion.id,
        aceptar: peticion.accepted,
      })
    );
  };

  //Enviar petición de amistad a otro usuario
  const sendPeticion = function (username) {
    ws.send(
      JSON.stringify({
        tipo: "sendpeti",
        user: username,
      })
    );
  };

  //Eliminar amigo
  const eliminaAmigo = function (idEntrada) {
    ws.send(
      JSON.stringify({
        tipo: "delfriend",
        id: idEntrada,
      })
    );
    setFriends((prevFriends) => {
      var updated = [...prevFriends];
      delete updated[idEntrada];
      return updated;
    });
  };

  //Crear un nuevo chat con un usuario
  const empezarChat = function (username) {
    ws.send(
      JSON.stringify({
        tipo: "newchat",
        username: username,
      })
    );
  };

  //Renderizar el componente (la página)
  return (
    <Headfoot user={props.username}>
      <div className="lg:flex block flex-row w-full mx-auto mt-1">
        <div className="block mx-1 p-5 lg:w-3/5 container-bg h-full">
          <p className="text-3xl font-bold">Your friends</p>
          <hr className="w-full my-1" />
          {Object.entries(friends).map(([id, friend]) => {
            console.log(friend);
            return (
              <FriendElement
                key={id}
                friend={friend}
                onClickNewChat={(username) => {
                  empezarChat(username);
                }}
              />
            );
          })}
        </div>
        <div className="block mx-1 lg:w-2/5 lg:mt-0 mt-1 h-full">
          <div className="block p-5 container-bg">
            <p className="text-3xl font-bold">Add friends</p>
            <hr className="w-full my-1" />
            <p>
              Type the username of your friend to add it! Your friend will have
              to accept your request!
            </p>
            <FriendRequestTextBox
              sendPeticion={(username) => {
                sendPeticion(username);
              }}
            />
          </div>
          <div className="block mt-1 p-5 container-bg h-full">
            <p className="text-3xl font-bold">Friendship requests</p>
            <hr className="w-full my-1" />
            {Object.entries(peticiones).map(([id, petition]) => {
              return (
                <FriendRequest
                  onClick={(peticion, aceptada) => {
                    console.log(aceptada, peticion);
                    tratarPeticion(peticion, aceptada);
                  }}
                  key={id}
                  friend={petition}
                />
              );
            })}
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-left" />
    </Headfoot>
  );
};

//Función que permite a NextJS (framework que permite Server Side Rendering con React) pasar al componente como
//propiedades la información persistente de la BBDD (En este caso, peticiones y amigos)
export async function getServerSideProps(context) {
  const { req, res } = context; //Obtener request y response
  const user = JSON.parse(req.cookies.user).username; //Obtener username
  try {
    const amigos = await do_query({
      query:
        "SELECT * FROM friend WHERE accepted = 1 AND (user1 = ? OR user2 = ?)",
      values: [user, user],
    });
    var amigosarr = {};
    for (const elem in amigos) {
      const amigo = amigos[elem];
      console.log(amigo);
      var nickfriend = amigo.user1 == user ? amigo.user2 : amigo.user1;
      amigosarr[amigo.id] = new FriendEntry(
        amigo.id,
        nickfriend,
        amigo.since,
        amigo.accepted
      );
    }
    console.log(amigosarr);
    const solicitudes = await do_query({
      query: "SELECT * FROM friend WHERE accepted = 0 AND (user2 = ?)",
      values: [user],
    });

    var solarr = {};
    for (const elem in solicitudes) {
      var nickfriend =
        solicitudes[elem].user1 == user
          ? solicitudes[elem].user2
          : solicitudes[elem].user1;

      solarr[solicitudes[elem].id] = new FriendEntry(
        solicitudes[elem].id,
        nickfriend,
        solicitudes[elem].since,
        solicitudes[elem].accepted
      );
    }

    const friendlist = await JSON.parse(JSON.stringify(amigosarr));
    const petitionlist = await JSON.parse(JSON.stringify(solarr));
    return {
      props: {
        friendlist: friendlist,
        petitionlist: petitionlist,
        username: user,
      },
    };
  } catch (err) {
    console.log(err);
  }
}

export default Friends;

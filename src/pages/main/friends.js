import {
  FriendElement,
  FriendRequest,
  FriendRequestTextBox,
} from "../../components/friend";
import { Headfoot } from "../../components/headfoot";
import { useRouter } from "next/router";
import do_query from "../../api/db";
import FriendEntry from "../../utils/friend_entry";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const Friends = (props) => {
  var ws = null;
  const user = props.username;
  const [friends, setFriends] = useState(props.friendlist);
  const [peticiones, setPeticiones] = useState(props.petitionlist);

  const onmessage = function (e) {
    var msg = JSON.parse(e.data);
    switch (msg.tipo) {
      case "success":
        toast.success(msg.content);
        break;
      case "info":
        toast.info(msg.content);
        break;
      case "error":
        toast.error(msg.content);
        break;
      case "nuevapeticion":
        console.log("NUEVA PETICION sis");
        setPeticiones((prevPeticiones) => ({
          ...prevPeticiones,
          [msg.id]: new FriendEntry(msg.id, msg.user, new Date(), false),
        }));
        break;
      case "newfriend":
        console.log("nuevo amigo");
        setFriends((prevFriends) => ({
          ...prevFriends,
          [msg.id]: new FriendEntry(msg.id, msg.user, msg.since, true),
        }));
        toast.success("¡" + msg.user + " acepto tu solicitud de amistad!");
        break;
      case "delfriend":
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

  useEffect(() => {
    console.log(ws);
    if (!ws) {
      setupWS();
    }
  }, [ws]);

  const tratarPeticion = function (peticion, aceptada) {
    var peticionesUpdate = { ...peticiones };
    peticion.accepted = aceptada;
    if (aceptada) {
      setFriends((prevFriends) => ({
        ...prevFriends,
        [peticion.id]: peticion,
      }));
    }
    delete peticionesUpdate[peticion.id];
    setPeticiones(peticionesUpdate);
    ws.send(
      JSON.stringify({
        tipo: "resolverpeti",
        id: peticion.id,
        aceptar: peticion.accepted,
      })
    );
  };

  const sendPeticion = function (username) {
    ws.send(
      JSON.stringify({
        tipo: "sendpeti",
        user: username,
      })
    );
  };

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

  const empezarChat = function (username) {
    ws.send(
      JSON.stringify({
        tipo: "newchat",
        username: username,
      })
    );
  };

  return (
    <Headfoot user={props.username}>
      <div class="lg:flex block flex-row w-full mx-auto mt-1">
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

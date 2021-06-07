import { Headfoot } from "../../components/headfoot";
import { SideBar } from "../../components/sidebar";
import { CallModal, ChatContainer } from "../../components/chatcontainers";
import { Component } from "react";
import do_query from "../../api/db";
import Chat from "../../utils/chat";
import ChatEntry from "../../utils/chat_entry";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

//Configuración usada en la conexión para establecer sus servidores STUN y TURN (protocolo ICE)
const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    //{ urls: "stun:stun4.l.google.com:19302" },
    {
      urls: "turn:numb.viagenie.ca",
      credential: "muazkh",
      username: "webrtc@live.com",
    },
    /*
    {
      urls: "turn:192.158.29.39:3478?transport=udp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },
    
    {
      urls: "turn:192.158.29.39:3478?transport=tcp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },
    */
  ],
};

/**
 * REESTRICCIONES DE LA RETRANSMISIÓN
 */
const rest = {
  audio: true,
  video: true,
};

/**
 * SESSION DESCRIPTION PROTOCOL
 * REESTRICCIONES
 */
const sdprest = {
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
  },
};

/**
 * Componente principal
 */
class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //En el estado se guarda todo lo que varía
      chats: props.chats,
      actualCallChat: null, //Necesito guardar con cual chat se corresponde la llamada en curso para poder
      actualChat: null, //así ocultar las cámaras en caso de que el usuario cambie de chat pero no cuelgue.
      streams: [],
      calling: false,
    };
    this.user = props.username;
    this.makingSDPOffer = false;
    //this.polite = false;
  }

  //Gestión de los mensajes mediante websocket
  async onmessagelsn(e) {
    var msg = JSON.parse(e.data);
    console.log(msg);
    switch (msg.tipo) {
      case "error": //Error en el lado del servidor (ya sea por un input erroneo, o algo similar)
        toast.error(msg.content);
        break;
      case "icecandidate": //Si recibo un nuevo candidato ice (del otro peer)
        try {
          console.log("Me llega ICEC " + msg);
          await this.pc.addIceCandidate(msg.icecandidate); //Lo añado a mi conexion
        } catch (err) {
          console.log("No se pudo añadir ice candidate: " + err);
        }
        break;
      case "sdp": //Si me llega una descripción SDP (Proceso de signaling)
        console.log("Me llega SDP " + msg);
        if (!this.pc) {
          //En caso de que no exista la conexión, la creo
          console.log("CONFIGURANDO PEER HANDLERS");
          await this.configPeerConnection();
          this.configPeerConnectionHandlers();
        }

        //Colisión: Por prevenir: Si es una oferta y no estoy en el estado estable (stable = no tengo ni descripción local ni remota)
        //tengo que rechazar la oferta porque ya tengo una
        const colision =
          msg.descripcion.type == "offer" &&
          (this.makingSDPOffer || this.pc.signalingState != "stable");
        if (colision) return;
        //Asigno el SDP entrante como descripción remota
        await this.pc.setRemoteDescription(msg.descripcion);
        //Si es una oferta, tengo que responder con una respuesta
        if (msg.descripcion.type == "offer") {
          await this.pc.setLocalDescription();
          console.log("Envio SDP 2: ", {
            tipo: "sdp",
            senderid: this.user,
            receiverid: msg.senderid,
            descripcion: this.pc.localDescription,
          });
          this.ws.send(
            JSON.stringify({
              tipo: "sdp",
              senderid: this.user,
              receiverid: msg.senderid,
              descripcion: this.pc.localDescription,
            })
          );
        }
        break;
      /*
        USADO EN EL PROTOTIPO ANTERIOR, YA NO SIRVE
      case "useroffline": //Si un usuario se desconecta, actualizo la lista
        return;
        this.setState((prevState) => {
          var newUsers = prevState.users;
          delete newUsers[msg.userid];
          return { users: newUsers };
        });
        break;
      case "useronline": //Si un usuario se conecta, actualizo la lista
        return;
        this.setState((prevState) => {
          var userAux = prevState.users;
          userAux[msg.userid] = msg.username;
          return { users: userAux };
        });
        break;
       */
      case "rol":
        this.polite = msg.polite;
        break;
      case "hangup":
        //Finalizo la llamada
        if (this.pc) {
          this.onHangUpButtonClick();
        }
        break;
      case "ring":
        //Me llaman, presento notificación de llamada.
        this.presentCallingAlert(msg.username, msg.chatid);
        break;
      case "chatmsg":
        //Me llega un nuevo mensaje
        var chatid = msg.chatid; //Obtengo id del chat
        var sender = msg.senderid; //y username del usuario que lo envia
        var newchats = { ...this.state.chats }; //Voy a cambiar los chats, creo una copia del diccionario que los almacena
        var chat = newchats[chatid]; //Obtengo el chat correspondiente
        chat.msgs.push(new ChatEntry(1, chatid, sender, msg.message)); //Introduzco el mensaje
        //Actualizo el estado del componente de react
        this.setState(
          (prevState) => {
            return {
              chats: newchats,
            };
          },
          () => {
            //Callback para refrescar el chat actual, ya que podría haber cambiado
            if (this.state.actualChat) {
              this.setState((prevState) => {
                return {
                  actualChat: prevState.chats[prevState.actualChat.id],
                };
              });
            }
          }
        );
        break;
      case "declinecall":
        //Si el usuario al que llamo rechaza la llamada mediante la notificación (ring) finalizo la llamada.
        if (this.state.actualCallChat) {
          this.onHangUpButtonClick();
        }
        break;
    }
  }

  //Configurar la conexión al server WS
  setupWS() {
    this.ws = new WebSocket("ws://" + window.location.hostname + ":8085"); //Conectar al servidor
    //Asignar handlers
    this.ws.addEventListener("open", (e) => {
      console.log("Conectado a ws server... ");
      this.ws.send(
        //Me identifico
        JSON.stringify({
          tipo: "username",
          pagina: "app",
          contenido: this.user,
        })
      );
    });
    this.ws.addEventListener("message", (e) => {
      this.onmessagelsn(e);
    }); //Asignar como listener de los eventos "message" la función onmessagelsn
    this.ws.addEventListener("close", () => {
      console.log("Adios");
    });
  }

  //Función para silenciar la pista de audio del usuario (mutearse)
  onMuteButtonClick(muted) {
    for (const track of this.state.streams[0].getTracks()) {
      //Sabemos que el objeto MediaStream local siempre será el primero, iteramos por sus pistas
      if (track.kind == "audio") {
        //Si la pista es de audio, la silenciamos
        track.enabled = muted; //Deshabilitamos la pista = silencarla. Se actualiza en el otro peer automaticamente por WebRTC
      }
    }
  }

  //Función para ocultar la cámara del usuario. (Simil a la de mutearse)
  onHideCamClick(hide) {
    for (const track of this.state.streams[0].getTracks()) {
      if (track.kind == "video") {
        track.enabled = hide;
      }
    }
  }

  //Desconectarse de la aplicación
  disconnect() {
    if (this.ws) {
      if (this.actualCallChat) {
        this.onHangUpButtonClick(); //Cuelgo ya que cierro la app
      }
      const msgdc = {
        tipo: "disconnect",
        pagina: "app",
        userid: this.user,
      };
      console.log(JSON.stringify(msgdc));
      this.ws.send(JSON.stringify(msgdc)); //Notifico al WS que me voy
      if (this.pc) {
        //Cierro conexión en caso de que no esté cerrada.
        this.pc.close();
        this.pc = null;
      }
    }
  }

  //Función que se ejecuta justo después del que el componente de react sea renderizado.
  //Más info: React Component LifeCycle.
  componentDidMount() {
    this.setupWS();
    window.addEventListener("beforeunload", () => {
      this.disconnect();
    });
  }

  //Función ejecutada cuando se hace click en un chat de la sidebar
  onSideBarClick(selectedchat) {
    this.setState({
      actualChat: selectedchat,
    });
  }

  //Compartir pantalla
  async captureScreen() {
    try {
      //Obtengo stream de la pantalla
      let captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      //Lo añado a la conexión
      for (const track of captureStream.getTracks()) {
        console.log(track.label);
        this.pc.addTrack(track, captureStream);
      }
      //En caso de error, lo notifico al user
    } catch (err) {
      toast.error("It is not possible to share your screen right now.");
    }
  }

  //Configurar la conexión (RTCPeerConnection) para realizar una llamada
  async configPeerConnection() {
    this.pc = new RTCPeerConnection(config); //Creo la conexión con los servidores usados por ICE

    //Obtengo mi camara y video
    const localStream = await navigator.mediaDevices.getUserMedia(rest);
    for (const track of localStream.getTracks()) {
      this.pc.addTrack(track, localStream);
    }

    /* this.ws.send(
      JSON.stringify({
        tipo: "rol",
        receiverid: this.state.actualChat.username,
        polite: !this.polite,
      })
    );
    */

    //Asigno el handler al evento ontrack para actualizar los streams
    this.pc.ontrack = ({ streams: [stream] }) => {
      console.log("stream found ", stream);

      /**
       * FIXED: Doble stream
       * Antes, WebRTC usaba los MediaStreams directamente y no las pistas, por eso se duplicaba los streams
       * del peer remoto. El evento ontrack se disparaba dos veces ya que se envia la pista de audio y la de video por
       * separado, aunque pertenecen al mismo stream. Por lo tanto, hay que comprobar que no se haya añadido ya
       * el stream dicho al array de streams del componente de react mediante sus ids.
       */
      for (var elemstream in this.state.streams) {
        //console.log(this.state.streams[elemstream].id + "==" + stream.id);
        //console.log(this.state.streams[elemstream].id);
        if (this.state.streams[elemstream].id == stream.id) {
          console.log("Ya tenia este stream");
          return;
        }
      }
      this.setState((prevState) => {
        return {
          streams: [...prevState.streams, stream],
        };
      });
    };

    //Pongo mi stream el primero en la lista para que aparezca antes que el resto.
    //Entro en modo llamada (calling = true)
    this.setState((prevState) => {
      return {
        streams: [localStream, ...prevState.streams],
        calling: true,
      };
    });
  }

  //Configuración del resto de handlers de la conexión
  configPeerConnectionHandlers() {
    //Necesitaré negociación si el signalingstate de mi conexión es stable
    //Stable: Sin descripciones de ningún tipo.
    this.pc.onnegotiationneeded = async () => {
      console.log("Negotation needed");
      try {
        this.makingSDPOffer = true;
        await this.pc.setLocalDescription();
        console.log({
          tipo: "sdp",
          senderid: this.user,
          receiverid: this.state.actualCallChat.username,
          descripcion: this.pc.localDescription,
        });
        this.ws.send(
          JSON.stringify({
            tipo: "sdp",
            senderid: this.user,
            receiverid: this.state.actualCallChat.username,
            descripcion: this.pc.localDescription,
          })
        );
      } catch (err) {
        console.log("No se pudo hacer la descripcion local");
      } finally {
        this.makingSDPOffer = false;
      }
    };

    //En caso de que encuentre candidatos ICE, se los envio al otro peer mediante WS
    this.pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        console.log({
          tipo: "icecandidate",
          senderid: this.user,
          receiverid: this.state.actualCallChat.username,
          icecandidate: candidate,
        });
        this.ws.send(
          JSON.stringify({
            tipo: "icecandidate",
            senderid: this.user,
            receiverid: this.state.actualCallChat.username,
            icecandidate: candidate,
          })
        );
      }
    };

    //En el caso de que la recolecta de candidatos flle, lo reintento
    this.pc.oniceconnectionstatechange = () => {
      console.log("OnIceConnectionState: ", this.pc.iceConnectionState);
      if (this.pc.iceConnectionState == "failed") {
        this.pc.restartIce(); //Vuelvo a ejecutar el agente ICE
      }
    };
  }

  //Presentar la notificación de llamada
  presentCallingAlert(username, id) {
    const toastOptions = {
      hideProgressBar: false,
      closeOnClick: false,
      autoClose: false,
      toastId: id,
    };
    //CallModal es un componente propio encargado de presentar el layout correspondiente en el toast.
    toast.info(
      <CallModal
        username={username}
        onAcceptCall={async () => {
          //Si acepto la llamada, configuro la conexión
          //console.log("INCOMING CHAT ID " + id + "---" + this.state.chats[id]);
          this.setState(
            (prevState) => ({
              actualChat: prevState.chats[id],
              actualCallChat: prevState.chats[id],
            }),
            async () => {
              //Es necesario usar el handler de setState ya que la actualización del estado NO es sincrona.
              await this.configPeerConnection();
              this.configPeerConnectionHandlers();
            }
          );

          toast.dismiss(id); //Cierro el toast
        }}
        onRejectCall={() => {
          //Si no, notifico al otro usuario que no voy a entrar
          this.ws.send(
            JSON.stringify({
              tipo: "declinecall",
              username: username,
              chatid: id,
            })
          );
          toast.dismiss(id); //Cierro el toast
        }}
      />,
      toastOptions
    );
  }

  //Si el usuario pulsa el botón de llamar (usuario iniciador, Caller)
  async onCallButtonClick() {
    try {
      //Si estaba en otra llamada, la finalizo
      if (this.state.actualCallChat) {
        this.onHangUpButtonClick();
      }
      //Mando al WS el mensaje de tipo "ring" para notificar al otro usuario de que lo quiero llamar
      this.ws.send(
        JSON.stringify({
          tipo: "ring",
          chatid: this.state.actualChat.id,
          username: this.state.actualChat.username,
        })
      );
      //Actualizo el chat de llamada actual
      this.setState({
        actualCallChat: this.state.actualChat,
      });
      //Creo la conexion para que esté preparada por si el user acepte la llamada
      await this.configPeerConnection();
      //this.configPeerConnectionHandlers();
    } catch (err) {
      console.log(err);
    }
  }

  //Si alguno de los peers pulsa el botón de colgar
  onHangUpButtonClick() {
    //Cierro la conexión y la elimino
    this.pc.close();
    this.pc = null;
    //Paro todas las pistas
    for (const stream of this.state.streams) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    //Notifico el cierre de la llamada
    this.ws.send(
      JSON.stringify({
        tipo: "hangup",
        senderid: this.user,
        receiverid: this.state.actualCallChat.username,
      })
    );

    //Reinicio el estado del componente
    this.setState({
      streams: [],
      calling: false,
      actualCallChat: null,
    });
  }

  //Si el usuario pulsa el botón de enviar mensaje
  onSendMessageClick(msg) {
    //Envio al ws mi mensaje
    this.ws.send(
      JSON.stringify({
        tipo: "chatmsg",
        chatid: this.state.actualChat.id,
        senderid: this.user,
        receiverid: this.state.actualChat.username,
        message: msg,
      })
    );
    //Actualizo los chats
    var newchats = { ...this.state.chats };
    var chat = newchats[this.state.actualChat.id];
    chat.msgs.push(
      new ChatEntry(new Date(), this.state.actualChat.id, this.user, msg)
    );
    this.setState({
      chats: newchats,
    });
  }

  //Renderizado del componente de react.
  render() {
    return (
      <>
        <Headfoot user={this.user}>
          <SideBar
            chats={this.state.chats}
            ononSideBarClick={(selectedChat) => {
              this.onSideBarClick(selectedChat);
            }}
          />

          {this.state.actualChat && (
            <ChatContainer
              chat={this.state.actualChat}
              callChat={this.state.actualCallChat}
              streams={this.state.streams}
              calling={this.state.calling}
              onCallButtonClick={async () => {
                await this.onCallButtonClick();
              }}
              onHangUpButtonClick={() => {
                this.onHangUpButtonClick();
              }}
              onSendMessageClick={(msg) => {
                this.onSendMessageClick(msg);
              }}
              onScreenShareClick={async () => {
                await this.captureScreen();
              }}
              onMuteButtonClick={(muted) => {
                this.onMuteButtonClick(muted);
              }}
              onHideCameraClick={(hide) => {
                this.onHideCamClick(hide);
              }}
            />
          )}
          {!this.state.actualChat && (
            <>
              <h2 className="text-xl">
                Create a new conversation or click on a recent one
              </h2>
            </>
          )}
        </Headfoot>
        <ToastContainer />
      </>
    );
  }
}

//Función que permite a NextJS (framework que permite Server Side Rendering con React) pasar al componente como
//propiedades la información persistente de la BBDD (En este caso, chats)
export async function getServerSideProps(context) {
  const { req, res } = context;
  const user = JSON.parse(req.cookies.user).username;
  try {
    const chats = await do_query({
      query: "SELECT * FROM chat_user WHERE user = ?",
      values: [user],
    });

    var chatsdic = {};
    for (const elem in chats) {
      const chatID = chats[elem].chat;
      const [peers, fields] = await do_query({
        query: "SELECT * FROM chat_user WHERE chat = ? AND user <> ?",
        values: [chatID, user],
      });

      const msgs = await do_query({
        query: "SELECT * FROM chat_entry WHERE chat = ?",
        values: [chatID],
      });

      var msgsarr = [];
      for (const elem in msgs) {
        msgsarr.push(
          new ChatEntry(
            msgs[elem].id,
            chatID,
            msgs[elem].user,
            msgs[elem].content
          )
        );
      }
      chatsdic[chatID] = new Chat(chatID, peers.user, msgsarr);
    }
    console.log(chatsdic);
    var chatsdiscparsed = JSON.parse(JSON.stringify(chatsdic)); //Hay que hacerlo porque si no NextJS se queja (si, es un poco inutil)
    return {
      props: { username: user, chats: chatsdiscparsed },
    };
  } catch (err) {
    console.log(err);
  }
}

export default Main;

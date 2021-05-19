import { Headfoot } from "../components/headfoot";
import { SideBar } from "../components/sidebar";
import { ChatContainer } from "../components/chatcontainers";
import { Component } from "react";

const config = {
  iceServers: [
    { url: "stun:stun.l.google.com:19302" },
    { url: "stun:stun4.l.google.com:19302" },
    {
      url: "turn:numb.viagenie.ca",
      credential: "muazkh",
      username: "webrtc@live.com",
    },
    {
      url: "turn:192.158.29.39:3478?transport=udp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },
    {
      url: "turn:192.158.29.39:3478?transport=tcp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },
  ],
};

/**
 * STREAM RESTRICTIONS
 */
const rest = {
  audio: true,
  video: true,
};

/**
 * SESSION DESCRIPTION PROTOCOL
 * RESTRICTIONS
 */
const sdprest = {
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
  },
};

class Chat {
  constructor() {
    this.username = null;
    this.userid = null;
    this.msgs = [];
  }
}

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      chat: null,
      streams: [],
    };
    this.user = "testuser" + Math.floor(Math.random() * 100);
  }

  async onmessagelsn(e) {
    var msg = JSON.parse(e.data);
    console.log(msg);
    switch (msg.tipo) {
      case "icecandidate": //Si recibo un nuevo candidato ice (del otro peer)
        if (!msg.candidato) break; //Si es nulo, paso
        console.log(msg.candidato);
        if (!this.pc) setupPeerCon(); //En el no muy posible caso de que no tenga la conexion creada, la creo
        if (!this.pc.remoteDescription) {
          //Si la conexión no tiene descripción remota, lo guardo para después.
          iceCandidatesPendientes.push(msg.candidato);
        } else {
          await this.pc.addIceCandidate(msg.candidato); //Si no, añado el nuevo candidato
          if (iceCandidatesPendientes.length > 0) {
            //Y miro si tengo pendientes. TODO: Mejorar la comprobación.
            iceCandidatesPendientes.forEach(async (c) => {
              console.log(
                "Añadiendo ice candidate pendiente: " + JSON.stringify(c)
              );
              await this.pc.addIceCandidate(iceCandidatesPendientes.pop());
            });
          }
        }
        break;
      case "offer": //Si recibo una oferta
        if (!this.pc) this.setupPeerCon(); //En el caso de que no tenga conexión, la creo.
        llamandoA = msg.origin_uid; //Me está llamando un user, por lo que asigno el uuid a la varibale llamandoA
        await this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp)); //A partir de la oferta,
        //creo y asigno la descripción remota a la conexion.
        await this.setupStreams(); //Además, añado el stream local de cámara y video a la conexión
        var answer = await this.pc.createAnswer(sdprest); //Ahora, respondo al otro peer. Creo la respuesta
        await this.pc.setLocalDescription(answer); //La fijo como descripción local.
        this.ws.send(
          JSON.stringify({
            //Y la envio al server para que se la de al otro peer
            tipo: "answer",
            origin_uid: msg.origin_uid,
            remote_uid: msg.remote_uid,
            sdp: answer,
          })
        );
        break;
      case "answer": //Si recibo una respuesta, es porque he mandado antes una oferta
        await this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp)); //Solo asigno la descripción remota de la conexión con la respuesta
        break;
      case "useroffline": //Si un usuario se desconecta, actualizo la lista
        this.setState((prevState) => {
          var newUsers = prevState.users;
          delete newUsers[msg.userid];
          return { users: newUsers };
        });
        break;
      case "useronline": //Si un usuario se conecta, actualizo la lista
        this.setState((prevState) => {
          var userAux = prevState.users;
          userAux[msg.userid] = msg.username;
          return { users: userAux };
        });
        break;
      case "getID": //Si me acabo de conectar, habré pedido mi id. La recojo.
        this.id = msg.userid;
        var actualUsers = [];
        Object.keys(msg.listausers).forEach((id) => {
          //Además, creo la lista de usuarios conectados.
          actualUsers[id] = msg.listausers[id];
        });
        this.setState({
          users: actualUsers,
        });

        //Deshabilita el botón para iniciar una nueva conexión, y la textbox para introducir
        //el username. Guardo mi id.
        console.log("Tengo mi id: " + this.id);
        break;
    }
  }

  setupWS() {
    this.ws = new WebSocket("ws://localhost:8085");
    this.ws.addEventListener("open", (e) => {
      console.log("Conectado a ws server... ");
      this.ws.send(
        JSON.stringify({
          tipo: "username",
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

  disconnect() {
    if (this.ws) {
      const msgdc = {
        tipo: "disconnect",
        userid: this.id,
      };
      console.log(JSON.stringify(msgdc));
      this.ws.send(JSON.stringify(msgdc));
      if (this.pc) {
        this.pc.close();
        this.pc = null;
      }
      alert("Adios!");
    } else alert("Como puede ser posible esto xd");
  }

  componentDidMount() {
    this.setupWS();
  }

  onSideBarClick(selectedchat) {
    this.setState({
      chat: selectedchat,
    });
  }

  async onCallButtonClick() {
    try {
      //this.pc = new RTCPeerConnection(config);
      const localStream = await navigator.mediaDevices.getUserMedia(rest);
     /* for (const track of localStream.getTracks()) {
        this.pc.addTrack(track, localStream);
      }*/
      window.addEventListener("beforeunload", () => {
        this.disconnect();
      });
      this.setState((prevState) => {
        return {
          streams: [localStream, ...prevState.streams],
        };
      });
    } catch (err) {
      console.log("USER DENIED USER MEDIA");
    }
    //this.pc.onicecandidate = (candidate) =>
  }
  componentWillUnmount() {}

  render() {
    return (
      <Headfoot user={this.user}>
        <SideBar
          users={this.state.users}
          ononSideBarClick={(selectedChat) => {
            this.onSideBarClick(selectedChat);
          }}
        />
        <ChatContainer
          chat={this.state.chat}
          streams={this.state.streams}
          onCallButtonClick={async () => {
            await this.onCallButtonClick();
          }}
        />
      </Headfoot>
    );
  }
}
export default Main;

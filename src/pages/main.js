import { Headfoot } from "../components/headfoot";
import { SideBar } from "../components/sidebar";
import { ChatContainer } from "../components/chatcontainers";
import { Component } from "react";

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    {
      urls: "turn:numb.viagenie.ca",
      credential: "muazkh",
      username: "webrtc@live.com",
    },
    {
      urls: "turn:192.158.29.39:3478?transport=udp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },
    /*
    {
      urls: "turn:192.158.29.39:3478?transport=tcp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },
    */
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
      id: null,
      streams: [],
      calling: false,
    };
    this.user = "testuser" + Math.floor(Math.random() * 100);
    this.makingSDPOffer = false;
    this.polite = false;
  }

  async onmessagelsn(e) {
    var msg = JSON.parse(e.data);
    console.log(msg);
    switch (msg.tipo) {
      case "icecandidate": //Si recibo un nuevo candidato ice (del otro peer)
        try {
          console.log("Me llega ICEC " + msg);
          await this.pc.addIceCandidate(msg.icecandidate);
        } catch (err) {
          console.log("No se pudo añadir ice candidate: " + err);
        }
        break;
      case "sdp":
        console.log("Me llega SDP " + msg);
        if (!this.pc) {
          await this.configPeerConnection();
        }
        const colision =
          msg.descripcion.type == "offer" &&
          (this.makingSDPOffer || this.pc.signalingState != "stable");
        if (colision && !this.polite) return;
        await this.pc.setRemoteDescription(msg.descripcion);
        if (msg.descripcion.type == "offer") {
          await this.pc.setLocalDescription();
          console.log("Envio SDP 2: ", {
            tipo: "sdp",
            senderid: this.id,
            receiverid: msg.senderid,
            descripcion: this.pc.localDescription,
          });
          this.ws.send(
            JSON.stringify({
              tipo: "sdp",
              senderid: this.id,
              receiverid: msg.senderid,
              descripcion: this.pc.localDescription,
            })
          );
        }
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
      case "rol":
        this.polite = msg.polite;
        break;
      case "getID": //Si me acabo de conectar, habré pedido mi id. La recojo.
        this.id = msg.userid;
        var actualUsers = {};
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
    window.addEventListener("beforeunload", () => {
      this.disconnect();
    });
  }

  onSideBarClick(selectedchat, selid) {
    this.setState({
      chat: selectedchat,
      id: selid,
    });
  }

  async configPeerConnection() {
    this.pc = new RTCPeerConnection(config);

    const localStream = await navigator.mediaDevices.getUserMedia(rest);
    for (const track of localStream.getTracks()) {
      this.pc.addTrack(track, localStream);
    }

    this.pc.ontrack = (e) => {
      console.log("stream found ", e);
      this.setState((prevState) => {
        return {
          streams: [...prevState.streams, e.streams[0]],
        };
      });
    };

    this.pc.onnegotiationneeded = async () => {
      console.log("Negotation needed");
      try {
        this.makingSDPOffer = true;
        await this.pc.setLocalDescription();
        console.log({
          tipo: "sdp",
          senderid: this.id,
          receiverid: this.state.id,
          descripcion: this.pc.localDescription,
        });
        this.ws.send(
          JSON.stringify({
            tipo: "sdp",
            senderid: this.id,
            receiverid: this.state.id,
            descripcion: this.pc.localDescription,
          })
        );
      } catch (err) {
        console.log("No se pudo hacer la descripcion local");
      } finally {
        this.makingSDPOffer = false;
      }
    };

    this.pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        console.log({
          tipo: "icecandidate",
          senderid: this.id,
          receiverid: this.state.id,
          icecandidate: candidate,
        });
        this.ws.send(
          JSON.stringify({
            tipo: "icecandidate",
            senderid: this.id,
            receiverid: this.state.id,
            icecandidate: candidate,
          })
        );
      }
    };

    this.pc.oniceconnectionstatechange = () => {
      console.log("OnIceConnectionState: ", this.pc.iceConnectionState);
      if (this.pc.iceConnectionState == "failed") {
        this.pc.restartIce();
      }
    };

    this.setState((prevState) => {
      return {
        streams: [localStream],
        calling: true,
      };
    });
  }

  async onCallButtonClick() {
    try {
      this.ws.send(
        JSON.stringify({
          tipo: "rol",
          receiverid: this.state.id,
          polite: !this.polite,
        })
      );
      await this.configPeerConnection();
    } catch (err) {
      console.log("USER DENIED USER MEDIA");
    }
  }
  onHangUpButtonClick() {
    this.pc.close();
    this.pc = null;
    for (const stream of this.state.streams) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    this.setState({
      streams: [],
      calling: false,
    });
  }

  render() {
    return (
      <Headfoot user={this.user}>
        <SideBar
          users={this.state.users}
          ononSideBarClick={(selectedChat, id) => {
            this.onSideBarClick(selectedChat, id);
          }}
        />
        {this.state.chat && (
          <ChatContainer
            chat={this.state.chat}
            streams={this.state.streams}
            calling={this.state.calling}
            onCallButtonClick={async () => {
              await this.onCallButtonClick();
            }}
            onHangUpButtonClick={() => {
              this.onHangUpButtonClick();
            }}
          />
        )}
        {!this.state.chat && (
          <>
            <h2 className="text-xl">
              Create a new conversation or click on a recent one
            </h2>
          </>
        )}
      </Headfoot>
    );
  }
}
export default Main;

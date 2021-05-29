import { Headfoot } from "../../components/headfoot";
import { SideBar } from "../../components/sidebar";
import { ChatContainer } from "../../components/chatcontainers";
import { Component } from "react";
import do_query from "../../api/db";
import Chat from "../../utils/chat";
import ChatEntry from "../../utils/chat_entry";
import { ToastContainer, toast } from "react-toastify";
import {CallPopUp} from "../../components/callpopup";
import 'react-toastify/dist/ReactToastify.min.css';

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

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chats: props.chats,
      actualChat: null,
      streams: [],
      calling: false,
    };
    this.user = props.username;
    //this.user = window.localStorage.getItem("user");
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
      case "rol":
        this.polite = msg.polite;
        break;
      case "hangup":
        if (this.pc) {
          //Si hay PC, es que no hemos colgado.
          this.setState((prevState) => {
            return {
              streams: [prevState.streams[0]],
            };
          });
        }
        break;
      case "chatmsg":
        var chatid = msg.chatid;
        var sender = msg.senderid;
        var newchats = { ...this.state.chats };
        console.log(newchats);
        var chat = newchats[chatid];
        console.log(chat);
        chat.msgs.push(new ChatEntry(1, chatid, sender, msg.message));
        this.setState(
          (prevState) => {
            return {
              chats: newchats,
            };
          },
          () => {
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
    }
  }

  setupWS() {
    this.ws = new WebSocket("ws://" + window.location.hostname + ":8085");
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
        userid: this.user,
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

  onSideBarClick(selectedchat) {
    this.setState({
      actualChat: selectedchat,
    });
  }

  async configPeerConnection() {
    this.pc = new RTCPeerConnection(config);

    const localStream = await navigator.mediaDevices.getUserMedia(rest);
    for (const track of localStream.getTracks()) {
      this.pc.addTrack(track, localStream);
    }
    this.ws.send(
      JSON.stringify({
        tipo: "rol",
        receiverid: this.state.actualChat.username,
        polite: !this.polite,
      })
    );

    this.pc.ontrack = (e) => {
      console.log("stream found ", e.streams);
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
          senderid: this.user,
          receiverid: this.state.actualChat.username,
          descripcion: this.pc.localDescription,
        });
        this.ws.send(
          JSON.stringify({
            tipo: "sdp",
            senderid: this.user,
            receiverid: this.state.actualChat.username,
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
          senderid: this.user,
          receiverid: this.state.actualChat.username,
          icecandidate: candidate,
        });
        this.ws.send(
          JSON.stringify({
            tipo: "icecandidate",
            senderid: this.user,
            receiverid: this.state.actualChat.username,
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
      await this.configPeerConnection();
    } catch (err) {
      console.log(err);
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
    this.ws.send(
      JSON.stringify({
        tipo: "hangup",
        senderid: this.user,
        receiverid: this.state.actualChat.username,
      })
    );
    this.setState({
      streams: [],
      calling: false,
    });
  }

  onSendMessageClick(msg) {
    console.log({
      tipo: "chatmsg",
      chatid: this.state.actualChat.id,
      senderid: this.user,
      receiverid: this.state.actualChat.username,
      message: msg,
    });
    this.ws.send(
      JSON.stringify({
        tipo: "chatmsg",
        chatid: this.state.actualChat.id,
        senderid: this.user,
        receiverid: this.state.actualChat.username,
        message: msg,
      })
    );
    var newchats = { ...this.state.chats };
    var chat = newchats[this.state.actualChat.id];
    chat.msgs.push(
      new ChatEntry(new Date(), this.state.actualChat.id, this.user, msg)
    );
    this.setState({
      chats: newchats,
    });
  }

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

export async function getServerSideProps(context) {
  const { req, res } = context;
  try {
    const chats = await do_query({
      query: "SELECT * FROM chat_user WHERE user = ?",
      values: [req.cookies.username],
    });

    var chatsdic = {};
    for (const elem in chats) {
      const chatID = chats[elem].chat;
      const [peers, fields] = await do_query({
        query: "SELECT * FROM chat_user WHERE chat = ? AND user <> ?",
        values: [chatID, req.cookies.username],
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
      props: { username: req.cookies.username, chats: chatsdiscparsed },
    };
  } catch (err) {
    console.log(err);
  }
}

export default Main;

import { PureComponent, useEffect } from "react";
import { render } from "react-dom";
import { useState, useRef } from "react";
import { MessageCard } from "./chatcards";
import Chat from "../utils/chat";
import ChatEntry from "../utils/chat_entry";
export const ButtonCall = (props) => {
  return (
    <button
      onClick={async () => {
        console.log("Calling...");
        props.onClick();
      }}
      hidden={props.calling}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="inline h-10 w-10 mr-10 my-3 p-2 cursor-pointer bg-green-500 rounded-full hover:border-opacity-100 hover:bg-white border border-green-600 fill-current text-white hover:text-green-600"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 3h5m0 0v5m0-5l-6 6M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
        />
      </svg>
    </button>
  );
};

export const ButtonHangUp = (props) => {
  return (
    <button
      onClick={async () => {
        if (props.calling) {
          console.log("Disconnecting...");
          props.onClick();
        }
      }}
      hidden={!props.calling}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="inline h-10 w-10 mr-10 my-3 p-2 cursor-pointer bg-red-600 rounded-full hover:border-opacity-100 hover:bg-white border border-red-600 fill-current text-white hover:text-red-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1"
          d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
        />
      </svg>
    </button>
  );
};

export const ButtonScreenShare = (props) => {
  return (
    <button
      className="py-2 mx-2"
      onClick={() => {
        props.onScreenShareClick();
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="inline h-10 w-10 p-2 cursor-pointer bg-blue-500 rounded-full hover:border-opacity-100 hover:bg-white border border-blue-600 fill-current text-white hover:text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    </button>
  );
};

export const ButtonMute = (props) => {
  const [muted, setMuted] = useState(false);
  return (
    <button
      className="py-2 mx-2"
      onClick={() => {
        setMuted(!muted);
        props.onMuteButtonClick(muted);
      }}
    >
      {!muted && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="inline h-10 w-10 p-2 cursor-pointer bg-blue-500 rounded-full hover:border-opacity-100 hover:bg-white border border-blue-600 fill-current text-white hover:text-blue-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
            clip-rule="evenodd"
          />
        </svg>
      )}
      {muted && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="inline h-10 w-10 p-2 cursor-pointer bg-red-500 rounded-full hover:border-opacity-100 hover:bg-white border border-red-600 fill-current text-white hover:text-red-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
            clip-rule="evenodd"
          />
        </svg>
      )}
    </button>
  );
};

export const ButtonHideCam = (props) => {
  const [hidden, setHidden] = useState(false);
  return (
    <button
      className="py-2 mx-2"
      onClick={() => {
        setHidden(!hidden);
        props.onHideCameraClick(hidden);
      }}
    >
      {!hidden && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="inline h-10 w-10 p-2 cursor-pointer bg-blue-500 rounded-full hover:border-opacity-100 hover:bg-white border border-blue-600 fill-current text-white hover:text-blue-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
            clip-rule="evenodd"
          />
        </svg>
      )}
      {hidden && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="inline h-10 w-10 p-2 cursor-pointer bg-red-500 rounded-full hover:border-opacity-100 hover:bg-white border border-red-600 fill-current text-white hover:text-red-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
            clip-rule="evenodd"
          />
        </svg>
      )}
    </button>
  );
};

export const StreamComponent = (props) => {
  const videoRef = useRef(null);

  useEffect(() => {
    //Compruebo ya que useEffect = didMount() + didUpdate()
    if (videoRef.current) {
      videoRef.current.srcObject = props.stream;
    }
  }, [props.stream]);

  return (
    <video
      ref={videoRef}
      key={props.stream.id}
      style={{ width: "400px", height: "300px" }}
      autoPlay
      muted={props.muted ? "muted" : ""}
    ></video>
  );
};

export const ChatCams = (props) => {
  return (
    <>
      <div className="container-bg">
        <div className="block lg:flex lg:flex-wrap content-center justify-center mt-2">
          {props.streams.map((stream, index) => {
            return <StreamComponent stream={stream} muted={index} />;
          })}
        </div>
        {props.streams.length > 0 && (
          <div className="flex flex-wrap justify-center">
            <ButtonScreenShare
              onScreenShareClick={() => {
                props.onScreenShareClick();
              }}
            />
            <ButtonMute
              onMuteButtonClick={(muted) => {
                props.onMuteButtonClick(muted);
              }}
            />
            <ButtonHideCam
              onHideCameraClick={(hidden) => {
                props.onHideCameraClick(hidden);
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export const ChatInputBox = (props) => {
  const [text, setText] = useState(null);
  const textarea = useRef(null);
  return (
    <div className="inline-flex mt-2 container-bg">
      <textarea
        ref={textarea}
        onChange={(e) => {
          setText(e.target.value);
        }}
        className="inline w-full text-black"
      ></textarea>
      <button
        onClick={() => {
          props.onSendMessageClick(text);
          textarea.current.value = "";
          setText(null);
        }}
        className="mx-3 btn-black inline"
      >
        Send
      </button>
    </div>
  );
};

export const ChatContainer = (props) => {
  const msgarea = useRef(null);
  return (
    <div className="flex items-strech flex-col flex-1 mr-2 mt-2 p-1 overflow-auto max-h-screen">
      <div className="inline-flex justify-center text-3xl container-bg">
        <p className="flex-1 inline text-center mt-3 font-bold">
          Chatting with {props.chat.username}
        </p>
        <ButtonCall
          onClick={async () => {
            props.onCallButtonClick();
          }}
          calling={props.calling}
        />
        <ButtonHangUp
          onClick={() => {
            props.onHangUpButtonClick();
          }}
          calling={props.calling}
        />
      </div>
      <ChatCams
        onScreenShareClick={() => {
          props.onScreenShareClick();
        }}
        onMuteButtonClick={(muted) => {
          props.onMuteButtonClick(muted);
        }}
        onHideCameraClick={(hide) => {
          props.onHideCameraClick(hide);
        }}
        streams={props.streams}
      />
      <div
        ref={msgarea}
        className="mt-2 container-bg overflow-y-scroll h-full max-h-full"
      >
        {props.chat.msgs.length == 0 && (
          <div className="pl-2 overflow-hidden">
            <h1 className="font-bold block truncate">
              This is a new chat! Say Hello!
            </h1>
          </div>
        )}
        {Object.entries(props.chat.msgs).map(([index, msg]) => {
          //console.log(msg);
          return <MessageCard key={msg.id} chatEntry={msg} />;
        })}
      </div>
      <ChatInputBox
        onSendMessageClick={(msg) => {
          props.onSendMessageClick(msg);
          //msgarea.current.scrollIntoView(false);
        }}
      />
    </div>
  );
};

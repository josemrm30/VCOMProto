import { Avatar } from "./avatar";
import FriendEntry from "../utils/friend_entry";
import { useRef } from "react";
export const FriendRequestTextBox = (props) => {
  const inputRef = useRef(null);
  return (
    <div className="flex-1 mt-2">
      <input
        ref={inputRef}
        type="text"
        className="text-black"
        placeholder="Enter user ID..."
      ></input>
      <button
        onClick={() => {
          props.sendPeticion(inputRef.current.value);
          inputRef.current.value = "";
        }}
        className="ml-3 inline btn-black-inverted"
      >
        Send!
      </button>
    </div>
  );
};

export const FriendElement = ({
  friend,
  onClickNewChat,
  onClickDeleteFriend,
}) => {
  return (
    <div className="flex p-1 my-1">
      <Avatar
        src="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg"
        sizex="12"
        sizey="12"
      />
      <div className="flex-1 pl-2 overflow-hidden">
        <p className="font-semibold text-2xl block">{friend.user}</p>
        <p className="block truncate text-xl max-w-max">
          You've been friends since {friend.since}
        </p>
      </div>
      <div className="inline-flex">
        <button
          onClick={() => {
            onClickNewChat(friend.user);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline h-10 w-10 mr-5 p-2 cursor-pointer bg-blue-500 rounded-full hover:border-opacity-100 hover:bg-white border border-blue-600 fill-current text-white hover:text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
        <button
          onClick={() => {
            onClickDeleteFriend();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline h-10 w-10 mr-5 p-2 cursor-pointer bg-red-600 rounded-full hover:border-opacity-100 hover:bg-white border border-red-600 fill-current text-white hover:text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const FriendRequest = ({ friend, onClick }) => {
  return (
    <div className="flex p-1 my-1">
      <Avatar
        src="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg"
        sizex="12"
        sizey="12"
      />
      <div className="flex-1 pl-2 overflow-hidden">
        <p className="font-semibold text-2xl block">{friend.user}</p>
        <p className="block truncate text-xl max-w-max">
          Wants to be your friend.
        </p>
      </div>
      <div className="inline-flex">
        <button
          onClick={(e) => {
            e.preventDefault();
            console.log("Aceptada: " + friend.id);
            onClick(friend, true);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline h-10 w-10 mr-5 p-2 cursor-pointer bg-green-500 rounded-full hover:border-opacity-100 hover:bg-white border border-green-600 fill-current text-white hover:text-green-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            console.log("Rechazada: " + friend.id);
            onClick(friend, false);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline h-10 w-10 mr-5 p-2 cursor-pointer bg-red-600 rounded-full hover:border-opacity-100 hover:bg-white border border-red-600 fill-current text-white hover:text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

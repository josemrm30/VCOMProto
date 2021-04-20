import { render } from "react-dom";
import { MessageCard } from "../components/chatcards";

export const ChatInputBox = () => {
  return(
    <div class="inline-flex mt-2 container-bg">
      <textarea class="inline w-full"></textarea>
      <button className="mx-3 btn-black inline">Send</button>
    </div>
  );
}

export const ChatContainer = ({ children }) => {
  return (
    <div class="flex items-strech flex-col flex-1 mr-2 mt-2 p-1 overflow-auto">
      <div className="inline-flex justify-center text-3xl container-bg">
        <p className="flex-1 inline text-center mt-3 font-bold">Chatting with User1</p>
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
      </div>
      <div className="mt-2 container-bg">
        <MessageCard
          username="User1"
          msg="Hello, wanna play some videogames later?"
          pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg"
        />
        <MessageCard
          username="You"
          msg="yeah, sure"
          pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg"
        />
        <MessageCard
          username="User1"
          msg="K, what do u want to play??"
          pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg"
        />
        <MessageCard
          username="User1"
          msg="Wanna play RoR2? :3"
          pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg"
        />
        <MessageCard
          username="You"
          msg="Sure thing"
          pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg"
        />
        <MessageCard
          username="User1"
          msg="Nice! cya"
          pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg"
        />
      </div>
      <ChatInputBox/>
      {children}
    </div>
  );
};

import { UserChatCard } from "./chatcards";

export const SideBar = (props) => {
  return (
    <div className="inline-block">
      <label
        for="sidebar-menu"
        className="point-cursor lg:hidden block bg-vcom-buttons"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 13l-7 7-7-7m14-8l-7 7-7-7"
          />
        </svg>
      </label>
      <input type="checkbox" className="hidden" id="sidebar-menu" />
      <div
        className="lg:block hidden h-full mr-1 pr-5 pl-3 pt-3 w-60 border-r border-gray-500 bg-gray-800"
        id="sidebar-movil"
      >
        <ul>
          {Object.entries(props.chats).map(([id, chat]) => {
            const last = chat.msgs[chat.msgs.length - 1];
            console.log("LAST MSG ENTRY", last);
            const lastmsg = last != undefined ? last.msg : "New chat";
            return (
              <UserChatCard
                key={chat.id}
                username={chat.username}
                lastmsg={lastmsg}
                pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg"
                selected={props.actualChat && chat.id == props.actualChat.id}
                onClick={() => {
                  props.ononSideBarClick(chat);
                }}
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
};

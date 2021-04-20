import { GroupChatCard, UserChatCard } from "./chatcards";

export const SideBar = () => {

  return (
    <div class="inline-block">
      <label
        for="sidebar-menu"
        className="point-cursor lg:hidden block bg-white"
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
        className="lg:block hidden h-screen mr-1 pr-5 pl-3 pt-3 w-60 border-r border-gray-500 bg-gray-800"
        id="sidebar-movil"
      >
        <ul>
          <li className="mb-3">
            <UserChatCard
              username="User1"
              lastmsg="Helloaaaaaaaa"
              pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg"
              selected={true}
            />
          </li>
          <li className="mb-3">
            <UserChatCard
              username="User2"
              lastmsg="How are you doing todayaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaasaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa?"
              pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg"
              selected={false}
            />
          </li>
          <li>
            <UserChatCard
              username="User3"
              lastmsg="XD"
              pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg"
              selected={false}
            />
          </li>
          <li>
            <GroupChatCard
              groupname="Apple HQ"
              lastmsg="aas"
              lastmsgnick="Juanjo"
              selected={false}
            />
          </li>
        </ul>
      </div>
    </div>
  );
};

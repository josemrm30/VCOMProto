import { GroupChatCard, UserChatCard } from "./chatcards";

export const SideBar = (props) => {
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
          {Object.entries(props.users).map(([id, user]) => {
            return (
                <UserChatCard
                  key={id}
                  username={user}
                  lastmsg="Helloaaaaaaaa"
                  pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg"
                  selected={true}
                  onClick={()=>{
                    props.ononSideBarClick( user );
                  }}
                />
            );
          })}
        </ul>
      </div>
    </div>
  );
};

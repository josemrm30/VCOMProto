import Link from "next/link";
import Image from "next/image";
import { Avatar } from "./avatar";
import { UserPart } from "./userPart";

class NavElement {
  constructor(href, text) {
    this.href = href;
    this.text = text;
  }
}

export const NavBarItem = ({ href, text }) => {
  return (
    <li>
      <a
        className="lg:p-4 py-3 px-0 block hover:bg-indigo-500 text-center"
        href={href}
      >
        {text}
      </a>
    </li>
  );
};
export const NavBarList = ({ elements }) => {
  return (
    <nav>
      <ul className="lg:flex items-center justify-between text-base text-white pt-4 lg:pt-0">
        {elements.map((element) => (
          <NavBarItem href={element.href} text={element.text} />
        ))}
      </ul>
    </nav>
  );
};

export const NavBar = (props) => {
  const navArr = [
    new NavElement("/main", "Main"),
    new NavElement("/main/friends", "Friends")
  ];

  var aux;
  if (typeof window !== 'undefined') {
    aux = JSON.parse(window.localStorage.getItem("user")).name;
  }
  else {
    aux = props.user;
  }

  return (
    <header className="lg:px-16 px-6 bg-black flex flex-wrap items-center lg:py-0 py-2">
      <div className="lg:flex flex-1 lg:flex-initial justify-between items-center pr-16">
        <Image
          className="object-fill py-3"
          src="/vcom.png"
          alt="Picture of the author"
          width={100}
          height={30}
        />
      </div>

      <label
        htlmfor="dropdown-menu"
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
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      </label>
      <input type="checkbox" className="hidden" id="dropdown-menu" />
      <div
        className="hidden lg:flex lg:flex-1 lg:items-center lg:w-auto w-full"
        id="menu-movil"
      >
        <NavBarList elements={navArr} />
        <div className="lg:flex lg:flex-1 lg:items-center lg:justify-end lg:w-auto inline-flex justify-center w-full">
          <p className="text-white inline lg:p-4 py-3 px-0">{aux}</p>
          <UserPart src="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg" />

        </div>
      </div>
    </header>
  );
};

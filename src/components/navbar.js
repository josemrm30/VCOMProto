import Link from "next/link";
import Image from "next/image";

export const NavBar = () => {
  return (
    <header className="lg:px-16 px-6 bg-black flex flex-wrap items-center lg:py-0 py-2">
        <div className="lg:flex flex-1 lg:flex-initial justify-between items-center pr-16">
            <Image className="object-fill py-3" src="/vcom.png" alt="Picture of the author" width={100} height={30} />
        </div>

        <label for="dropdown-menu" className="point-cursor lg:hidden block bg-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
</svg></label>
        <input type="checkbox" className="hidden" id="dropdown-menu"/>
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:w-auto w-full" id="menu-movil">
            <nav>
                <ul className="lg:flex items-center justify-between text-base text-white pt-4 lg:pt-0">
                    <li>
                        <a className="lg:p-4 py-3 px-0 block hover:bg-indigo-500 text-center" href="/login">Login</a>
                    </li>
                    <li>
                        <a className="lg:p-4 py-3 px-0 block hover:bg-indigo-500 text-center" href="/register">Register</a>
                    </li>
                    <li>
                        <a className="lg:p-4 py-3 px-0 block hover:bg-indigo-500 text-center" href="/main">Main</a>
                    </li>
                </ul>
            </nav>
            <div className="lg:flex lg:flex-1 lg:items-center lg:justify-end lg:w-auto inline-flex justify-center w-full">
                <img class="inline object-cover w-10 h-10 mr-1 rounded-full" src="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg" alt="Profile image"/>
                <p className="text-white inline lg:p-4 py-3 px-0">Username</p>
            </div>
        </div>

    </header>
  );
};

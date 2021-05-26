import { useState } from "react";

export const UserPart = ({ src }) => {
    var [menuopened, setMenuOpened] = useState(false);

    const handleLogout = async (e) => {
        e.preventDefault();
        localStorage.removeItem("user");
        window.location.href = 'http://' + window.location.host + '/logout';
    }

    const openList = async (e) => {
        e.preventDefault();
        setMenuOpened(!menuopened);
        /*
        if (!menuopened){
            document.getElementById("openMenu").setAttribute("aria-expanded", true);
            document.getElementById("menuList").setAttribute("style", "");
            menuopened = true;

        }
        else{
            document.getElementById("openMenu").setAttribute("aria-expanded", false);
            document.getElementById("menuList").setAttribute("style", "display: none")
            menuopened = false;
        }*/
    }

    return (
        <>
            <div className="relative">
                <div>
                    <button type="button" className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white" id="openMenu" aria-expanded={menuopened} aria-haspopup="false" onClick={openList}>
                        <span className="sr-only">Open user menu</span>
                        <img className="h-9 w-9 rounded-full" src={src} alt="" />
                    </button>
                </div>
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="openMenu" tabIndex="-1" id="menuList" style={!menuopened ? {display: "none"}:{}}>
                    <button  className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex="-1" id="profile">Your Profile</button>
                    <button  className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex="-1" id="settings">Settings</button>
                    <button onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex="-1" id="signout">Sign out</button>
                </div>
            </div>

        </>
    );


}
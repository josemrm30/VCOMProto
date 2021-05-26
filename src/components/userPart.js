export const UserPart = ({ src }) => {

    var menuopened = false;

    const handleLogout = async (e) => {
        e.preventDefault();
        localStorage.removeItem("user");
        window.location.href = 'http://' + window.location.host + '/logout';
    }

    const openList = async (e) => {
        e.preventDefault();
        if (!menuopened){
            document.getElementById("openMenu").setAttribute("aria-expanded", true);
            document.getElementById("menuList").setAttribute("style", "");
            menuopened = true;

        }
        else{
            document.getElementById("openMenu").setAttribute("aria-expanded", false);
            document.getElementById("menuList").setAttribute("style", "display: none")
            menuopened = false;
        }
    }

    return (
        <>
            <div class="relative">
                <div>
                    <button type="button" class="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white" id="openMenu" aria-expanded="false" aria-haspopup="false" onClick={openList}>
                        <span class="sr-only">Open user menu</span>
                        <img class="h-9 w-9 rounded-full" src={src} alt="" />
                    </button>
                </div>
                <div class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="openMenu" tabindex="-1" id="menuList" style={{ display: "none" }}>
                    <button  class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="profile">Your Profile</button>
                    <button  class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="settings">Settings</button>
                    <button onClick={handleLogout} class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="signout">Sign out</button>
                </div>
            </div>

        </>
    );


}
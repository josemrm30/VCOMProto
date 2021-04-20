import { FriendElement, FriendRequestTextBox } from "../components/friend";
import { Headfoot } from "../components/headfoot";


const Friends = () => {
    return(
        <Headfoot>
            <div class="lg:flex block flex-row w-full mx-auto mt-1">
                <div className="block mx-1 p-5 lg:w-3/5 container-bg">
                    <p className="text-3xl font-bold">Your friends</p>
                    <hr className="w-full my-1" />
                    <FriendElement pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg" text="Friends since DD/MM/YYYY"/>
                    <FriendElement pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg" text="Friends since DD/MM/YYYY"/>
                    <FriendElement pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg" text="Friends since DD/MM/YYYY"/>
                    <FriendElement pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg" text="Friends since DD/MM/YYYY"/>
                    <FriendElement pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg" text="Friends since DD/MM/YYYY"/>
                </div>
                <div className="block mx-1 lg:w-2/5 lg:mt-0 mt-1">
                    <div className="block p-5 container-bg">
                        <p className="text-3xl font-bold">Add friends</p>
                        <hr className="w-full my-1" />
                        <p>Type the username of your friend to add it! Your friend will have to accept your request!</p>
                        <FriendRequestTextBox/> 
                    </div> 
                    <div className="block mt-1 p-5 container-bg">
                        <p className="text-3xl font-bold">Friendship requests</p>  
                        <hr className="w-full my-1" />   
                        <FriendElement pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg" text="Wants to be your friend"/>
                        <FriendElement pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg" text="Wants to be your friend"/>
                        <FriendElement pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg" text="Wants to be your friend"/>
                        <FriendElement pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg" text="Wants to be your friend"/>
                        <FriendElement pp="https://image.freepik.com/vector-gratis/perfil-avatar-hombre-icono-redondo_24640-14044.jpg" text="Wants to be your friend"/>
                    </div> 
                </div>
            </div>
        </Headfoot>
    );
};

export default Friends;
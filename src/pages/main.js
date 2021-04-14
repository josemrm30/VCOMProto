import { Headfoot } from "../components/headfoot";
import { SideBar } from "../components/sidebar";
import { ChatContainer } from "../components/chatcontainers";
const Main = () => {
    return(
        <Headfoot>
            <SideBar />
            <ChatContainer>
            </ChatContainer>
        </Headfoot>
    );
};

export default Main;

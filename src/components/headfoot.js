import { NavBar } from "./navbar";
import {TitleIcon} from "./titleicon";

export const Headfoot = (props) => {
  return (
    <>
      <TitleIcon></TitleIcon>
      <NavBar user={props.user} />
      <div className="flex h-screen w-full max-h-screen max-w-screen">{props.children}</div>
      <script type="text/javascript" src="/adapter.js"></script>
    </>
  );
};

import Link from "next/link";
import { NavBar } from "./navbar";
import {TitleIcon} from "./titleicon";

export const Headfoot = (props) => {
  return (
    <>
      <TitleIcon></TitleIcon>
      <NavBar user={props.user} />
      <div className="flex h-full w-full">{props.children}</div>
    </>
  );
};

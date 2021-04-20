import Link from "next/link";
import {NavBar} from "./navbar";

export const Headfoot = ({ children }) => {
  return (
    <>
      <NavBar/>
      <div className="flex h-full w-full">
        {children}
      </div>
      <script src="/public/js/particles.min.js"></script>
    </>

  );
};
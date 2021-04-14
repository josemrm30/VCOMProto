import Link from "next/link";
import {NavBar} from "./navbar";

export const Headfoot = ({ children }) => {
  return (
    <div>
      <NavBar/>
      <div className="flex">
        {children}
      </div>
      <script src="/public/js/particles.min.js"></script>
    </div>

  );
};
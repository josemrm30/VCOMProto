import Link from "next/link";
import {NavBar} from "./navbar";

export const Headfoot = ({ children }) => {
  return (
    <div>
      <NavBar/>
      <div className="m-2">
        {children}
        <div>Creado por Jose y Manu</div>
      </div>
      <script src="/public/js/particles.min.js"></script>
    </div>

  );
};
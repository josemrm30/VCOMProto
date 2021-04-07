import Link from "next/link";

export const Headfoot = ({ children }) => {
  return (
    <div className="m-2">
      <div className="space-x-16">
        <Link href="/main">Index</Link>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </div>
      {children}
      <div>Creado por Jose y Manu</div>
    </div>
  );
};
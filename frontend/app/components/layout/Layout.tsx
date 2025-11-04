import { AppSidebar } from "../app-sidebar";
import { Header } from "./Header";

import Particles from "../Particles";
import { AdminSidebar } from "../admin/AdminSidebar";
import { useLocation } from "react-router";
// import AppSidebar from "./Sidebar";

export default function MyLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/org");
  return (
    <div className="flex w-full">
      {/* <div className="fixed inset-0 -z-1">
        <Particles
          particleColors={["#0c7171", "#33bdbd"]}
          particleCount={200}
          particleSpread={20}
          speed={0.1}
          particleBaseSize={200}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div> */}
      {isAdmin ? <AdminSidebar /> : <AppSidebar variant="inset" />}
      <div className="w-full">
        <Header />
        <div>
          <main className="md:p-6 bg-white min-h-screen">{children}</main>
        </div>
      </div>
    </div>
  );
}

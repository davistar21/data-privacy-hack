import { AppSidebar } from "../app-sidebar";
import { Header } from "./Header";

import Particles from "../Particles";
import { AdminSidebar } from "../admin/AdminSidebar";
import { useLocation } from "react-router";
import Chatbot from "../Chatbot";
import AdminChatbot from "../AdminChatbot";
// import AppSidebar from "./Sidebar";

export default function MyLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/org");
  const onHomePage = location.pathname == "/";
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
      {!isAdmin && !onHomePage && <AppSidebar variant="inset" />}
      {!onHomePage && (!isAdmin ? <Chatbot /> : <AdminChatbot />)}
      <div className="w-full">
        {!onHomePage && <Header isAdmin={isAdmin} />}
        <div className="pt-24 md:pt-16 bg-white">
          <main
            className={` bg-white min-h-screen ${!onHomePage ? "md:p-6" : ""}`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

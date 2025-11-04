import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "../../components/ui/sidebar";
import { navItems, bottomNavItems } from "../../lib/navigation";
import { Link, NavLink, useParams, useSearchParams } from "react-router"; // adjust if using Next.js Link etc
import { Button } from "../../components/ui/button";
import {
  CircleUser,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  User2Icon,
  Settings,
} from "lucide-react";

export default function AppSidebar() {
  return (
    <Sidebar className="dark:border-gray-900">
      <SidebarContent className="bg-gray-50 dark:bg-[#192c43] shadow-xl text-gray-800 rounded-lg ">
        <SidebarGroup>
          <SidebarGroupLabel className="text-black text-2xl font-semibold text-gradient mb-4 md:m-0 ">
            {/* <Logo className="md:hidden block" /> */}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex gap-1">
              {navItems.map((item) => (
                <SidebarMenuItem
                  key={item.name}
                  className="group rounded-md px-2 py-3 bg-gray-100 hover:text-black hover:bg-gray-200 transition-colors duration-300 dark:bg-gray-900 border-1 dark:border-gray-600"
                >
                  <SidebarMenuButton
                    asChild
                    className="bg-gray-100 hover:text-black dark:bg-gray-900 hover:bg-gray-200 transition-colors duration-300 dark:text-white"
                  >
                    <NavLink to={item.href}>
                      <item.icon />
                      <span>{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter className="flex items-start gap-2 mt-auto">
          <Link
            to="/profile"
            className="flex gap-2 w-full p-3 rounded-md text-sm bg-gray-100 items-center dark:bg-gray-900 border-1 dark:border-gray-600 dark:text-white"
          >
            <User2Icon />
            <div>Profile</div>
          </Link>

          <Link
            to="/settings"
            className="flex gap-2 w-full p-3 rounded-md text-sm bg-gray-100 items-center dark:bg-gray-900 border-1 dark:border-gray-600 dark:text-white"
          >
            <Settings />
            <div>Settings</div>
          </Link>

          <Link
            to="/"
            className="flex gap-2 text-red-600 bg-red-100 w-full p-3 rounded-md text-sm items-center dark:bg-gray-900 border-1 dark:border-gray-600 dark:text-red-500 font-semibold !text-[16px]"
          >
            <LogOut />
            <div>
              <button onClick={() => {}}>Logout</button>
            </div>
          </Link>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}

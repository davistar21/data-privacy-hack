import { ArrowUpRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { SidebarTrigger } from "../components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {/* <SidebarTrigger className="-ml-1" /> */}
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h2 className="text-base font-medium">Consents</h2>
        <div className="ml-auto flex items-center gap-1 text-primary">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex hover:!text-primary-foreground"
          >
            <a
              href="/consents"
              rel="noopener noreferrer"
              target="_blank"
              className="flex gap-1 items-center"
            >
              View
              <ArrowUpRight size={16} />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}

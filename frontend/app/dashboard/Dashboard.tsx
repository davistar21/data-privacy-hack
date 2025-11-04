import PrivacyHealthBar from "../components/PrivacyHealthBar";
import { IncidentBanner } from "../components/IncidentBanner";
import { AppSidebar } from "../components/app-sidebar";
import { ChartAreaInteractive } from "../components/chart-area-interactive";
import { DataTable } from "../components/data-table";
import { SectionCards } from "../components/section-cards";
import { SiteHeader } from "../components/site-header";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";

import data from "./data.json";
import { useConsentStore } from "../stores/ConsentStore";

export default function CitizenDashboard() {
  const { auditLogs } = useConsentStore();
  return (
    // <SidebarProvider
    //   style={
    //     {
    //       "--sidebar-width": "calc(var(--spacing) * 72)",
    //       "--header-height": "calc(var(--spacing) * 12)",
    //     } as React.CSSProperties
    //   }
    // >
    // {/* <AppSidebar variant="inset" /> */}

    <SidebarInset className="!bg-white">
      <div className="text-4xl md:text-5xl font-semibold mb-8">
        Welcome, <span className="text-primary">Eloise</span>
      </div>
      <PrivacyHealthBar
        score={70}
        recommendations={[
          "Enable 2FA for your account",
          "Revoke unused third-party app permissions",
          "Update your password — last change was 6 months ago",
        ]}
      />

      <IncidentBanner incidents={["k"]} />
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={auditLogs} />
          </div>
        </div>
      </div>
    </SidebarInset>

    // </SidebarProvider>
  );
}

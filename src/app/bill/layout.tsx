"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Icon, IconPlus } from "@tabler/icons-react";

const buttonLinks = [
  {
    href: "/bill/add-bill",
    label: "Thêm hóa đơn",
    icon: IconPlus,
    roles: ["admin", "user"],
    agentRoles: ["owner", "member"],
  },
] as {
  href: string;
  label: string;
  icon: Icon;
  roles: ("admin" | "user")[];
  agentRoles?: ("owner" | "member")[];
}[];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      className="w-screen"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Quản lý Bill" buttonLinks={buttonLinks} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">{children}</div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

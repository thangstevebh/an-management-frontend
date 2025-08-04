import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";
import { Icon } from "@tabler/icons-react";
import Link from "next/link";

export function SiteHeader({
  title,
  buttonLinks,
}: {
  title?: string;
  buttonLinks?: {
    href: string;
    label: string;
    icon: Icon;
    roles: ("admin" | "user")[];
    agentRoles?: ("owner" | "member" | "manager")[];
  }[];
}) {
  const { user } = useUser();
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title || "APP"}</h1>
        <div className="ml-auto flex items-center gap-2">
          {buttonLinks?.map(
            (link) =>
              link?.roles?.includes(user?.role) &&
              (user?.role === "admin" ||
                !link?.agentRoles ||
                link.agentRoles.includes(user?.agentRole)) && (
                <Button
                  key={link.href}
                  variant="outline"
                  asChild
                  size="sm"
                  className="hidden sm:flex"
                >
                  <Link
                    href={link.href}
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    {link.icon && <link.icon className="!size-5" size={24} />}

                    {link.label}
                  </Link>
                </Button>
              ),
          )}
        </div>
      </div>
    </header>
  );
}

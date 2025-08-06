"use client";

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="">
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Link href="/bill/add-bill" className="w-full h-full">
              <SidebarMenuButton
                size="lg"
                tooltip="Tạo Bill Nhanh"
                className="hover:cursor-pointer bg-blue-600 text-primary-foreground hover:bg-blue-700 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              >
                <IconCirclePlusFilled className="!size-5" />
                <span className="text-lg">Tạo Bill Nhanh</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname.startsWith(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  size="lg"
                  className={`${isActive ? "bg-gray-200 hover:bg-gray-100 drop-shadow-lg drop-shadow-accent" : ""} hover:drop-shadow-lg`}
                  tooltip={item.title}
                  asChild
                >
                  <Link href={item.url || "#"}>
                    {item.icon && <item.icon className="!size-5" size={24} />}
                    <span className="text-lg">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

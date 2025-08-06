"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { BadgeCheckIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

import { useUser } from "@/hooks/use-user";
import { useAgentStore } from "@/lib/providers/agent-provider";
import { useQuery } from "@tanstack/react-query";
import { ICommonResponse } from "@/lib/constant";
import useAxios from "@/lib/axios/axios.config";
import { useEffect, useMemo } from "react";
import Link from "next/link";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, logout } = useUser();
  const { agent, storeAgent } = useAgentStore((state) => state);

  const {
    data: agentData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["get-agent-by-id", user?.agentId],
    queryFn: async (): Promise<ICommonResponse | null> => {
      try {
        const response = await useAxios.get(`agent/list-agents`, {
          params: {
            _id: user?.agentId,
          },
          headers: {
            "x-agent": (user?.agentId || "") as string,
          },
        });

        if (response?.status !== 200 || response.data?.code !== 200) {
          throw new Error(response.data?.message || "Failed to fetch agent");
        }

        return response.data;
      } catch (error: any) {
        throw error;
      }
    },
    enabled: !!user?.agentId && !!user,
  });

  const agentInfo = useMemo(
    () => agentData?.data.agents?.[0] || {},
    [agentData],
  );

  useEffect(() => {
    storeAgent(agentInfo);
  }, [agentInfo, storeAgent]);

  return (
    <SidebarMenu className="">
      <div className="flex flex-col items-start justify-start gap-2">
        <span className="font-semibold text-lg">Đại lý:</span>
        <div className="py-1 px-2 rounded-md text-primary text-2xl font-bold text-left border relative">
          <span>{agent?.name || "Chưa có đại lý"}</span>
          {agent?.name && agent?.isMain === true && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className="bg-blue-500 text-white dark:bg-blue-600 absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2"
                >
                  <BadgeCheckIcon className="w-3 h-3" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <span className="text-sm">Đại lý chính</span>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <Separator className="mb-4 mt-2" />
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="border drop-shadow-lg data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-gray-200 text-gray-500 font-bold text-lg">
                  {user?.firstName.charAt(0).toUpperCase() || "A"}
                  {user?.lastName.charAt(0).toUpperCase() || "N"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 items-center text-left text-lg leading-tight">
                <span className="truncate font-medium">
                  {user?.firstName} {user?.lastName}
                  {user?.role === "admin" && (
                    <Badge
                      variant="secondary"
                      className="ml-4 bg-blue-500 text-white dark:bg-blue-600"
                    >
                      Admin
                    </Badge>
                  )}
                  {user?.role !== "admin" && user?.agentRole === "owner" && (
                    <Badge
                      variant="secondary"
                      className="ml-4 bg-blue-500 text-white dark:bg-blue-600"
                    >
                      Owner
                    </Badge>
                  )}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.phoneNumber}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-gray-200 text-gray-500 font-bold text-lg">
                    {user?.firstName.charAt(0).toUpperCase() || "A"}
                    {user?.lastName.charAt(0).toUpperCase() || "N"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-lg leading-tight">
                  <span className="truncate font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.phoneNumber}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/account/">
                <DropdownMenuItem className="text-lg">
                  <IconUserCircle className="!size-5" />
                  Tài khoản của tôi
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="text-lg">
                <IconCreditCard className="!size-5" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="text-lg">
                <IconNotification className="!size-5" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-lg" onClick={() => logout()}>
              <IconLogout className="!size-5" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

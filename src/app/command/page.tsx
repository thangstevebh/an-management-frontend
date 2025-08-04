"use client";

import { Button } from "@/components/ui/button";
import LoadingThreeDot from "@/components/ui/loading-three-dot";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { ICommonResponse } from "@/lib/constant";
import { CommandStatus, ICommand } from "@/lib/interface/command-interface";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { IAgent } from "@/components/agent/agent-detail";

enum CommandType {
  WITHDRAW = "withdraw",
  INCOMMING = "incomming",
}

export default function Page() {
  const { user, isAdmin } = useUser();

  const [status, setStatus] = useState<CommandStatus | "all">(
    CommandStatus.PENDING,
  );
  const [commandType, setCommandType] = useState<CommandType>(
    CommandType.INCOMMING,
  );
  const [agent, setAgent] = useState<string | null>(null);

  const { data: commandsData, isLoading } = useQuery({
    queryKey: [
      "admin-list-commands-by-admin",
      isAdmin,
      status,
      commandType,
      agent,
    ],
    queryFn: async (): Promise<ICommonResponse> => {
      const agentIdFilter = agents.filter(
        (agentItem: IAgent) => agentItem.name === agent,
      )[0]?._id;
      try {
        const response = await useAxios.get<ICommonResponse<ICommand[]>>(
          `admin/list-commands-by-admin`,
          {
            params: {
              order: "ASC",
              commandType: commandType,
              status: status === "all" ? undefined : status,
              ...(agent ? { agentId: agentIdFilter } : {}),
            },
            headers: {},
          },
        );

        if (response?.status !== 200 || response.data?.code !== 200) {
          throw new Error(
            `${response.data?.message || "Failed to fetch commands"}`,
          );
        }

        toast.success("Card fetched successfully", {
          description: "The card details have been successfully retrieved.",
        });

        return response.data;
      } catch (error: any) {
        toast.error(`Lấy thông tin tất cả lệnh thất bại`, {
          description: "Xin hãy thử lại sau.",
        });
        throw error;
      }
    },
    enabled: !!isAdmin,
  });

  const { data: getAgents, isLoading: getAgentsLoading } = useQuery({
    queryKey: ["list-agents"],
    queryFn: async () => {
      const response = await useAxios.get(`agent/list-agents`, {
        params: {
          page: 1,
          limit: 100,
        },
        headers: {
          "x-agent": (user?.agentId || "") as string,
        },
      });
      if (response?.status !== 200 && response.data?.code !== 200) {
        toast.error(
          `Failed to fetch agents, ${response.data?.message || "Unknown error"}`,
        );
        return [];
      }
      return response.data.data;
    },
    enabled: !!isAdmin,
  });

  const commands: ICommand[] = useMemo(() => {
    return (commandsData?.data?.commands as ICommand[]) || [];
  }, [commandsData]);

  const agents = useMemo(() => {
    return getAgents?.agents || [];
  }, [getAgents]);

  return (
    <div>
      <div className="flex flex-col h-full w-full items-center justify-center">
        <h1 className="text-2xl font-bold">Chức năng đang được phát triển</h1>
        <div className="w-full max-w-3xl mt-4">
          <Tabs defaultValue="incomming" className="w-full">
            <TabsList>
              <TabsTrigger
                onClick={() => setCommandType(CommandType.INCOMMING)}
                value="incomming"
              >
                Lệnh nạp tiền
              </TabsTrigger>
              <TabsTrigger
                onClick={() => setCommandType(CommandType.WITHDRAW)}
                value="withdraw"
              >
                Lệnh rút tiền
              </TabsTrigger>
            </TabsList>
            <TabsContent value="incomming">
              <div className="flex justify-start gap-1 items-center mt-6 mb-4">
                <Select
                  value={status}
                  onValueChange={(value: string) => {
                    if (value === "all") {
                      setStatus("all" as CommandStatus);
                    } else {
                      setStatus(value as CommandStatus);
                    }
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"all"}>ALL</SelectItem>
                    {Object.values(CommandStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {!getAgentsLoading && (
                  <Select
                    value={
                      agents?.length > 0
                        ? agents.find(
                            (agentItem: IAgent) => agentItem?.name === agent,
                          )?.name
                        : ""
                    }
                    onValueChange={(value: string) => {
                      console.log("Selected agent:", value);
                      if (value === "remove") {
                        setAgent(null);
                      } else {
                        setAgent(value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={"remove"}>ALL</SelectItem>
                      {getAgents?.agents.map((agent: IAgent) => (
                        <SelectItem key={agent?._id} value={agent.name}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid gap-6">
                {isLoading ? (
                  <LoadingThreeDot />
                ) : (
                  commands?.map((command: ICommand) => (
                    <div
                      key={command?._id}
                      className={cn(
                        "flex flex-col gap-1 p-4 border rounded-lg hover:shadow-md transition-shadow duration-200",
                      )}
                    >
                      <div className="w-full grid grid-cols-2 gap-2">
                        <p>
                          Đại lý:{" "}
                          {typeof command?.agentId !== "string" ? (
                            <span className="text-blue-500 font-semibold text-xl">
                              {command?.agentId?.name}{" "}
                            </span>
                          ) : (
                            <span>"Không có đại lý"</span>
                          )}
                        </p>
                        <p>
                          Card:{" "}
                          <span className="font-semibold">
                            {typeof command.cardId !== "string"
                              ? `${command?.cardId?.name} - ${command?.cardId?.lastNumber} - ${command?.cardId?.bankCode}`
                              : command.cardId}
                          </span>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <p className="">
                          Code:{" "}
                          <span className="font-semibold">{command.code}</span>
                        </p>
                        <p>
                          Created At:{" "}
                          <span className="font-semibold">
                            {new Date(command.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <p>
                          Status:{" "}
                          <span className="uppercase font-semibold">
                            {command.status === CommandStatus.PENDING ? (
                              <span className="text-yellow-500">
                                {command.status}
                              </span>
                            ) : command.status === CommandStatus.APPROVED ? (
                              <span className="text-green-500">
                                {command.status}
                              </span>
                            ) : (
                              <span className="text-red-500">
                                {command.status}
                              </span>
                            )}
                          </span>
                        </p>
                        <p>
                          Note:{" "}
                          <span className="font-semibold truncate">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-pointer">
                                  {command.note || "Không có ghi chú"}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent
                                className="max-w-[300px] text-sm text-wrap break-words"
                                side="top"
                                sideOffset={5}
                                align="start"
                              >
                                <span className="">
                                  {command.note || "Không có ghi chú"}
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                        </p>
                      </div>
                      <p>
                        Amount:{" "}
                        <span className="font-semibold text-green-500">
                          {"+" +
                            String(command.incommingAmount).replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ".",
                            ) +
                            " VND"}
                        </span>
                      </p>
                      {command.status === CommandStatus.PENDING && (
                        <>
                          <Separator className="my-2" />
                          <div className="flex justify-end">
                            <div className="flex gap-2">
                              <Button className="bg-red-500 hover:bg-red-600 text-white">
                                Reject
                              </Button>
                              <Button className="bg-green-500 hover:bg-green-600 text-white">
                                Approve
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="withdraw">
              <div className="flex justify-between items-center mt-6 mb-4">
                <Select
                  value={status}
                  onValueChange={(value: string) => {
                    if (value === "all") {
                      setStatus("all" as CommandStatus);
                    } else {
                      setStatus(value as CommandStatus);
                    }
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"all"}>ALL</SelectItem>
                    {Object.values(CommandStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

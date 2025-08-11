"use client";

import { Button } from "@/components/ui/button";
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
import { ICommonResponse, IPagemeta } from "@/lib/constant";
import { CommandStatus, ICommand } from "@/lib/interface/command-interface";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<CommandStatus | "all">(
    CommandStatus.PENDING,
  );
  const [commandType, setCommandType] = useState<CommandType>(
    CommandType.INCOMMING,
  );
  const [agent, setAgent] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [commands, setCommands] = useState<ICommand[]>([]);
  const [isHaveMore, setIsHaveMore] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setAgent(null);
      setStatus(CommandStatus.PENDING);
      setPage(1);
      setCommands([]);
    } else {
      setAgent(user?.agentId || null);
      setStatus(CommandStatus.PENDING);
      setPage(1);
      setCommands([]);
    }
  }, [isAdmin, user?.agentId]);

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
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const agents = useMemo(() => {
    return getAgents?.agents || [];
  }, [getAgents]);

  const { data: commandsData, isLoading: isGetCommandsAdminLoading } = useQuery(
    {
      queryKey: [
        "admin-list-commands-by-admin",
        isAdmin,
        status,
        commandType,
        agent,
        page,
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
                order: "DESC",
                commandType: commandType,
                status: status === "all" ? undefined : status,
                page,
                limit: 10,
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

          return response.data;
        } catch (error: any) {
          toast.error(`Lấy thông tin tất cả lệnh thất bại`, {
            description: "Xin hãy thử lại sau.",
          });
          throw error;
        }
      },
      enabled: !!isAdmin,
      staleTime: 5000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  );

  const { data: commandsUserData, isLoading: isGetCommandsUserLoading } =
    useQuery({
      queryKey: [
        "list-commands-by-user",
        status,
        commandType,
        user?.agentId,
        isAdmin,
        page,
      ],
      queryFn: async (): Promise<ICommonResponse> => {
        try {
          const response = await useAxios.get<ICommonResponse<ICommand[]>>(
            `agent/list-commands`,
            {
              params: {
                order: "DESC",
                commandType: commandType,
                status: status === "all" ? undefined : status,
                page,
                limit: 10,
              },
              headers: {
                "x-agent": (user?.agentId || "") as string,
              },
            },
          );

          if (response?.status !== 200 || response.data?.code !== 200) {
            throw new Error(
              `${response.data?.message || "Failed to fetch commands"}`,
            );
          }

          return response.data;
        } catch (error: any) {
          toast.error(`Lấy thông tin tất cả lệnh thất bại`, {
            description: "Xin hãy thử lại sau.",
          });
          throw error;
        }
      },
      enabled: !isAdmin && !!user?.agentId,
      staleTime: 5000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    });

  const confirmCommandMutation = useMutation({
    mutationKey: ["confirm-command", commandType, isAdmin],

    mutationFn: async (payload: {
      confirmCommandId: string;
      status: CommandStatus;
      code: string;
      note?: string | null;
      cardId: string;
    }) => {
      const response = await useAxios.post(
        `${commandType === CommandType.INCOMMING ? "admin/confirm-incomming-command" : "admin/confirm-withdraw-command"}/${payload.cardId}`,
        {
          confirmCommandId: payload.confirmCommandId,
          status: payload.status,
          code: payload.code,
          note: payload.note || null,
        },
      );
      return response.data;
    },

    onSuccess: (data) => {
      setPage(1);
      setCommands([]);
      setStatus(CommandStatus.PENDING);
      queryClient.invalidateQueries({
        queryKey: [
          "admin-list-commands-by-admin",
          isAdmin,
          status,
          commandType,
          agent,
          1,
        ],
      });
      toast.success("Xác nhận lệnh thành công", {
        description: "Lệnh đã được xác nhận thành công.",
      });
    },

    onError: (error) => {
      toast.error("Xác nhận lệnh thất bại", {
        description: "Vui lòng kiểm tra lại thông tin và thử lại.",
      });
    },
  });

  const commandsQuery: ICommand[] = useMemo(() => {
    const commandsAdmin = commandsData?.data?.commands as ICommand[];
    const commandsUser = commandsUserData?.data?.commands as ICommand[];
    return isAdmin ? commandsAdmin : commandsUser || [];
  }, [isAdmin, commandsData, commandsUserData]);

  const pagemeta: IPagemeta | undefined = useMemo(() => {
    return isAdmin
      ? commandsData?.data?.pagemeta
      : commandsUserData?.data?.pagemeta;
  }, [commandsData, commandsUserData, isAdmin]);

  useEffect(() => {
    setIsHaveMore(pagemeta?.hasNextPage || false);
  }, [pagemeta]);

  useEffect(() => {
    if (commandsQuery && commandsQuery.length > 0) {
      setCommands((prev) => {
        const newCommands = commandsQuery.filter(
          (newCmd) =>
            !prev.some((existingCmd) => existingCmd._id === newCmd._id),
        );
        return [...prev, ...newCommands];
      });

      setIsHaveMore(
        isAdmin
          ? commandsData?.data?.pagemeta?.hasNextPage
          : commandsUserData?.data?.pagemeta?.hasNextPage,
      );
    }
  }, [commandsQuery, isAdmin, commandsData, commandsUserData]);

  return (
    <div>
      <div className="flex flex-col h-full w-full items-center justify-center">
        <h1 className="text-2xl font-bold">
          {isAdmin ? "Quản lý lệnh" : "Danh sách lệnh của bạn"}
        </h1>
        <div className="w-full max-w-3xl mt-4">
          <Tabs defaultValue="incomming" className="w-full">
            <TabsList>
              <TabsTrigger
                onClick={() => {
                  setCommandType(CommandType.INCOMMING);
                  setPage(1);
                  setCommands([]);
                  setStatus(CommandStatus.PENDING);
                }}
                value="incomming"
              >
                Lệnh nạp tiền
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setCommandType(CommandType.WITHDRAW);
                  setPage(1);
                  setCommands([]);
                  setStatus(CommandStatus.PENDING);
                }}
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
                      setPage(1);
                      setCommands([]);
                      setStatus("all" as CommandStatus);
                    } else {
                      setPage(1);
                      setCommands([]);
                      setStatus(value as CommandStatus);
                    }
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"all"}>Tất cả</SelectItem>
                    {Object.values(CommandStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {(() => {
                          if (status === CommandStatus.PENDING) {
                            return "Đang chờ";
                          } else if (status === CommandStatus.APPROVED) {
                            return "Đã xác nhận";
                          } else if (status === CommandStatus.REJECTED) {
                            return "Đã từ chối";
                          } else if (status === CommandStatus.CANCELLED) {
                            return "Đã hủy";
                          }
                          return "Không xác định";
                        })()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {!getAgentsLoading && isAdmin && (
                  <Select
                    value={
                      agents?.length > 0
                        ? agents.find(
                            (agentItem: IAgent) => agentItem?.name === agent,
                          )?.name
                        : ""
                    }
                    onValueChange={(value: string) => {
                      if (value === "all") {
                        setPage(1);
                        setCommands([]);
                        setAgent(null);
                      } else {
                        setPage(1);
                        setCommands([]);
                        setAgent(value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Chọn đại lý" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={"all"}>Tất cả</SelectItem>
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
                {commands.length === 0 ? (
                  <div>
                    <p className="text-center text-gray-500">
                      Không có lệnh nào được tìm thấy.
                    </p>
                    <p className="text-center text-gray-500">
                      Vui lòng thử lại sau hoặc kiểm tra lại các bộ lọc.
                    </p>
                  </div>
                ) : (
                  commands?.map((command: ICommand) => (
                    <div
                      key={command?._id}
                      className={cn(
                        "flex flex-col gap-1 p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 bg-accent",
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
                          Thẻ:{" "}
                          <span className="font-semibold">
                            {typeof command.cardId !== "string"
                              ? `${command?.cardId?.name} - ${command?.cardId?.lastNumber} - ${command?.cardId?.bankCode}`
                              : command.cardId}
                          </span>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <p className="">
                          Mã:{" "}
                          <span className="font-semibold">{command.code}</span>
                        </p>
                        <p>
                          Tạo vào ngày:{" "}
                          <span className="font-semibold">
                            {(() => {
                              const date = new Date(command.createdAt);
                              const day = date
                                .getDate()
                                .toString()
                                .padStart(2, "0");
                              const month = (date.getMonth() + 1)
                                .toString()
                                .padStart(2, "0");
                              const year = date.getFullYear();
                              return `${day}-${month}-${year}`;
                            })()}
                          </span>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <p>
                          Trạng thái:{" "}
                          <span className="uppercase font-semibold">
                            {command.status === CommandStatus.PENDING ? (
                              <span className="text-yellow-500">Đang chờ</span>
                            ) : command.status === CommandStatus.APPROVED ? (
                              <span className="text-green-500">
                                Đã xác nhận
                              </span>
                            ) : (
                              <span className="text-red-500">
                                {(() => {
                                  if (
                                    command.status === CommandStatus.REJECTED
                                  ) {
                                    return "Đã từ chối";
                                  } else if (
                                    command.status === CommandStatus.CANCELLED
                                  ) {
                                    return "Đã hủy";
                                  }
                                  return "Không xác định";
                                })()}
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
                        Số tiền:{" "}
                        <span className="font-semibold text-green-500">
                          {"+" +
                            String(command.incommingAmount).replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ",",
                            ) +
                            " VND"}
                        </span>
                      </p>
                      {command.status === CommandStatus.PENDING && isAdmin && (
                        <>
                          <Separator className="my-2" />
                          <div className="flex justify-end">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  confirmCommandMutation.mutate({
                                    confirmCommandId: command._id,
                                    status: CommandStatus.REJECTED,
                                    code: command.code,
                                    note: "Lệnh bị từ chối bởi admin",
                                    cardId:
                                      typeof command.cardId !== "string"
                                        ? command?.cardId?._id
                                        : command?.cardId,
                                  });
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Từ chối
                              </Button>
                              <Button
                                onClick={() => {
                                  confirmCommandMutation.mutate({
                                    confirmCommandId: command._id,
                                    status: CommandStatus.APPROVED,
                                    code: command.code,
                                    note: "Lệnh đã được xác nhận bởi admin",
                                    cardId:
                                      typeof command.cardId !== "string"
                                        ? command?.cardId?._id
                                        : command?.cardId,
                                  });
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Xác nhận
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
              <div className="flex justify-start gap-1 items-center mt-6 mb-4">
                <Select
                  value={status}
                  onValueChange={(value: string) => {
                    if (value === "all") {
                      setPage(1);
                      setCommands([]);
                      setStatus("all" as CommandStatus);
                    } else {
                      setPage(1);
                      setCommands([]);
                      setStatus(value as CommandStatus);
                    }
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"all"}>Tất cả</SelectItem>
                    {Object.values(CommandStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {(() => {
                          if (status === CommandStatus.PENDING) {
                            return "Đang chờ";
                          } else if (status === CommandStatus.APPROVED) {
                            return "Đã xác nhận";
                          } else if (status === CommandStatus.REJECTED) {
                            return "Đã từ chối";
                          } else if (status === CommandStatus.CANCELLED) {
                            return "Đã hủy";
                          }
                          return "Không xác định";
                        })()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!getAgentsLoading && isAdmin && (
                  <Select
                    value={
                      agents?.length > 0
                        ? agents.find(
                            (agentItem: IAgent) => agentItem?.name === agent,
                          )?.name
                        : ""
                    }
                    onValueChange={(value: string) => {
                      if (value === "all") {
                        setPage(1);
                        setCommands([]);
                        setAgent(null);
                      } else {
                        setPage(1);
                        setCommands([]);
                        setAgent(value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={"remove"}>Tất cả</SelectItem>
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
                {commands.length === 0 ? (
                  <div>
                    <p className="text-center text-gray-500">
                      Không có lệnh nào được tìm thấy.
                    </p>
                    <p className="text-center text-gray-500">
                      Vui lòng thử lại sau hoặc kiểm tra lại các bộ lọc.
                    </p>
                  </div>
                ) : (
                  commands?.map((command: ICommand) => (
                    <div
                      key={command?._id}
                      className={cn(
                        "flex flex-col gap-1 p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 bg-accent",
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
                          Thẻ:{" "}
                          <span className="font-semibold">
                            {typeof command.cardId !== "string"
                              ? `${command?.cardId?.name} - ${command?.cardId?.lastNumber} - ${command?.cardId?.bankCode}`
                              : command.cardId}
                          </span>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <p className="">
                          Mã:{" "}
                          <span className="font-semibold">{command.code}</span>
                        </p>
                        <p>
                          Tạo vào ngày:{" "}
                          <span className="font-semibold">
                            {(() => {
                              const date = new Date(command.createdAt);
                              const day = date
                                .getDate()
                                .toString()
                                .padStart(2, "0");
                              const month = (date.getMonth() + 1)
                                .toString()
                                .padStart(2, "0");
                              const year = date.getFullYear();
                              return `${day}-${month}-${year}`;
                            })()}
                          </span>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <p>
                          Trạng thái:{" "}
                          <span className="uppercase font-semibold">
                            {command.status === CommandStatus.PENDING ? (
                              <span className="text-yellow-500">Đang chờ</span>
                            ) : command.status === CommandStatus.APPROVED ? (
                              <span className="text-green-500">
                                Đã xác nhận
                              </span>
                            ) : (
                              <span className="text-red-500">
                                {(() => {
                                  if (
                                    command.status === CommandStatus.REJECTED
                                  ) {
                                    return "Đã từ chối";
                                  } else if (
                                    command.status === CommandStatus.CANCELLED
                                  ) {
                                    return "Đã hủy";
                                  }
                                  return "Không xác định";
                                })()}
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
                        Số tiền:{" "}
                        <span className="font-semibold text-red-500">
                          {"-" +
                            String(command?.withdrawRequestedAmount).replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ",",
                            ) +
                            " VND"}
                        </span>
                      </p>
                      {command.status === CommandStatus.PENDING && isAdmin && (
                        <>
                          <Separator className="my-2" />
                          <div className="flex justify-end">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  confirmCommandMutation.mutate({
                                    confirmCommandId: command._id,
                                    status: CommandStatus.REJECTED,
                                    code: command.code,
                                    note: "Lệnh bị từ chối bởi admin",
                                    cardId:
                                      typeof command.cardId !== "string"
                                        ? command?.cardId?._id
                                        : command?.cardId,
                                  });
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                Từ chối
                              </Button>
                              <Button
                                onClick={() => {
                                  confirmCommandMutation.mutate({
                                    confirmCommandId: command._id,
                                    status: CommandStatus.APPROVED,
                                    code: command.code,
                                    note: "Lệnh đã được xác nhận bởi admin",
                                    cardId:
                                      typeof command.cardId !== "string"
                                        ? command?.cardId?._id
                                        : command?.cardId,
                                  });
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                Xác nhận
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
          </Tabs>
        </div>
        {(isGetCommandsAdminLoading || isGetCommandsUserLoading) && (
          <div className="flex justify-center items-center mt-4">
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        )}
        {isHaveMore && (
          <Button
            onClick={() => {
              setPage((prev) => prev + 1);
            }}
            className="mt-4"
            disabled={
              isGetCommandsAdminLoading ||
              isGetCommandsUserLoading ||
              !isHaveMore
            }
          >
            Tải thêm
          </Button>
        )}
      </div>
    </div>
  );
}

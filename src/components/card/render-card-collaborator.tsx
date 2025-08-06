"use client";

import { CardData, CollaboratorData } from "@/app/card/[id]/page";
import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import LoadingThreeDot from "../ui/loading-three-dot";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SelectCollaboratorCombobox } from "./select-card-collaborator";
import { IconUserCode, IconUserPlus } from "@tabler/icons-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useParams } from "next/navigation";

export default function RenderCollaborator({
  cardCollaboratorData,
  isLoading,
  error,
}: {
  cardCollaboratorData: CollaboratorData | null;
  isLoading: boolean;
  error: any;
}) {
  const { user } = useUser();
  const { id } = useParams();

  const [wasSubmitted, setWasSubmitted] = useState(false);
  const [isNewCollaborator, setIsNewCollaborator] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState("");
  const queryClient = useQueryClient();

  const handleCollaboratorSelect = (value: string) => {
    setNewCollaborator(value);
    setIsNewCollaborator(false);
    setWasSubmitted(false);
  };
  const debouncedNewCollaborator = useDebounce(newCollaborator, 500);

  const { data: collaborator, isLoading: queryIsLoading } = useQuery({
    queryKey: ["get-collaborator", user?.agentId, debouncedNewCollaborator],
    queryFn: async () => {
      const response = await useAxios.get(`card/list-collaborators`, {
        params: {
          name: debouncedNewCollaborator,
          page: 1,
          limit: 1,
        },
        headers: {
          "x-agent": (user?.agentId || "") as string,
        },
      });
      if (response?.status !== 200 && response.data?.code !== 200) {
        toast.error(
          `Failed to fetch cards, ${response.data?.message || "Unknown error"}`,
        );
        return [];
      }
      return response.data.data;
    },
    enabled: !!user?.agentId && !!debouncedNewCollaborator,
    staleTime: 5000,
  });

  const updateCardMutation = useMutation({
    mutationKey: ["update-card", id, wasSubmitted],
    mutationFn: async (updateData: Partial<CardData>) => {
      const response = await useAxios.patch(
        `/card/update-card/${id}`,
        {
          ...updateData,
        },
        {
          headers: {
            "x-agent": (user?.agentId || "") as string,
          },
        },
      );

      if (response?.status !== 200 || response.data?.code !== 200) {
        throw new Error(response.data?.message || "Failed to update card");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Card updated successfully");
      queryClient.invalidateQueries({ queryKey: ["get-card-by-id", id] });
    },
    onError: (error: any) => {
      toast.error(
        `Failed to update card: ${error.response?.data?.message || error.message}`,
      );
    },
  });

  const createCardCollaboratorMutation = useMutation({
    mutationKey: [
      "create-card-collaborator",
      user?.agentId,
      debouncedNewCollaborator,
    ],
    mutationFn: async ({ name }: { name: string }) => {
      const response = await useAxios.post(
        `agent/add-collaborator-card`,
        {
          name,
        },
        {
          headers: {
            "x-agent": (user?.agentId || "") as string,
          },
        },
      );

      if (response?.status !== 200 && response.data?.code !== 200) {
        toast.error("Tạo thẻ cộng tác viên thất bại", {
          description: "Vui lòng kiểm tra lại thông tin và thử lại.",
        });
        return;
      }
      return response.data;
    },
    onError: (error) => {
      toast.error("Tạo cộng tác viên thẻ thất bại", {
        description: "Vui lòng kiểm tra lại thông tin và thử lại.",
      });
      console.error("Error creating card:", error);
    },
    onSuccess: (data) => {
      if (data) {
        toast.success("Tạo cộng tác viên thẻ thành công");
        queryClient.invalidateQueries({ queryKey: ["get-collaborator"] });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["get-card-by-id", id] });
    },
    retry: 1,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (
      newCollaborator &&
      isNewCollaborator === false &&
      collaborator?.collaborators?.length > 0
    ) {
      updateCardMutation.mutate({
        cardCollaboratorId: collaborator?.collaborators[0]._id,
      });
      setIsHaveCollaborator(true);
      setWasSubmitted(true);
      setNewCollaborator("");
      setIsNewCollaborator(false);
    }
  }, [
    isNewCollaborator,
    newCollaborator,
    debouncedNewCollaborator,
    collaborator,
    updateCardMutation,
  ]);

  const [isHaveCollaborator, setIsHaveCollaborator] = useState(true);

  useEffect(() => {
    if (cardCollaboratorData) {
      setIsHaveCollaborator(true);
    } else {
      setIsHaveCollaborator(false);
    }
  }, [cardCollaboratorData, setIsHaveCollaborator]);

  const handleEnterNewCollaborator = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter" && newCollaborator.trim()) {
      if (debouncedNewCollaborator) {
        createCardCollaboratorMutation.mutateAsync({
          name: debouncedNewCollaborator,
        });
      }
      setWasSubmitted(true);
      setNewCollaborator(debouncedNewCollaborator);
      setIsNewCollaborator(false);
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg shadow-md border flex-1 w-full max-w-[500px] mx-auto">
      <h2 className="text-lg font-semibold mb-1">Cộng tác viên thẻ</h2>
      {isLoading ? (
        <LoadingThreeDot />
      ) : error ? (
        <div className="text-red-500">
          Error: {error.message || "Failed to load card detail"}
        </div>
      ) : !cardCollaboratorData ? (
        <>
          <div className="flex flex-col items-start justify-baseline gap-2">
            <div className="flex items-center w-full gap-2">
              {isNewCollaborator === false ? (
                <SelectCollaboratorCombobox
                  onValueChange={handleCollaboratorSelect}
                />
              ) : (
                <Input
                  className="flex-1"
                  id="newCollaborator"
                  name="newCollaborator"
                  type="string"
                  placeholder="Nhập tên cộng tác viên mới"
                  onChange={(e) => {
                    setNewCollaborator(e.currentTarget.value?.trim());
                  }}
                  onKeyDown={handleEnterNewCollaborator}
                />
              )}
              <div
                onClick={() => setIsNewCollaborator(!isNewCollaborator)}
                className={cn(
                  "select-none flex items-center gap-2 h-9 px-4 py-2 has-[>svg]:px-3 rounded-lg bg-zinc-100 text-gray-400 hover:bg-zinc-200 transition-colors cursor-pointer",
                  isNewCollaborator
                    ? "bg-blue-100 text-blue-800"
                    : "bg-zinc-100",
                )}
              >
                <IconUserPlus className="!size-6" size={24} />
                <span>Tạo mới</span>
              </div>
            </div>
          </div>
        </>
      ) : isHaveCollaborator ? (
        <div className="flex flex-1 justify-between items-center">
          <span className="border rounded-lg px-2 py-1 bg-gray-100 text-blue-700 w-64 font-semibold">
            {cardCollaboratorData.name}
          </span>
          <Button
            variant="outline"
            className="ml-auto"
            onClick={() => {
              setIsHaveCollaborator(false);
            }}
          >
            <IconUserCode className="!size-6" size={24} />
            Chuyển
          </Button>
        </div>
      ) : (
        !isHaveCollaborator && (
          <>
            <div className="flex flex-col items-start justify-baseline gap-2">
              <div className="flex items-center w-full gap-2">
                {isNewCollaborator === false ? (
                  <SelectCollaboratorCombobox
                    onValueChange={handleCollaboratorSelect}
                  />
                ) : (
                  <Input
                    className="flex-1"
                    id="newCollaborator"
                    name="newCollaborator"
                    type="string"
                    placeholder="Nhập tên cộng tác viên mới"
                    onChange={(e) => {
                      setNewCollaborator(e.currentTarget.value?.trim());
                    }}
                    onKeyDown={handleEnterNewCollaborator}
                  />
                )}
                <div
                  onClick={() => setIsNewCollaborator(!isNewCollaborator)}
                  className={cn(
                    "select-none flex items-center gap-2 h-9 px-4 py-2 has-[>svg]:px-3 rounded-lg bg-zinc-100 text-gray-400 hover:bg-zinc-200 transition-colors cursor-pointer",
                    isNewCollaborator
                      ? "bg-blue-100 text-blue-800"
                      : "bg-zinc-100",
                  )}
                >
                  <IconUserPlus className="!size-6" size={24} />
                  <span>Tạo mới</span>
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}

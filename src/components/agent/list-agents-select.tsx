"use client";

import { toast } from "sonner";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PosData } from "../pos/pos-by-id";
import { IAgent } from "./agent-detail";
import { useCallback, useState } from "react";

export default function ListAgentsSelect({ posData }: { posData: PosData }) {
  const { user, isAdmin } = useUser();
  const queryClient = useQueryClient();

  const { data: getAgents, isLoading } = useQuery({
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
  });

  const agents = getAgents?.agents || [];
  const updatePosMutation = useMutation({
    mutationKey: ["update-pos", posData?._id],
    mutationFn: async (updateData: Partial<PosData>) => {
      const response = await useAxios.patch(
        `pos-terminal/update-pos-terminal/${posData?._id}`,
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
        throw new Error(response.data?.message || "Failed to update pos");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("POS updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["get-pos-by-id", posData?._id],
      });
    },
    onError: (error: any) => {
      toast.error(
        `Failed to update pos: ${error.response?.data?.message || error.message}`,
      );
    },
  });

  const handleChange = useCallback(
    (value: string) => {
      updatePosMutation.mutate({ agentId: value });
    },
    [updatePosMutation],
  );

  return (
    <div className="flex flex-col">
      <Label className="block py-2 text-2xl font-bold">Đại lý</Label>
      <Select
        defaultValue={posData?.agentId || ""}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Chọn đại lý" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Đại lý</SelectLabel>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <span>Loading...</span>
              </div>
            ) : (
              agents.map((agent: IAgent) => (
                <SelectItem key={agent._id} value={agent._id}>
                  {agent.name}
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

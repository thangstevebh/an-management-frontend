import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxios from "../axios/axios.config";
import { ICommonResponse } from "../constant";

export const useListCardsQueryUserOptions = (
  payload: {
    user: { agentId?: string; role?: string } | null;
  },
  options: UseQueryOptions,
) => {
  options = {
    retry: 1,
    ...options,
  };
  return useQuery({
    queryFn: async () => {
      const response = await useAxios.get<ICommonResponse>(`card/list-cards`, {
        params: {
          order: "ASC",
          isActive: true,
        },
        headers: {
          "x-agent": (payload.user?.agentId || "") as string,
        },
      });
      if (response?.status !== 200 && response.data?.code !== 200) {
        toast.error(
          `Failed to fetch cards, ${response.data?.message || "Unknown error"}`,
        );
        return [];
      }
      return response.data;
    },
    ...options,
    enabled: !!payload,
  });
};

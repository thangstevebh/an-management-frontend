import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxios from "../axios/axios.config";

interface ICommonResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

interface ICardData {
  id: string;
  name: string;
}

interface UseGetCardByIdOptions {
  id: string;
  user: {
    agentId?: string;
  } | null;
}

export const useGetCardById = (options: UseGetCardByIdOptions) => {
  const { id, user } = options;

  return useQuery<any | null, Error>({
    queryKey: ["get-card-by-id-with-option", id],
    queryFn: async (): Promise<ICardData | null> => {
      try {
        const response = await useAxios.get<ICommonResponse<ICardData>>(
          `/card/get-card-by-id`,
          {
            params: {
              cardId: id,
            },
            headers: {
              "x-agent": (user?.agentId || "") as string,
            },
          },
        );

        if (response?.status !== 200 || response.data?.code !== 200) {
          throw new Error(response.data?.message || "Failed to fetch card");
        }

        toast.success("Card fetched successfully", {
          description: "The card details have been successfully retrieved.",
        });
        return response.data.data;
      } catch (error: any) {
        toast.error(`Failed to fetch card: ${error.message}`);
        throw error;
      }
    },
    enabled: !!user?.agentId && !!id,
    retry: 1,
  });
};

"use client";

import { AgentDetail, IAgent } from "@/components/agent/agent-detail";
import { AgentMembersTable } from "@/components/agent/agent-members";
import { ButtonBack } from "@/components/ui/button-back";
import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

export default function Page() {
  const { id } = useParams();
  const { user, isAdmin } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin && user?.agentId && id !== user.agentId) {
      router.push(`/agent/${user.agentId}`);
    }
  }, [isAdmin, user?.agentId, id, router]);

  const { data: getAgentById, isLoading } = useQuery({
    queryKey: ["get-agent-by-id"],
    queryFn: async () => {
      const response = await useAxios.get(`agent/list-agents`, {
        params: {
          page: 1,
          limit: 1,
          _id: id || "",
          isOwnerPopulate: true,
        },
        headers: {
          "x-agent": (user?.agentId || "") as string,
        },
      });
      if (response?.status !== 200 && response.data?.code !== 200) {
        toast.error(
          `Failed to fetch agent, ${response.data?.message || "Unknown error"}`,
        );
        return [];
      }
      return response.data;
    },
    enabled: !!user?.agentId && !isAdmin,
    staleTime: 5000,
  });

  const agent = useMemo(
    () => getAgentById?.data?.agents[0] as IAgent,
    [getAgentById],
  );

  return (
    <div>
      <ButtonBack />
      <div className="flex flex-col gap-4">
        {!isAdmin && agent && <AgentDetail agent={agent} />}
      </div>
      <div className="mt-12">
        <AgentMembersTable />
      </div>
    </div>
  );
}

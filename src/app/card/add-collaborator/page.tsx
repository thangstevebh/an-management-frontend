"use client";

import { CollaboratorData } from "@/components/card/collaborator-data";
import { Button } from "@/components/ui/button";
import { ButtonBack } from "@/components/ui/button-back";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { user } = useUser();
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState("");

  const debouncedNewCollaborator = useDebounce(newCollaborator, 500);

  const queryClient = useQueryClient();

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
        queryClient.invalidateQueries({
          queryKey: ["get-collaborator", wasSubmitted],
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["get-collaborators"] });
      setWasSubmitted(true);
      setNewCollaborator("");
    },
    retry: 1,
    retryDelay: 1000,
  });

  const handleEnterNewCollaborator = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter" && newCollaborator.trim()) {
      if (debouncedNewCollaborator) {
        createCardCollaboratorMutation.mutateAsync({
          name: debouncedNewCollaborator,
        });
      }
      e.preventDefault();
    }
  };
  return (
    <div>
      <ButtonBack />

      <h1 className="text-2xl font-semibold text-center mb-6">
        Thêm cộng tác viên
      </h1>
      <p className="text-center mb-4 text-gray-500">
        Bạn có thể thêm cộng tác viên mới để quản lý thẻ. Vui lòng nhập tên cộng
        tác viên và nhấn "Tạo" để thêm vào danh sách cộng tác viên.
      </p>

      <div className="max-w-92 flex items-center justify-center mx-auto gap-4 mb-6">
        <Input
          className="max-w-lg"
          id="newCollaborator"
          name="newCollaborator"
          type="string"
          value={newCollaborator}
          placeholder="Nhập tên cộng tác viên mới"
          onChange={(e) => {
            setNewCollaborator(e.currentTarget.value?.trim());
          }}
          onKeyDown={handleEnterNewCollaborator}
        />

        <Button
          type="submit"
          className="max-w-xs"
          disabled={createCardCollaboratorMutation.isPending}
          onClick={() => {
            if (debouncedNewCollaborator) {
              createCardCollaboratorMutation.mutateAsync({
                name: debouncedNewCollaborator,
              });
            }
          }}
        >
          {createCardCollaboratorMutation.isPending ? "Đang tạo..." : "Tạo"}
        </Button>
      </div>

      <div className="h-full max-w-[960px] mx-auto px-4 lg:px-6">
        <CollaboratorData />
      </div>
    </div>
  );
}

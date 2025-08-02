"use client";

import { Button } from "@/components/ui/button";
import { ButtonBack } from "@/components/ui/button-back";
import { ValidatedInput } from "@/components/ui/input-validate";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { createAgentMemberSchema } from "@/lib/validation/create-agent-member-schema";
import { IconInnerShadowBottomRight, IconUserPlus } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { user } = useUser();
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const [agentRole, setAgentRole] = useState<"member" | "manager">("member");

  const formRef = useRef<HTMLFormElement>(null);

  const createAgentMemberMutation = useMutation({
    mutationKey: ["create-agent-member", user?.agentId, wasSubmitted],
    mutationFn: async (payload: {
      username: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      agentRole: "member" | "owner" | "manager";
    }) => {
      const response = await useAxios.post(
        `agent/add-agent-member`,
        {
          ...payload,
        },
        {
          headers: {
            "x-agent": (user?.agentId || "") as string,
          },
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      setWasSubmitted(false);
      if (formRef.current) {
        formRef.current.reset();
      }
      toast.success("Tạo thành viên thành công", {
        description: "Thẻ đã được tạo thành công và có thể sử dụng ngay.",
      });
    },
    onError: (error) => {
      toast.error("Tạo thành viên thất bại", {
        description: "Vui lòng kiểm tra lại thông tin và thử lại.",
      });
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const checkData = {
      username: formData.get("username") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      agentRole: agentRole,
    };

    /*
     * Zod validation can be added here if needed
     * */
    const validationResult = createAgentMemberSchema.safeParse(checkData);
    if (!validationResult.success) {
      setWasSubmitted(true);
      event.preventDefault();
      return;
    }

    const createPayload: {
      username: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      agentRole: "member" | "manager";
    } = {
      username: formData.get("username") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      agentRole,
    };

    await createAgentMemberMutation.mutateAsync({
      ...createPayload,
    });
  };

  return (
    <div>
      <ButtonBack />
      <div className="flex flex-col h-full w-full items-center justify-center">
        <h1 className="text-2xl font-bold">Tạo thành viên</h1>
        <p className="text-gray-500 text-center mt-2">
          Bạn có thể tạo thẻ mới cho cộng tác viên của mình. Vui lòng điền đầy
          đủ thông tin và nhấn "Tạo" để hoàn tất.
        </p>
      </div>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-full max-w-md mx-auto flex flex-col gap-3 mt-6"
      >
        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="username">
            Tên đăng nhập:
          </Label>
          <ValidatedInput
            name="username"
            type="string"
            placeholder="username123"
            wasSubmitted={wasSubmitted}
            fieldSchema={createAgentMemberSchema.shape["username"]}
          />
        </div>

        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="firstName">
            Họ:
          </Label>
          <ValidatedInput
            className=""
            name="firstName"
            type="string"
            placeholder="John"
            wasSubmitted={wasSubmitted}
            fieldSchema={createAgentMemberSchema.shape["firstName"]}
          />
        </div>
        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="lastName">
            Tên:
          </Label>
          <ValidatedInput
            className=""
            name="lastName"
            type="string"
            placeholder="Doe"
            wasSubmitted={wasSubmitted}
            fieldSchema={createAgentMemberSchema.shape["lastName"]}
          />
        </div>

        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="phoneNumber">
            Số điện thoại:
          </Label>
          <ValidatedInput
            className=""
            name="phoneNumber"
            type="string"
            placeholder="0901234567"
            wasSubmitted={wasSubmitted}
            fieldSchema={createAgentMemberSchema.shape["phoneNumber"]}
          />
        </div>
        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="agentRole">
            Vai trò trong đại lý:
          </Label>
          <Select
            onValueChange={(value) => {
              setAgentRole(value as "member" | "manager");
            }}
            defaultValue={agentRole}
            value={agentRole}
            name="agentRole"
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center space-x-4 mt-4">
          <Button
            type="submit"
            className="w-full max-w-xs"
            disabled={createAgentMemberMutation.isPending}
          >
            {createAgentMemberMutation.isPending
              ? "Đang tạo..." +
                (
                  <IconInnerShadowBottomRight className="animate-spin h-8 w-8 text-blue-500 !size-6" />
                )
              : "Tạo"}
          </Button>
        </div>
      </form>
    </div>
  );
}

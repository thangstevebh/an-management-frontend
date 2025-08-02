"use client";

import { ButtonBack } from "@/components/ui/button-back";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { getCookie } from "cookies-next/client";
import { ACCESS_TOKEN_KEY } from "@/lib/constant";
import { createAgentSchema } from "@/lib/validation/create-agent.schema";
import { ValidatedInput } from "@/components/ui/input-validate";
import { useRef, useState } from "react";
import { IconInnerShadowBottomRight } from "@tabler/icons-react";
import { toast } from "sonner";

export default function Page() {
  const [wasSubmitted, setWasSubmitted] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const accessToken = getCookie(ACCESS_TOKEN_KEY) as string | null;

  const createAgentMutation = useMutation({
    mutationKey: ["create-agent"],
    mutationFn: async ({
      agentName,
      username,
      firstName,
      lastName,
      phoneNumber,
      isMain,
    }: {
      agentName: string;
      username: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      isMain: boolean;
    }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/agent/create-agent-by-admin`,
        {
          method: "POST" as const,
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
          body: JSON.stringify({
            agentName,
            username,
            firstName,
            lastName,
            phoneNumber,
            isMain,
          }),
        },
      );
      if (!response.ok)
        toast.error("Tạo thẻ thất bại", {
          description: "Vui lòng kiểm tra lại thông tin và thử lại.",
        });
      if (response.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn", {
          description: "Vui lòng đăng nhập lại.",
        });
        return;
      }
      return response.json();
    },

    onSuccess: (data) => {
      // clear the form submission state
      setWasSubmitted(false);
      if (formRef.current) {
        formRef.current.reset();
      }
      toast.success("Tạo đại lý thành công", {
        description: "Đại lý đã được tạo thành công.",
      });
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const agentData = {
      agentName: formData.get("agent"),
      username: formData.get("username"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      phoneNumber: formData.get("phoneNumber"),
      isMain: formData.get("isMain") === "on" ? true : false,
    };

    /*
     * Zod validation can be added here if needed
     * */
    const validationResult = createAgentSchema.safeParse(agentData);
    if (!validationResult.success) {
      setWasSubmitted(true);
      event.preventDefault();
      return;
    }
    createAgentMutation.mutate({
      ...validationResult.data,
    });
  };

  return (
    <div>
      <ButtonBack />
      <div className="flex flex-col items-center justify-start h-full w-full">
        <h1 className="text-2xl font-bold mb-4">Tạo đại lý</h1>
        <p className="text-lg mb-6 text-gray-500">
          Admin có thể tạo mới đại lý
        </p>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="w-full max-w-md flex flex-col gap-3 mt-4"
        >
          <div className="flex flex-col items-start justify-between gap-2">
            <Label className="" htmlFor="agent">
              Tên đại lý:
            </Label>
            <ValidatedInput
              className=""
              name="agent"
              type="string"
              placeholder="Đại lý 1"
              wasSubmitted={wasSubmitted}
              fieldSchema={createAgentSchema.shape["agentName"]}
            />
          </div>

          <div className="flex flex-col items-start justify-between gap-2">
            <Label className="" htmlFor="username">
              Username:
            </Label>
            <ValidatedInput
              className=""
              name="username"
              type="string"
              placeholder="nguyenabc"
              wasSubmitted={wasSubmitted}
              fieldSchema={createAgentSchema.shape["username"]}
            />
          </div>

          <div className="flex flex-col items-start justify-between gap-2">
            <Label htmlFor="firstName">Họ:</Label>
            <ValidatedInput
              className=""
              name="firstName"
              type="string"
              placeholder="Nguyễn Văn"
              wasSubmitted={wasSubmitted}
              fieldSchema={createAgentSchema.shape["firstName"]}
            />
          </div>

          <div className="flex flex-col items-start justify-between gap-2">
            <Label htmlFor="lastName">Tên:</Label>
            <ValidatedInput
              className=""
              name="lastName"
              type="string"
              placeholder="A"
              wasSubmitted={wasSubmitted}
              fieldSchema={createAgentSchema.shape["lastName"]}
            />
          </div>

          <div className="flex flex-col items-start justify-between gap-2">
            <Label htmlFor="phoneNumber">Số điện thoại:</Label>
            <ValidatedInput
              className=""
              name="phoneNumber"
              type="string"
              placeholder="09612345678"
              wasSubmitted={wasSubmitted}
              fieldSchema={createAgentSchema.shape["phoneNumber"]}
            />
          </div>
          <div className="flex items-center gap-4">
            <Label className="max-w-[200px]" htmlFor="isMain">
              Đại lý chính:
            </Label>
            <Checkbox id="isMain" name="isMain" aria-label="is main" />
          </div>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Button
              type="submit"
              className="w-full max-w-xs"
              disabled={createAgentMutation.isPending}
            >
              {createAgentMutation.isPending
                ? "Đang tạo..." +
                  (
                    <IconInnerShadowBottomRight className="animate-spin h-8 w-8 text-blue-500 !size-6" />
                  )
                : "Tạo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

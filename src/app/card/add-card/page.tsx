"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ButtonBack } from "@/components/ui/button-back";
import { ValidatedInput } from "@/components/ui/input-validate";
import { Label } from "@/components/ui/label";
import { createCardSchema } from "@/lib/validation/create-card-schema";
import { IconInnerShadowBottomRight, IconUserPlus } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { SelectCollaboratorCombobox } from "@/components/card/select-card-collaborator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import useAxios from "@/lib/axios/axios.config";
import { useUser } from "@/hooks/use-user";
import { CollaboratorData } from "../[id]/page";

export default function Page() {
  const { user } = useUser();
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const [isNewCollaborator, setIsNewCollaborator] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  const createCardMutation = useMutation({
    mutationKey: ["create-card", wasSubmitted],
    mutationFn: async ({
      name,
      bankCode,
      lastNumber,
      defaultFeePercent,
      feeBack,
      maturityDate,
      cardCollaboratorId,
    }: {
      name: string;
      bankCode: string;
      lastNumber: string;
      defaultFeePercent: number;
      feeBack: number;
      maturityDate: Date;
      cardCollaboratorId: string | null;
    }) => {
      const response = await useAxios.post(
        `agent/add-card`,
        {
          name,
          bankCode,
          lastNumber,
          defaultFeePercent,
          feeBack,
          maturityDate,
          cardCollaboratorId,
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
      toast.success("Tạo thẻ thành công", {
        description: "Thẻ đã được tạo thành công.",
      });
    },
    onError: (error) => {
      toast.error("Tạo thẻ thất bại", {
        description: "Vui lòng kiểm tra lại thông tin và thử lại.",
      });
      console.error("Error creating card:", error);
    },
  });

  const createCardCollaboratorMutation = useMutation({
    mutationKey: ["create-card-collaborator", user?.agentId],
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
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const collaboratorData = {
      name: formData.get("name") as string,
      bankCode: formData.get("bankCode") as string,
      lastNumber: formData.get("lastNumber") as string,
      defaultFeePercent: formData.get("defaultFeePercent") as string,
      feeBack: formData.get("feeBack") as string,
      maturityDate: formData.get("maturityDate") as string,
    };

    /*
     * Zod validation can be added here if needed
     * */
    const validationResult = createCardSchema.safeParse(collaboratorData);
    if (!validationResult.success) {
      setWasSubmitted(true);
      event.preventDefault();
      return;
    }

    const createCardPayload: {
      name: string;
      bankCode: string;
      lastNumber: string;
      defaultFeePercent: number;
      feeBack: number;
      maturityDate: Date;
      cardCollaboratorId: string | null;
    } = {
      name: collaboratorData.name.trim(),
      bankCode: collaboratorData.bankCode.trim(),
      lastNumber: collaboratorData.lastNumber.trim(),
      defaultFeePercent: parseFloat(collaboratorData.defaultFeePercent),
      feeBack: parseFloat(collaboratorData.feeBack),
      maturityDate: new Date(collaboratorData?.maturityDate),
      cardCollaboratorId: null,
    };

    let newCollaboratorCreated: CollaboratorData | null = null;

    if (newCollaborator) {
      const createdCollaboratorMutation =
        await createCardCollaboratorMutation.mutateAsync({
          name: newCollaborator,
        });
      if (createdCollaboratorMutation.code !== 200) {
        toast.error("Tạo cộng tác viên thất bại", {
          description: "Vui lòng kiểm tra lại thông tin và thử lại.",
        });
        return;
      }
      newCollaboratorCreated = createdCollaboratorMutation.data.collaborator;
    }

    createCardPayload.cardCollaboratorId = newCollaboratorCreated?._id || null;

    await createCardMutation.mutateAsync({
      ...createCardPayload,
    });
  };
  const handleCollaboratorSelect = (value: string) => {
    setNewCollaborator(value);
    setIsNewCollaborator(false);
    setWasSubmitted(false);
  };

  return (
    <div>
      <ButtonBack />
      <div className="flex flex-col items-center justify-start w-full">
        <h1 className="text-2xl font-bold mb-4">Thêm thẻ mới</h1>
        <p className="text-center mb-4 text-gray-500">
          Bạn có thể thêm thẻ mới để quản lý giao dịch. Vui lòng nhập thông tin
          thẻ và chọn cộng tác viên nếu cần.
        </p>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="w-full max-w-md flex flex-col gap-3 mt-4"
        >
          <div className="flex flex-col items-start justify-between gap-2">
            <Label className="" htmlFor="name">
              Tên thẻ:
            </Label>
            <ValidatedInput
              name="name"
              type="string"
              placeholder="Nguyễn Văn A"
              wasSubmitted={wasSubmitted}
              fieldSchema={createCardSchema.shape["name"]}
            />
          </div>

          <div className="flex flex-col items-start justify-between gap-2">
            <Label className="" htmlFor="bankCode">
              Tên ngân hàng:
            </Label>
            <ValidatedInput
              className=""
              name="bankCode"
              type="string"
              placeholder="Ngân hàng ACB"
              wasSubmitted={wasSubmitted}
              fieldSchema={createCardSchema.shape["bankCode"]}
            />
          </div>
          <div className="flex flex-col items-start justify-between gap-2">
            <Label className="" htmlFor="lastNumber">
              Số cuối thẻ (4 chữ số):
            </Label>
            <ValidatedInput
              className=""
              name="lastNumber"
              type="string"
              placeholder="1234"
              wasSubmitted={wasSubmitted}
              fieldSchema={createCardSchema.shape["lastNumber"]}
            />
          </div>

          <div className="flex flex-col items-start justify-between gap-2">
            <Label className="" htmlFor="defaultFeePercent">
              Phí mặc định (%):
            </Label>
            <ValidatedInput
              className=""
              name="defaultFeePercent"
              type="float"
              placeholder="1.30"
              wasSubmitted={wasSubmitted}
              fieldSchema={createCardSchema.shape["defaultFeePercent"]}
            />
          </div>

          <div className="flex flex-col items-start justify-between gap-2">
            <Label className="" htmlFor="feeBack">
              Phí hoàn lại (%):
            </Label>
            <ValidatedInput
              className=""
              name="feeBack"
              type="float"
              placeholder="0.5"
              wasSubmitted={wasSubmitted}
              fieldSchema={createCardSchema.shape["feeBack"]}
            />
          </div>

          <div className="flex flex-col items-start justify-between gap-2">
            <Label className="" htmlFor="maturityDate">
              Ngày hết hạn:
            </Label>
            <ValidatedInput
              className=""
              name="maturityDate"
              type="date"
              placeholder="2023-12-31"
              wasSubmitted={wasSubmitted}
              fieldSchema={createCardSchema.shape["maturityDate"]}
            />
          </div>
          <div className="flex flex-col items-start justify-baseline gap-2">
            <Label className="mt-4" htmlFor="collaboratorId">
              Chọn cộng tác viên để liên kết với thẻ này.
            </Label>
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

          <div className="flex items-center justify-center space-x-4 mt-4">
            <Button
              type="submit"
              className="w-full max-w-xs"
              disabled={createCardMutation.isPending}
            >
              {createCardMutation.isPending ? (
                <>
                  Đang tạo...
                  <IconInnerShadowBottomRight className="animate-spin h-8 w-8 text-blue-500 !size-6" />
                </>
              ) : (
                "Tạo"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ButtonBack } from "@/components/ui/button-back";
import { ValidatedInput } from "@/components/ui/input-validate";
import { Label } from "@/components/ui/label";
import { IconInnerShadowBottomRight, IconUserPlus } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useAxios from "@/lib/axios/axios.config";
import { useUser } from "@/hooks/use-user";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createPosSchema,
  PosTerminalType,
} from "@/lib/validation/create-pos.schema";

export default function Page() {
  const { user } = useUser();
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const [selectedPosType, setSelectedPosType] = useState<PosTerminalType>(
    PosTerminalType.WIFI,
  );

  const formRef = useRef<HTMLFormElement>(null);

  const createPosMutation = useMutation({
    mutationKey: ["create-pos-by-admin", wasSubmitted],
    mutationFn: async ({
      name,
      feeBack,
      feePerDay,
      feePerTerminal,
      posType,
    }: {
      name: string;
      feePerDay: number;
      feePerTerminal: number;
      feeBack: number;
      posType: PosTerminalType;
    }) => {
      const response = await useAxios.post(
        `admin/add-pos-terminal`,
        {
          name,
          feePerDay,
          feePerTerminal,
          feeBack,
          posType,
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
      toast.success("Tạo máy POS thành công", {
        description: "Máy POS đã được tạo thành công.",
      });
    },
    onError: (error) => {
      toast.error("Tạo thẻ thất bại", {
        description: "Vui lòng kiểm tra lại thông tin và thử lại.",
      });
      console.error("Error creating card:", error);
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const formPosData = {
      name: formData.get("name") as string,
      feePerDay: formData.get("feePerDay") as string,
      feePerTerminal: formData.get("feePerTerminal") as string,
      feeBack: formData.get("feeBack") as string,
      posType: selectedPosType as PosTerminalType,
    };

    /*
     * Zod validation can be added here if needed
     * */
    const validationResult = createPosSchema.safeParse(formPosData);
    if (!validationResult.success) {
      setWasSubmitted(true);
      event.preventDefault();
      return;
    }

    const createPosPayload: {
      name: string;
      feePerDay: number;
      feePerTerminal: number;
      feeBack: number;
      posType: PosTerminalType;
    } = {
      name: validationResult.data.name,
      feePerDay: parseFloat(String(validationResult.data.feePerDay)),
      feePerTerminal: parseFloat(String(validationResult.data.feePerTerminal)),
      feeBack: parseFloat(String(validationResult.data.feeBack)),
      posType: validationResult.data.posType,
    };

    await createPosMutation.mutateAsync({
      ...createPosPayload,
    });
  };

  return (
    <div>
      <ButtonBack />
      <div className="flex flex-col items-center justify-start w-full">
        <h1 className="text-2xl font-bold mb-4">Thêm thẻ mới</h1>
        <p className="text-center mb-4 text-gray-500">
          Bạn có thể tạo máy POS mới để quản lý giao dịch. Vui lòng nhập thông
          tin máy POS và nhấn "Tạo" để thêm vào danh sách máy POS.
        </p>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="w-full max-w-md flex flex-col gap-3 mt-4"
        >
          <div className="flex flex-col items-start justify-between gap-2">
            <Label className="" htmlFor="name">
              Tên:
            </Label>
            <ValidatedInput
              name="name"
              type="string"
              placeholder="POS TEMINAL 01"
              wasSubmitted={wasSubmitted}
              fieldSchema={createPosSchema.shape["name"]}
            />
          </div>

          <div className="flex flex-col items-start justify-between gap-2">
            <Label className="" htmlFor="feePerDay">
              Phí theo ngày (%):
            </Label>
            <ValidatedInput
              className=""
              name="feePerDay"
              type="float"
              placeholder="1.30"
              wasSubmitted={wasSubmitted}
              fieldSchema={createPosSchema.shape["feePerDay"]}
            />
          </div>

          <div className="flex flex-col items-start justify-between gap-2">
            <Label className="" htmlFor="feePerTerminal">
              Phí theo máy (%):
            </Label>
            <ValidatedInput
              className=""
              name="feePerTerminal"
              type="float"
              placeholder="1.30"
              wasSubmitted={wasSubmitted}
              fieldSchema={createPosSchema.shape["feePerTerminal"]}
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
              fieldSchema={createPosSchema.shape["feeBack"]}
            />
          </div>

          <div className="flex flex-col items-start justify-between gap-2">
            <Label className="" htmlFor="posType">
              Loại máy:
            </Label>
            <Select
              defaultValue={PosTerminalType.WIFI}
              onValueChange={(value) =>
                setSelectedPosType(value as PosTerminalType)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Vui lòng chọn ..." />
              </SelectTrigger>
              <SelectContent id="posType">
                <SelectGroup>
                  <SelectLabel>POS</SelectLabel>
                  {Object.values(PosTerminalType).map((typePos) => (
                    <SelectItem key={typePos} value={typePos}>
                      {typePos}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center space-x-4 mt-4">
            <Button
              type="submit"
              className="w-full max-w-xs"
              disabled={createPosMutation.isPending}
            >
              {createPosMutation.isPending
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

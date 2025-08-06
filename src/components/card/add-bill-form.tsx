import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { ValidatedInput } from "../ui/input-validate";
import { IconInnerShadowBottomRight } from "@tabler/icons-react";
import { addBillSchema } from "@/lib/validation/add-bill-schema";
import { Label } from "../ui/label";

export default function AddBillForm({
  cardId,
  posTerminalId,
}: {
  cardId: string | null;
  posTerminalId: string | null;
}) {
  const { user } = useUser();
  const [wasSubmitted, setWasSubmitted] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const addBillMutation = useMutation({
    mutationKey: ["add-bill", user?._id, wasSubmitted, cardId, posTerminalId],
    mutationFn: async (payload: {
      amount: number;
      lot: string;
      billNumber: string;
      customerFee: number;
      posFee: number;
      posFeePerDay: number;
      backFee: number;
      note?: string;
      cardId: string;
      posTerminalId: string;
    }) => {
      const { cardId, ...restPayload } = payload;
      const response = await useAxios.post(
        `agent/add-bill/${cardId}`,
        {
          ...restPayload,
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
      toast.success("Thêm bill thành công", {
        description: "Bạn đã thêm bill thành công.",
      });
    },
    onError: (error) => {
      toast.error("Thêm bill thất bại", {
        description: "Vui lòng kiểm tra lại thông tin và thử lại.",
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWasSubmitted(true);
    const formData = new FormData(event.currentTarget);
    const amountString = formData.get("amount") as string;
    const cleanedAmountString = amountString.replace(/\,/g, "");
    const amount = parseFloat(cleanedAmountString);

    const checkData = {
      amount: String(amount),
      lot: formData.get("lot") as string,
      billNumber: formData.get("billNumber") as string,
      customerFee: formData.get("customerFee") as string,
      posFee: formData.get("posFee") as string,
      posFeePerDay: formData.get("posFeePerDay") as string,
      backFee: formData.get("backFee") as string,
      note: formData.get("note") as string,
      cardId: cardId,
      posTerminalId: posTerminalId,
    };

    /*
     * Zod validation can be added here if needed
     * */
    const validationResult = addBillSchema.safeParse(checkData);
    if (!validationResult.success) {
      setWasSubmitted(true);
      event.preventDefault();
      return;
    }
    const createPayload: {
      amount: number;
      lot: string;
      billNumber: string;
      customerFee: number;
      posFee: number;
      posFeePerDay: number;
      backFee: number;
      note?: string;
      cardId: string;
      posTerminalId: string;
    } = {
      amount: Number(amount),
      lot: validationResult.data.lot,
      billNumber: validationResult.data.billNumber,
      customerFee: Number(validationResult.data.customerFee),
      posFee: Number(validationResult.data.posFee),
      backFee: Number(validationResult.data.backFee),
      posFeePerDay: Number(validationResult.data.posFeePerDay),
      note: validationResult.data.note || "",
      cardId: validationResult.data.cardId,
      posTerminalId: validationResult.data.posTerminalId,
    };
    addBillMutation.mutate(createPayload);
  };
  return (
    <div className="flex flex-col max-w-[500px] w-full mx-auto gap-2 bg-sidebar-accent rounded-lg px-4 py-6 shadow-lg">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-full mx-auto flex flex-col gap-4"
      >
        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="amount">
            Số tiền:
          </Label>
          <div className="relative w-full">
            <ValidatedInput
              name="amount"
              type="money"
              placeholder="Nhập số tiền"
              wasSubmitted={wasSubmitted}
              fieldSchema={addBillSchema.shape["amount"]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value.replace(/\,/g, "");
                if (/^\d*$/.test(value)) {
                  e.target.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
              }}
            />
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="lot">
            Lot:
          </Label>
          <div className="relative w-full">
            <ValidatedInput
              className=""
              name="lot"
              type="text"
              placeholder="Nhập Lot"
              wasSubmitted={wasSubmitted}
              fieldSchema={addBillSchema.shape["lot"]}
            />
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="billNumber">
            Số hóa đơn:
          </Label>
          <div className="relative w-full">
            <ValidatedInput
              className="pr-10"
              name="billNumber"
              type="text"
              placeholder="Nhập số hóa đơn"
              wasSubmitted={wasSubmitted}
              fieldSchema={addBillSchema.shape["billNumber"]}
            />
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="customerFee">
            Phí khách hàng (%):
          </Label>
          <div className="relative w-full">
            <ValidatedInput
              className="pr-10"
              name="customerFee"
              type="float"
              placeholder="Nhập phí khách hàng"
              wasSubmitted={wasSubmitted}
              fieldSchema={addBillSchema.shape["customerFee"]}
            />
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="posFee">
            Phí POS (%):
          </Label>
          <div className="relative w-full">
            <ValidatedInput
              className="pr-10"
              name="posFee"
              type="float"
              placeholder="Nhập phí POS"
              wasSubmitted={wasSubmitted}
              fieldSchema={addBillSchema.shape["posFee"]}
            />
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="posFeePerDay">
            Phí POS theo ngày (%):
          </Label>
          <div className="relative w-full">
            <ValidatedInput
              className="pr-10"
              name="posFeePerDay"
              type="float"
              placeholder="Nhập phí POS theo ngày"
              wasSubmitted={wasSubmitted}
              fieldSchema={addBillSchema.shape["posFeePerDay"]}
            />
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="backFee">
            Phí hoàn tiền (%):
          </Label>
          <div className="relative w-full">
            <ValidatedInput
              className="pr-10"
              name="backFee"
              type="float"
              placeholder="Nhập phí hoàn tiền"
              wasSubmitted={wasSubmitted}
              fieldSchema={addBillSchema.shape["backFee"]}
            />
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="note">
            Note:
          </Label>
          <div className="relative w-full">
            <ValidatedInput
              className="pr-10"
              name="note"
              type="text"
              placeholder="Nhập ghi chú (tuỳ chọn)"
              wasSubmitted={wasSubmitted}
              fieldSchema={addBillSchema.shape["note"]}
            />
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4 mt-4">
          <Button
            type="submit"
            className="w-full max-w-xs"
            disabled={addBillMutation.isPending}
          >
            {addBillMutation.isPending ? (
              <>
                Đang tạo{" "}
                <IconInnerShadowBottomRight className="animate-spin h-8 w-8 text-blue-500 !size-6" />
              </>
            ) : (
              "Tạo Bill"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

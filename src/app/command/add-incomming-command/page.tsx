"use client";

import CreditCard from "@/components/credit-card";
import CreditCardSkeleton from "@/components/credit-card-skeleton";
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
import { useGetCardById } from "@/lib/queryOptions/get-card-by-id-option";
import { useListCardsQueryUserOptions } from "@/lib/queryOptions/get-list-cards-option";
import { cn } from "@/lib/utils";
import { addIncommingCommandSchema } from "@/lib/validation/add-incomming-command-schema";
import {
  IconCircleCheckFilled,
  IconInnerShadowBottomRight,
} from "@tabler/icons-react";
import {
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [wasSubmitted, setWasSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const searchParams = useSearchParams();
  const cardIdParam = searchParams.get("cardId");
  const [cardId, setCardId] = useState<string | null>("");
  const [listCards, setListCards] = useState<any[]>([]);

  useEffect(() => {
    setCardId(cardIdParam);
  }, [searchParams, cardIdParam]);

  const {
    data: cardData,
    isLoading,
    error: getCardError,
  } = useGetCardById({
    id: cardId || "",
    user: user,
  });

  const { data: listCard, isLoading: getListCardsLoading } =
    useListCardsQueryUserOptions(
      {
        user: user,
      },
      {
        queryKey: ["get-list-cards-by-user", user?._id],
        enabled: !!user && !cardId && !cardIdParam, // Only fetch if user exists and no specific cardId is provided
      },
    ) as UseQueryResult<any, Error>;

  useEffect(() => {
    if (cardData?.card?._id !== 200 && listCard?.data?.cards) {
      setListCards(listCard?.data?.cards);
    }
  }, [cardData?.card?._id, listCard?.data?.cards, cardIdParam]);

  const handleSelectCard = (newValue: string) => {
    const selectedCard = listCards.find((card) => card.name === newValue);

    if (selectedCard) {
      setCardId(selectedCard._id);
      queryClient.invalidateQueries({
        queryKey: ["get-card-by-id", selectedCard._id],
      });
    }
  };

  const addIncomingCommandMutation = useMutation({
    mutationKey: ["add-incoming-command", wasSubmitted, cardId],
    mutationFn: async (data: {
      amount: number;
      cardId: string;
      note?: string;
    }) => {
      const { cardId, amount: incommingAmount, ...restPayload } = data;

      const response = await useAxios.post(
        `agent/add-incoming-command/${cardId}`,
        {
          incommingAmount: incommingAmount,
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
    onSuccess: (data: any) => {
      setWasSubmitted(false);
      if (formRef.current) {
        formRef.current.reset();
      }
      toast.success("Tạo lệnh nạp tiền thành công", {
        description: "Lệnh nạp tiền đã được tạo thành công.",
      });
    },
    onError: (error: any) => {
      toast.error("Tạo lệnh nạp tiền thất bại", {
        description: "Vui lòng kiểm tra lại thông tin và thử lại.",
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWasSubmitted(true);
    const formData = new FormData(event.currentTarget);
    const amountString = formData.get("amount") as string;
    const cleanedAmountString = amountString.replace(/\./g, "");
    const amount = parseFloat(cleanedAmountString);

    const checkData = {
      amount: String(amount),
      note: formData.get("note") as string,
      cardId: cardId,
    };

    /*
     * Zod validation can be added here if needed
     * */
    const validationResult = addIncommingCommandSchema.safeParse(checkData);
    if (!validationResult.success) {
      setWasSubmitted(true);
      event.preventDefault();
      return;
    }

    const createPayload: {
      amount: number;
      note?: string;
      cardId: string;
    } = {
      amount: Number(amount),
      note: validationResult.data.note || "",
      cardId: validationResult.data.cardId,
    };
    addIncomingCommandMutation.mutateAsync({
      ...createPayload,
    });
  };

  return (
    <div className="">
      <ButtonBack />
      <div className="flex flex-col items-center justify-center w-full gap-4 mb-4">
        <h1 className="text-2xl font-bold mb-4">Thêm lệnh nạp tiền vào thẻ</h1>
        <p className="text-center mb-4 text-gray-500">
          Bạn có thể tạo lệnh nạp tiền vào thẻ để quản lý giao dịch. Vui lòng
          nhập thông tin lệnh nạp tiền và nhấn "Tạo" để thêm vào danh sách lệnh
          nạp tiền.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2 h-full w-full items-start justify-start">
          {isLoading ? (
            <CreditCardSkeleton />
          ) : (
            <CreditCard
              name={cardData?.card.name}
              cardNumber={cardData?.card.lastNumber}
              validFrom={cardData?.card.validFrom}
              expiry={cardData?.card.expiry}
              cvv={cardData?.card.cvv}
              colloborator={cardData?.card?.collaborator?.name}
            />
          )}
          {!cardIdParam && (
            <div className="flex flex-col gap-2 justify-center items-center w-full p-4">
              <h2 className="text-lg font-semibold">Danh sách thẻ</h2>
              <div className="relative">
                <Select
                  value={
                    listCards.find((card) => card._id === cardId)?.name || ""
                  }
                  onValueChange={(newValue) => handleSelectCard(newValue)} // Update cardId when a new option is selected
                >
                  <SelectTrigger
                    className={cn(
                      "flex-1 p-2 border w-80 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    )}
                  >
                    <SelectValue placeholder="Chọn thẻ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {listCards.map((card) => (
                        <SelectItem key={card?._id} value={card?.name}>
                          {card?.name} - {card?.lastNumber} - {card?.bankCode}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {cardId && (
                  <IconCircleCheckFilled className="fill-blue-500 absolute inset-y-0 -right-8 my-auto" />
                )}
              </div>
              {!cardId && (
                <p className="text-sm text-red-500 mt-1">
                  Vui lòng chọn thẻ để thêm hoá đơn.
                </p>
              )}
            </div>
          )}
        </div>
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
                  fieldSchema={addIncommingCommandSchema.shape["amount"]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value.replace(/\./g, "");
                    if (/^\d*$/.test(value)) {
                      e.target.value = value.replace(
                        /\B(?=(\d{3})+(?!\d))/g,
                        ".",
                      );
                    }
                  }}
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
                  fieldSchema={addIncommingCommandSchema.shape["note"]}
                />
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4 mt-4">
              <Button
                type="submit"
                className="w-full max-w-xs"
                disabled={addIncomingCommandMutation.isPending}
              >
                {addIncomingCommandMutation.isPending ? (
                  <>
                    Đang tạo{" "}
                    <IconInnerShadowBottomRight className="animate-spin h-8 w-8 text-blue-500 !size-6" />
                  </>
                ) : (
                  "Tạo lệnh nạp tiền"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

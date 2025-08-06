"use client";

import React, { useMemo } from "react";
import { ButtonBack } from "@/components/ui/button-back";
import { useSearchParams } from "next/navigation";
import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useGetCardById } from "@/lib/queryOptions/get-card-by-id-option";
import { useUser } from "@/hooks/use-user";
import CreditCard from "@/components/credit-card";
import CreditCardSkeleton from "@/components/credit-card-skeleton";
import { useListCardsQueryUserOptions } from "@/lib/queryOptions/get-list-cards-option";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import useAxios from "@/lib/axios/axios.config";
import { toast } from "sonner";
import { PosData } from "@/components/pos/pos-by-id";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import AddBillForm from "@/components/card/add-bill-form";

export default function Page() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  const searchParams = useSearchParams();
  const cardIdParam = searchParams.get("cardId");
  const [cardId, setCardId] = React.useState<string | null>("");
  const [listCards, setListCards] = React.useState<any[]>([]);
  const [posTerminalId, setPosTerminalId] = React.useState<any>("");

  React.useEffect(() => {
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

  React.useEffect(() => {
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

  const { data: getPosData, isLoading: getPosIsLoading } = useQuery({
    queryKey: ["list-pos", user?._id, user?.agentId],
    queryFn: async () => {
      const response = await useAxios.get(`agent/list-pos`, {
        params: {
          order: "ASC",
        },
        headers: {
          ...(user?.agentId ? { "x-agent": user.agentId } : {}),
        },
      });
      if (response?.status !== 200 && response.data?.code !== 200) {
        toast.error(
          `Lấy thông tin máy POS thất bại, ${response.data?.message || "Unknown error"}`,
        );
        return [];
      }
      return response.data.data;
    },
    enabled: !!user?.agentId,
    staleTime: 5000,
  });

  const posTerminalsData = useMemo(() => {
    return (getPosData?.posTerminals as PosData[]) || [];
  }, [getPosData]);

  const handleSelectPosTerminal = (newValue: string) => {
    const selectedPos = posTerminalsData.find(
      (pos: PosData) => pos.name === newValue,
    );
    if (selectedPos) {
      setPosTerminalId(selectedPos._id);
    }
  };

  return (
    <div>
      <ButtonBack />
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

              {cardId && (
                <div className="flex flex-col bg-gray-100 p-2 rounded-md mt-2 w-80 text-start">
                  <p>
                    Phí mặc định:{" "}
                    <span className="text-blue-500 font-semibold">
                      {(() => {
                        const selectedCard = listCards.find(
                          (card) => card._id === cardId,
                        );

                        return selectedCard?.defaultFeePercent;
                      })()}
                      %
                    </span>
                  </p>
                  <p>
                    Phí hoàn:{" "}
                    <span className="text-blue-500 font-semibold">
                      {(() => {
                        const selectedCard = listCards.find(
                          (card) => card._id === cardId,
                        );

                        return selectedCard?.feeBack;
                      })()}
                      %
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col gap-2 justify-center items-center w-full p-4">
            <h2 className="text-lg font-semibold">Danh sách máy POS</h2>
            <div className="relative">
              <Select
                value={
                  posTerminalsData.find(
                    (pos: PosData) => pos._id === posTerminalId,
                  )?.name || ""
                }
                onValueChange={(newValue) => handleSelectPosTerminal(newValue)}
              >
                <SelectTrigger
                  className={cn(
                    "flex-1 p-2 border w-80 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  )}
                >
                  <SelectValue placeholder="Chọn máy POS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {posTerminalsData.map((pos) => (
                      <SelectItem key={pos?._id} value={pos?.name}>
                        {pos?.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {posTerminalId && (
                <IconCircleCheckFilled className="fill-blue-500 absolute inset-y-0 -right-8 my-auto" />
              )}
            </div>
            {!posTerminalId && (
              <p className="text-sm text-red-500 mt-1">
                Vui lòng chọn máy POS để thêm hoá đơn.
              </p>
            )}

            {posTerminalId && (
              <div className="flex flex-col bg-gray-100 p-2 rounded-md mt-2 w-80 text-start">
                <p>
                  Phí theo máy:{" "}
                  <span className="text-blue-500 font-semibold">
                    {(() => {
                      const selectedPos = posTerminalsData.find(
                        (pos: PosData) => pos._id === posTerminalId,
                      );
                      return selectedPos?.feePerTerminal;
                    })()}
                    %
                  </span>
                </p>
                <p>
                  Phí theo ngày:{" "}
                  <span className="text-blue-500 font-semibold">
                    {(() => {
                      const selectedPos = posTerminalsData.find(
                        (pos: PosData) => pos._id === posTerminalId,
                      );
                      return selectedPos?.feePerDay;
                    })()}
                    %
                  </span>
                </p>
                <p>
                  Phí hoàn:{" "}
                  <span className="text-blue-500 font-semibold">
                    {(() => {
                      const selectedPos = posTerminalsData.find(
                        (pos: PosData) => pos._id === posTerminalId,
                      );
                      return selectedPos?.feeBack;
                    })()}
                    %
                  </span>
                </p>
                <p>
                  Phí thường:{" "}
                  <span className="text-blue-500 font-semibold">
                    {(() => {
                      const selectedPos = posTerminalsData.find(
                        (pos: PosData) => pos._id === posTerminalId,
                      );
                      return selectedPos?.feePercentNormal;
                    })()}
                    %
                  </span>
                </p>
                <p>
                  Phí MB:{" "}
                  <span className="text-blue-500 font-semibold">
                    {(() => {
                      const selectedPos = posTerminalsData.find(
                        (pos: PosData) => pos._id === posTerminalId,
                      );
                      return selectedPos?.feePercentMB;
                    })()}
                    %
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center items-end p-4">
          <AddBillForm cardId={cardId} posTerminalId={posTerminalId} />
        </div>
      </div>
    </div>
  );
}

"use client";

import RenderCard from "@/components/card/render-card";
import RenderCollaborator from "@/components/card/render-card-collaborator";
import RenderCardDetail from "@/components/card/render-card-detail";
import CreditCard from "@/components/credit-card";
import CreditCardSkeleton from "@/components/credit-card-skeleton";
import { Button } from "@/components/ui/button";
import { ButtonBack } from "@/components/ui/button-back";
import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { ICommonResponse } from "@/lib/constant";
import { convertDecimal128ToString } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export interface CardDetailData {
  _id: string;
  cardId: string;
  amount: number;
  detail: string | null;
  feePercent: number;
  fromDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  negativeRemainingAmount: number;
  withdrawedAmount: number;
  withdrawedDate: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
export interface CollaboratorData {
  _id: string;
  name: string;
  agentId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CardData {
  _id: string;
  name: string;
  agentId: string;
  bankCode: string;
  cardCollaboratorId: string;
  defaultFeePercent: number;
  feeBack: number;
  lastNumber: string;
  maturityDate: Date;
  note: string | null;

  currentDetail?: CardDetailData | null;
  collaborator?: CollaboratorData | null;

  isActive: boolean;
  isDeleted: boolean;
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date | null;
}

export default function Page() {
  const { user } = useUser();
  const { id } = useParams();

  const {
    data: getCardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["get-card-by-id", id],
    queryFn: async (): Promise<ICommonResponse | null> => {
      try {
        const response = await useAxios.get(`/card/get-card-by-id`, {
          params: {
            cardId: id,
          },
          headers: {
            "x-agent": (user?.agentId || "") as string,
          },
        });

        if (response?.status !== 200 || response.data?.code !== 200) {
          throw new Error(response.data?.message || "Failed to fetch card");
        }

        return response.data;
      } catch (error: any) {
        toast.error(`Failed to fetch card: ${error.message}`);
        throw error;
      }
    },
    enabled: !!user?.agentId && !!id,
  });

  const cardData = getCardData?.data.card as CardData;
  const cardDetailData = cardData?.currentDetail as CardDetailData;
  if (cardDetailData) {
    cardDetailData.amount = convertDecimal128ToString(cardDetailData?.amount);
    cardDetailData.negativeRemainingAmount = convertDecimal128ToString(
      cardDetailData?.negativeRemainingAmount,
    );
    cardDetailData.withdrawedAmount = convertDecimal128ToString(
      cardDetailData?.withdrawedAmount,
    );
  }

  return (
    <div>
      <ButtonBack />
      <div className="flex flex-col gap-2 max-full mx-auto">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-2xl font-semibold">Thông tin thẻ</h1>
          <p className="text-center mb-4 text-gray-500">
            Bạn có thể xem chi tiết thẻ, thông tin cộng tác viên liên quan.
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="hidden sm:flex text-lg bg-blue-500"
        >
          <Link
            rel="noopener noreferrer"
            className="w-48 flex items-center gap-2 font-medium mx-auto mb-6"
            href={`/bill/add-bill?cardId=${cardData?._id}`}
          >
            Tạo bill mới
          </Link>
        </Button>

        {isLoading ? (
          <CreditCardSkeleton />
        ) : (
          <CreditCard
            name={cardData?.name}
            cardNumber={cardData?.lastNumber}
            colloborator={cardData?.collaborator?.name}
          />
        )}

        <div className="grid grid-cols-3 gap-4 my-4 w-full mx-auto">
          <div className="">
            <RenderCard
              cardData={cardData}
              isLoading={isLoading}
              error={error}
            />
          </div>
          <div className="">
            <RenderCardDetail
              cardDetailData={cardData?.currentDetail || null}
              isLoading={isLoading}
              error={error}
            />
          </div>
          <div className="">
            <RenderCollaborator
              cardCollaboratorData={cardData?.collaborator || null}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

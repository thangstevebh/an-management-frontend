"use client";

import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import LoadingThreeDot from "../ui/loading-three-dot";
import { fullIso8601Regex } from "@/lib/constant";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";

interface CardDetailData {
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

// Type for edit values - only string inputs for form fields
type EditableFields = Pick<
  CardDetailData,
  | "cardId"
  | "amount"
  | "feePercent"
  | "fromDate"
  | "endDate"
  | "isCurrent"
  | "negativeRemainingAmount"
  | "withdrawedAmount"
  | "withdrawedDate"
  | "detail"
>;
type EditValues = Partial<Record<keyof EditableFields, string>>;

export default function RenderCardDetail({
  cardDetailData,
  isLoading,
  error,
}: {
  cardDetailData: CardDetailData | null;
  isLoading: boolean;
  error: any;
}) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<keyof EditableFields | null>(
    null,
  );
  const [editValues, setEditValues] = useState<EditValues>({});

  const updateCardDetailMutation = useMutation({
    mutationKey: ["update-card", cardDetailData?._id, cardDetailData?.cardId],
    mutationFn: async (updateData: Partial<CardDetailData>) => {
      const response = await useAxios.patch(
        `/card/update-card-detail/${cardDetailData?.cardId}/${cardDetailData?._id}`,
        {
          ...updateData,
        },
        {
          headers: {
            "x-agent": (user?.agentId || "") as string,
          },
        },
      );

      if (response?.status !== 200 || response.data?.code !== 200) {
        throw new Error(response.data?.message || "Failed to update card");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Card updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["get-card-by-id", cardDetailData?.cardId],
      });
      setEditingField(null);
      setEditValues({});
    },
    onError: (error: any) => {
      toast.error(
        `Failed to update card: ${error.response?.data?.message || error.message}`,
      );
    },
  });

  const handleFieldClick = useCallback(
    (field: keyof EditableFields) => {
      if (!cardDetailData) return;

      setEditingField(field);
      setEditValues({ [field]: String(cardDetailData[field] || "") });
    },
    [cardDetailData],
  );

  const handleSave = useCallback(
    (field: keyof EditableFields) => {
      const value = editValues[field];
      if (
        value === undefined ||
        value === String(cardDetailData?.[field] || "")
      ) {
        setEditingField(null);
        setEditValues({});
        return;
      }

      // Convert string back to appropriate type if needed
      let updateValue: any = value.trim();

      // Convert numeric fields from string to number
      if (
        field === "amount" ||
        field === "feePercent" ||
        field === "negativeRemainingAmount" ||
        field === "withdrawedAmount"
      ) {
        const numericValue = parseFloat(updateValue);
        updateValue = isNaN(numericValue) ? 0 : numericValue;
      }

      updateCardDetailMutation.mutate({ [field]: updateValue });
    },
    [
      editValues,
      setEditingField,
      setEditValues,
      cardDetailData,
      updateCardDetailMutation,
    ],
  );

  const getFieldValue = (value: any, isCurrency?: boolean): string => {
    if (typeof value === "number") {
      return value.toString();
    }
    if (isCurrency) {
      return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Convert date values to properly formatted local string
    if (
      value instanceof Date ||
      (typeof value === "string" &&
        value.includes("T") &&
        !isNaN(Date.parse(value)) &&
        fullIso8601Regex.test(value))
    ) {
      const date = value instanceof Date ? value : new Date(value);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${day}-${month}-${year}`;
    }

    return String(value || "");
  };

  const handleCancel = useCallback(() => {
    setEditingField(null);
    setEditValues({});
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent, field: keyof EditableFields) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSave(field);
      } else if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleSave, handleCancel],
  );

  const handleInputChange = useCallback(
    (field: keyof EditableFields, value: string) => {
      setEditValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const renderEditableField = (
    field: keyof EditableFields,
    label: string,
    type: "input" | "textarea" | "select" | "date" = "input",
    isDisable?: boolean,
    options?: string[],
    isCurrency?: boolean,
  ) => {
    if (!cardDetailData) return null;

    const isEditing = editingField === field;
    const currentValue = String(
      typeof cardDetailData[field] === "number" && cardDetailData[field] === 0
        ? "0"
        : cardDetailData[field] || "",
    );
    const editValue = editValues[field] || "";

    return (
      <div className="flex-1">
        <Label className="block py-2">{label}</Label>
        {isEditing ? (
          <div className="flex gap-2 items-start">
            {type === "textarea" ? (
              <Textarea
                value={editValue}
                onChange={(e) => handleInputChange(field, e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, field)}
                className={cn(
                  "flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical",
                )}
                rows={3}
                autoFocus={!isDisable}
                disabled={isDisable}
              />
            ) : type === "select" && options ? (
              <Select
                value={editValue} // Current value
                onValueChange={(newValue) => handleInputChange(field, newValue)}
                disabled={isDisable} // Disable state
              >
                <SelectTrigger
                  className={cn(
                    "flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  )}
                >
                  <SelectValue placeholder="Select an option" /> {currentValue}
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <>
                {type === "date" ? (
                  <Input
                    type="date"
                    value={editValue}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, field)}
                    className={cn(
                      "flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    )}
                    autoFocus={!isDisable}
                    disabled={isDisable}
                  />
                ) : (
                  <Input
                    type="text"
                    value={String(editValue ?? "")}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, field)}
                    className={cn(
                      "flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    )}
                    autoFocus={!isDisable}
                    disabled={isDisable}
                  />
                )}
              </>
            )}
            {isEditing && !isDisable && (
              <div className="flex gap-2 justify-between">
                <Button
                  onClick={() => handleSave(field)}
                  disabled={updateCardDetailMutation.isPending}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateCardDetailMutation.isPending ? "..." : "Save"}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={updateCardDetailMutation.isPending}
                  className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => {
              if (isDisable) return;
              handleFieldClick(field);
            }}
            className={cn(
              "p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors min-h-[2.5rem] flex items-center",
              field === "negativeRemainingAmount"
                ? "text-red-500"
                : "text-gray-800",
            )}
          >
            {currentValue ||
            (typeof currentValue === "number" && currentValue === 0) ? (
              type === "date" ? (
                getFieldValue(currentValue)
              ) : (
                getFieldValue(currentValue, isCurrency)
              )
            ) : (
              <span className="text-gray-400">{currentValue}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  const createNewCardDetailStageMutation = useMutation({
    mutationKey: ["create-new-card-detail-stage", cardDetailData?.cardId],
    mutationFn: async () => {
      const response = await useAxios.post(
        `/agent/add-card-detail`,
        {
          detail: cardDetailData?.detail || "",
          amount: cardDetailData?.amount || 0,
          notWithdrawAmount: cardDetailData?.amount || 0,
          withdrawedAmount: cardDetailData?.withdrawedAmount || 0,
          negativeRemainingAmount: cardDetailData?.negativeRemainingAmount || 0,
          feePercent: cardDetailData?.feePercent || 0,
        },
        {
          params: {
            cardId: cardDetailData?.cardId,
          },
          headers: {
            "x-agent": (user?.agentId || "") as string,
          },
        },
      );

      if (response?.status !== 200 || response.data?.code !== 200) {
        throw new Error(
          response.data?.message || "Failed to create new card detail stage",
        );
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Card updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["get-card-by-id", cardDetailData?.cardId],
      });
    },
    onError: (error: any) => {
      toast.error(
        `Failed to update card: ${error.response?.data?.message || error.message}`,
        {
          description: "Please try again later.",
        },
      );
    },
  });

  const handleEndCardStage = useCallback(() => {
    createNewCardDetailStageMutation.mutate();
  }, [createNewCardDetailStageMutation]);

  const router = useRouter();

  return (
    <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-sm border flex-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold mb-1">Thông tin tiền trong thẻ</h2>
        <Button
          variant="secondary"
          className="hidden  hover:cursor-pointer sm:flex hover:bg-gray-200"
          onClick={() => router.push(`/card/${cardDetailData?.cardId}/history`)}
          disabled={
            createNewCardDetailStageMutation.isPending ||
            !cardDetailData?.isCurrent
          }
        >
          <span className="text-sm">Lịch sử giao dịch</span>
        </Button>
      </div>

      <Button
        className="mb-2 hover:bg-red-700 hover:text-white hidden sm:flex hover:cursor-pointer"
        variant="destructive"
        onClick={() => handleEndCardStage()}
        disabled={
          createNewCardDetailStageMutation.isPending ||
          !cardDetailData?.isCurrent
        }
      >
        <span className="text-sm">Kết thúc giai đoạn thẻ</span>
      </Button>

      {isLoading ? (
        <LoadingThreeDot />
      ) : error ? (
        <div className="text-red-500">
          Error: {error.message || "Failed to load card detail"}
        </div>
      ) : !cardDetailData ? (
        <div className="text-gray-500">No card detail found</div>
      ) : (
        <>
          {renderEditableField(
            "amount",
            "Số tiền",
            "input",
            true,
            undefined,
            true,
          )}
          {renderEditableField("feePercent", "Phí (%)", "input")}
          {renderEditableField(
            "negativeRemainingAmount",
            "Số tiền âm còn lại",
            "input",
            false,
            undefined,
            true,
          )}
          {renderEditableField(
            "withdrawedAmount",
            "Số tiền đã rút",
            "input",
            true,
            undefined,
            true,
          )}
          <div className="flex flex-col gap-2">
            <Label className="block py-2">Số tiền còn lại</Label>
            <div
              className={cn(
                "p-2 font-bold border border-gray-200 rounded-md",
                cardDetailData?.amount -
                  (cardDetailData?.withdrawedAmount || 0) >=
                  0
                  ? "text-green-600"
                  : "text-red-600",
              )}
            >
              {getFieldValue(
                String(
                  cardDetailData?.amount -
                    (cardDetailData?.withdrawedAmount || 0),
                ),
                true,
              )}
            </div>
          </div>
          {renderEditableField(
            "fromDate",
            "Ngày bắt đầu giai đoạn thẻ",
            "date",
            true,
            undefined,
            true,
          )}
          {/* {renderEditableField("endDate", "End Date", "date", true)} */}
          {renderEditableField(
            "withdrawedDate",
            "Ngày rút tiền gần nhất",
            "date",
            true,
          )}
          {renderEditableField("detail", "Note", "textarea")}
        </>
      )}
    </div>
  );
}

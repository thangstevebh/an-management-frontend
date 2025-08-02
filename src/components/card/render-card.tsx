"use client";

import { CardData } from "@/app/card/[id]/page";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
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
import { Textarea } from "../ui/textarea";

// Type for edit values - only string inputs for form fields
type EditableFields = Pick<
  CardData,
  | "name"
  | "bankCode"
  | "defaultFeePercent"
  | "feeBack"
  | "lastNumber"
  | "maturityDate"
  | "note"
  | "currentDetail"
  | "cardCollaboratorId"
  | "agentId"
>;
type EditValues = Partial<Record<keyof EditableFields, string>>;

export default function RenderCard({
  cardData,
  isLoading,
  error,
}: {
  cardData: CardData | null;
  isLoading: boolean;
  error: any;
}) {
  const { id } = useParams();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<keyof EditableFields | null>(
    null,
  );
  const [editValues, setEditValues] = useState<EditValues>({});

  const updateCardMutation = useMutation({
    mutationKey: ["update-card", id],
    mutationFn: async (updateData: Partial<CardData>) => {
      const response = await useAxios.patch(
        `/card/update-card/${id}`,
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
      queryClient.invalidateQueries({ queryKey: ["get-card-by-id", id] });
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
      if (!cardData) return;

      setEditingField(field);
      setEditValues({ [field]: String(cardData[field] || "") });
    },
    [cardData],
  );

  const handleSave = useCallback(
    (field: keyof EditableFields) => {
      const value = editValues[field];
      if (value === undefined || value === String(cardData?.[field] || "")) {
        handleCancel();
        return;
      }

      // Convert string back to appropriate type if needed
      const updateValue: any = value.trim();

      updateCardMutation.mutate({ [field]: updateValue });
    },
    [editValues, cardData, updateCardMutation],
  );

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
      // Update the editValues state for the specific field
      if (value === undefined || value === null) {
        value = "";
      }

      if (typeof value !== "string") {
        value = String(value).trim();
      }

      setEditValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const renderEditableField = (
    field: keyof EditableFields,
    label: string,
    type: "input" | "textarea" | "select" | "date" = "input",
    isDisable?: boolean,
    options?: string[],
  ) => {
    if (!cardData) return null;

    const isEditing = editingField === field;
    const currentValue = String(
      typeof cardData[field] === "number" && cardData[field] === 0
        ? "0"
        : cardData[field] || "",
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
                  disabled={updateCardMutation.isPending}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateCardMutation.isPending ? "..." : "Save"}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={updateCardMutation.isPending}
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
            className="p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors min-h-[2.5rem] flex items-center"
          >
            {currentValue ||
            (typeof currentValue === "number" && currentValue === 0) ? (
              type === "date" ? (
                getFieldValue(currentValue)
              ) : (
                getFieldValue(currentValue)
              )
            ) : (
              <span className="text-gray-400">{currentValue}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  const getFieldValue = (value: any): string => {
    // Convert numeric values to string with proper decimal formatting
    if (typeof value === "number") {
      return value.toString();
    }

    // Convert date values to properly formatted local string
    if (
      value instanceof Date ||
      (typeof value === "string" &&
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

  return (
    <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-sm border flex-1">
      <h2 className="text-lg font-semibold mb-1">Thông tin thẻ</h2>
      {isLoading ? (
        <LoadingThreeDot />
      ) : error ? (
        <div className="text-red-500">
          Error: {error.message || "Failed to load card detail"}
        </div>
      ) : !cardData ? (
        <div className="text-gray-500">No card detail found</div>
      ) : (
        <>
          {renderEditableField("name", "Tên thẻ", "input")}
          {renderEditableField("bankCode", "Mã ngân hàng")}
          {renderEditableField("lastNumber", "4 số cuối", "input")}
          {renderEditableField(
            "defaultFeePercent",
            "Phí mặc định (%)",
            "input",
          )}
          {renderEditableField("feeBack", "Phí hoàn (%)", "input")}
          {renderEditableField("maturityDate", "Ngày đáo", "date")}
          {renderEditableField("note", "Note", "textarea")}
        </>
      )}
    </div>
  );
}

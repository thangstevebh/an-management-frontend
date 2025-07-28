"use client";

import {
  PosTerminalStatus,
  PosTerminalType,
} from "@/components/pos/list-pos-data";
import { Button } from "@/components/ui/button";
import { ButtonBack } from "@/components/ui/button-back";
import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { ICommonResponse } from "@/lib/constant";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState, useCallback } from "react";
import { toast } from "sonner";

export type PosData = {
  _id: string;
  name: string;
  feePerDay: number;
  feePerTerminal: number;
  feeBack: number;
  feePercentNormal: number;
  feePercentMB: number;
  status: PosTerminalStatus;
  posType: PosTerminalType;
  createdBy: string;
  sendAt: Date | null;
  receivedAt: Date | null;
  sendBackAt: Date | null;
  note: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

// Type for edit values - only string inputs for form fields
type EditableFields = Pick<
  PosData,
  | "name"
  | "feePerDay"
  | "feePerTerminal"
  | "feePercentNormal"
  | "feeBack"
  | "feePercentMB"
  | "sendAt"
  | "receivedAt"
  | "sendBackAt"
  | "note"
>;
type EditValues = Partial<Record<keyof EditableFields, string>>;

export default function Page() {
  const { id } = useParams();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<keyof EditableFields | null>(
    null,
  );
  const [editValues, setEditValues] = useState<EditValues>({});

  const {
    data: getPosData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["get-pos-by-id", id],
    queryFn: async (): Promise<ICommonResponse | null> => {
      try {
        const response = await useAxios.get(`/agent/get-pos-by-id`, {
          params: {
            posId: id,
          },
          headers: {
            "x-agent": (user?.agentId || "") as string,
          },
        });

        if (response?.status !== 200 || response.data?.code !== 200) {
          throw new Error(response.data?.message || "Failed to fetch pos");
        }

        return response.data;
      } catch (error: any) {
        toast.error(`Failed to fetch pos: ${error.message}`);
        throw error;
      }
    },
    enabled: !!user?.agentId && !!id,
  });

  const updatePosMutation = useMutation({
    mutationFn: async (updateData: Partial<PosData>) => {
      const response = await useAxios.put(
        `/agent/update-pos-by-id`,
        {
          posId: id,
          ...updateData,
        },
        {
          headers: {
            "x-agent": (user?.agentId || "") as string,
          },
        },
      );

      if (response?.status !== 200 || response.data?.code !== 200) {
        throw new Error(response.data?.message || "Failed to update pos");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("POS updated successfully");
      queryClient.invalidateQueries({ queryKey: ["get-pos-by-id", id] });
      setEditingField(null);
      setEditValues({});
    },
    onError: (error: any) => {
      toast.error(
        `Failed to update pos: ${error.response?.data?.message || error.message}`,
      );
    },
  });

  const posData = getPosData?.data.pos as PosData;

  const handleFieldClick = useCallback(
    (field: keyof EditableFields) => {
      if (!posData) return;

      setEditingField(field);
      setEditValues({ [field]: String(posData[field] || "") });
    },
    [posData],
  );

  const handleSave = useCallback(
    (field: keyof EditableFields) => {
      const value = editValues[field];
      if (value === undefined || value === String(posData?.[field] || "")) {
        handleCancel();
        return;
      }

      // Convert string back to appropriate type if needed
      const updateValue: any = value.trim();

      updatePosMutation.mutate({ [field]: updateValue });
    },
    [editValues, posData, updatePosMutation],
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
      setEditValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const renderEditableField = (
    field: keyof EditableFields,
    label: string,
    type: "input" | "textarea" | "select" | "date" = "input",
    options?: string[],
  ) => {
    if (!posData) return null;

    const isEditing = editingField === field;
    const currentValue = String(posData[field] || "");
    const editValue = editValues[field] || "";

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        {isEditing ? (
          <div className="flex gap-2 items-start">
            {type === "textarea" ? (
              <textarea
                value={editValue}
                onChange={(e) => handleInputChange(field, e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, field)}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                rows={3}
                autoFocus
              />
            ) : type === "select" && options ? (
              <select
                value={editValue}
                onChange={(e) => handleInputChange(field, e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, field)}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type === "date" ? "date" : "text"}
                value={type === "date" ? editValue.split("T")[0] : editValue}
                onChange={(e) => handleInputChange(field, e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, field)}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            )}
            <button
              onClick={() => handleSave(field)}
              disabled={updatePosMutation.isPending}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatePosMutation.isPending ? "..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={updatePosMutation.isPending}
              className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div
            onClick={() => handleFieldClick(field)}
            className="p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors min-h-[2.5rem] flex items-center"
          >
            {currentValue ? (
              type === "date" ? (
                new Date(currentValue).toLocaleDateString()
              ) : (
                currentValue
              )
            ) : (
              <span className="text-gray-400">{currentValue}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !posData) {
    return (
      <div className="flex flex-col justify-center items-center mb-6 gap-4 py-4 md:gap-6 md:py-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold">POS Details</h1>
        <div className="text-lg text-red-500">Không tìm thấy thẻ </div>
        <Button
          onClick={() => window.location.reload()}
          className="max-w-60 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div>
      <ButtonBack />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 max-w-2xl mx-auto">
        <div className="flex justify-center items-center mb-6">
          <h1 className="text-2xl font-semibold">POS Details</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          {renderEditableField("name", "Name")}
        </div>
      </div>
    </div>
  );
}

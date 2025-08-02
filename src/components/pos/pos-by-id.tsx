"use client";

import {
  PosTerminalStatus,
  PosTerminalType,
} from "@/components/pos/list-pos-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { fullIso8601Regex, ICommonResponse } from "@/lib/constant";
import { cn, convertDecimal128ToString } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import LoadingThreeDot from "../ui/loading-three-dot";
import { Textarea } from "../ui/textarea";
import ListAgentsSelect from "../agent/list-agents-select";

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
  agentId: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

// Type for edit values - only string inputs for form fields
type EditableFields = Pick<
  PosData,
  | "name"
  | "posType"
  | "feePerDay"
  | "feePerTerminal"
  | "feePercentNormal"
  | "feeBack"
  | "feePercentMB"
  | "sendAt"
  | "receivedAt"
  | "sendBackAt"
  | "note"
  | "status"
  | "agentId"
>;
type EditValues = Partial<Record<keyof EditableFields, string>>;

export default function PosById({}) {
  const { id } = useParams();
  const { user, isAdmin } = useUser();
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
        const response = await useAxios.get(
          `${user?.role === "admin" ? "admin/list-pos-by-admin" : "agent/list-pos"}`,
          {
            params: {
              _id: id,
              limit: 1,
              page: 1,
            },
            headers: {
              ...(user?.role !== "admin"
                ? { "x-agent": (user?.agentId || "") as string }
                : {}),
            },
          },
        );

        if (response?.status !== 200 || response.data?.code !== 200) {
          throw new Error(response.data?.message || "Failed to fetch pos");
        }

        return response.data;
      } catch (error: any) {
        toast.error(`Failed to fetch pos: ${error.message}`);
        throw error;
      }
    },
    enabled: user?.role !== "admin" ? !!user?.agentId : true && !!id,
  });
  const posData = getPosData?.data?.posTerminals[0] as PosData;

  if (posData) {
    posData.feePerDay = convertDecimal128ToString(posData?.feePerDay);
    posData.feePerTerminal = convertDecimal128ToString(posData?.feePerTerminal);
    posData.feeBack = convertDecimal128ToString(posData?.feeBack);
    posData.feePercentNormal = convertDecimal128ToString(
      posData?.feePercentNormal,
    );
    posData.feePercentMB = convertDecimal128ToString(posData?.feePercentMB);
  }

  const updatePosMutation = useMutation({
    mutationKey: ["update-pos-terminal", id],
    mutationFn: async (updateData: Partial<PosData>) => {
      const response = await useAxios.patch(
        `pos-terminal/update-pos-terminal/${posData?._id}`,
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

  const getFieldValue = (value: any): string => {
    // Convert numeric values to string with proper decimal formatting
    if (typeof value === "number") {
      return String(value);
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

  const renderEditableField = (
    field: keyof EditableFields,
    label: string,
    type: "input" | "textarea" | "select" | "date" = "input",
    isDisable?: boolean,
    options?: string[],
  ) => {
    if (!posData) return null;

    const isEditing = editingField === field;
    const currentValue = String(
      typeof posData[field] === "number" && posData[field] === 0
        ? "0"
        : posData[field] || "",
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
                  <SelectValue placeholder="Select an option" />
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
                    value={editValue}
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
                  disabled={updatePosMutation.isPending}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatePosMutation.isPending ? "..." : "Save"}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={updatePosMutation.isPending}
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

  if (isLoading) {
    return (
      <div className="text-center">
        <LoadingThreeDot />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {isAdmin && <ListAgentsSelect posData={posData} />}

      <div className="flex max-w-[80%] mx-auto w-full gap-4 bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex-1">
          {renderEditableField("name", "Name", "input")}
          {renderEditableField("posType", "POS Type", "select", false, [
            ...Object.values(PosTerminalType),
          ])}
          {renderEditableField(
            "status",
            "Status",
            "select",
            user?.isAdmin ? false : true,
            [
              PosTerminalStatus.ACTIVE,
              PosTerminalStatus.INACTIVE,
              PosTerminalStatus.SUSPENDED,
              PosTerminalStatus.TERMINATED,
            ],
          )}
          {renderEditableField(
            "sendAt",
            "Send At",
            "date",
            user?.isAdmin ? false : true,
          )}
          {renderEditableField("receivedAt", "Received At", "date")}
          {renderEditableField("sendBackAt", "Send Back At", "date")}
          {renderEditableField("note", "Note", "textarea")}
        </div>
        <div className="flex-1">
          {renderEditableField("feePerDay", "Fee Per Day", "input")}
          {renderEditableField("feePerTerminal", "Fee Per Terminal", "input")}
          {renderEditableField(
            "feePercentNormal",
            "Fee Percent Normal",
            "input",
          )}
          {renderEditableField("feePercentMB", "Fee Percent MB", "input")}
          {renderEditableField("feeBack", "Fee Back", "input")}
        </div>
      </div>
    </div>
  );
}

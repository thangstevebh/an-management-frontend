"use client";

import { CollaboratorData } from "@/app/card/[id]/page";
import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import React, { useState, useCallback } from "react";
import { toast } from "sonner";

// Type for edit values - only string inputs for form fields
type EditableFields = Pick<CollaboratorData, "name">;
type EditValues = Partial<Record<keyof EditableFields, string>>;

export default function RenderCollaborator({
  cardCollaboratorData,
  isLoading,
  error,
}: {
  cardCollaboratorData: CollaboratorData | null;
  isLoading: boolean;
  error: any;
}) {
  const { user } = useUser();
  const [editingField, setEditingField] = useState<keyof EditableFields | null>(
    null,
  );
  const [editValues, setEditValues] = useState<EditValues>({});

  const updateCardMutation = useMutation({
    mutationFn: async (updateData: Partial<CollaboratorData>) => {
      const response = await useAxios.put(
        `/card/update-card`,
        {
          cardId: cardCollaboratorData?._id,
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
      if (!cardCollaboratorData) return;

      setEditingField(field);
      setEditValues({ [field]: String(cardCollaboratorData[field] || "") });
    },
    [cardCollaboratorData],
  );

  const handleSave = useCallback(
    (field: keyof EditableFields) => {
      const value = editValues[field];
      if (
        value === undefined ||
        value === String(cardCollaboratorData?.[field] || "")
      ) {
        handleCancel();
        return;
      }

      // Convert string back to appropriate type if needed
      const updateValue: any = value.trim();

      updateCardMutation.mutate({ [field]: updateValue });
    },
    [editValues, cardCollaboratorData, updateCardMutation],
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
    isDisable?: boolean,
    options?: string[],
  ) => {
    if (!cardCollaboratorData) return null;

    const isEditing = editingField === field;
    const currentValue = String(cardCollaboratorData[field] || "");
    const editValue = editValues[field] || "";

    return (
      <div className="flex-1">
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
                className={cn(
                  "flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical",
                )}
                rows={3}
                autoFocus={!isDisable}
                disabled={isDisable}
              />
            ) : type === "select" && options ? (
              <select
                value={editValue}
                onChange={(e) => handleInputChange(field, e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, field)}
                className={cn(
                  "flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                )}
                autoFocus={!isDisable}
                disabled={isDisable}
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
                className={cn(
                  "flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                )}
                autoFocus={!isDisable}
                disabled={isDisable}
              />
            )}
            {isEditing && !isDisable && (
              <div className="flex gap-2 justify-between">
                <button
                  onClick={() => handleSave(field)}
                  disabled={updateCardMutation.isPending}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateCardMutation.isPending ? "..." : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={updateCardMutation.isPending}
                  className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
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

  return (
    <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-sm border flex-1">
      <h2 className="text-lg font-semibold mb-1">
        Card Collaborator Information
      </h2>
      {isLoading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">
          Error: {error.message || "Failed to load card detail"}
        </div>
      ) : !cardCollaboratorData ? (
        <div className="text-gray-500">No card detail found</div>
      ) : (
        <>{renderEditableField("name", "Collaborator Name")}</>
      )}
    </div>
  );
}

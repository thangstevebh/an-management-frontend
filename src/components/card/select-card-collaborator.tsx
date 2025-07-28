import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxios from "@/lib/axios/axios.config";
import { useUser } from "@/hooks/use-user";

interface ICollaborator {
  _id: string;
  name: string;
  agentId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
interface SelectCollaboratorComboboxProps {
  onValueChange: (value: string) => void;
}

export function SelectCollaboratorCombobox({
  onValueChange,
}: SelectCollaboratorComboboxProps) {
  const { user } = useUser();

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const { data: collaborators, isLoading } = useQuery({
    queryKey: ["get-collaborators", user?.agentId],
    queryFn: async () => {
      const response = await useAxios.get(`card/list-collaborators`, {
        params: {
          order: "ASC",
        },
        headers: {
          "x-agent": (user?.agentId || "") as string,
        },
      });
      if (response?.status !== 200 && response.data?.code !== 200) {
        toast.error(
          `Failed to fetch cards, ${response.data?.message || "Unknown error"}`,
        );
        return [];
      }
      return response.data;
    },
    enabled: !!user?.agentId,
    staleTime: 5000, // Cache data for 5 seconds
  });

  const listCollaborators =
    (collaborators?.data.collaborators as ICollaborator[]) || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex-1 justify-between"
        >
          {value
            ? listCollaborators.find(
                (collaborator) => collaborator.name.trim() === value,
              )?.name
            : "Select framework..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {listCollaborators.map((collaborator) => (
                <CommandItem
                  key={collaborator._id}
                  value={collaborator?.name}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === collaborator?.name
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {collaborator?.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

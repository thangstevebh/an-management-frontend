"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "../ui/pagination-table";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { toast } from "sonner";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useDebounce } from "@/hooks/use-debounce";

export enum PosTerminalStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  TERMINATED = "terminated",
}

export enum PosTerminalType {
  WIFI = "wifi",
  SIM = "sim",
  OTHER = "other",
}

export type Pos = {
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

export const columns: ColumnDef<Pos>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "_id",
    header: "Id",
    cell: ({ row }) => <div className="">{row.getValue("_id")}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="uppercase">
        <Link
          href={`/card/${row.getValue("_id")}/`}
          className="text-blue-500 hover:underline"
        >
          {row.getValue("name")}
        </Link>
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "feePerDay",
    header: () => <div className="text-center max-w-[50px]">Phí ngày</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("feePerDay"));

      return (
        <div className="max-w-[50px] text-center font-medium">{amount}</div>
      );
    },
  },
  {
    accessorKey: "feePerTerminal",
    header: () => <div className="text-center max-w-[50px]">Phí máy</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("feePerTerminal"));

      return (
        <div className="max-w-[50px] text-center font-medium">{amount}</div>
      );
    },
  },
  {
    accessorKey: "feeBack",
    header: () => <div className="text-center max-w-[50px]">Phí Hoàn</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("feeBack"));

      return (
        <div className="max-w-[50px] text-center font-medium">{amount}</div>
      );
    },
  },
  {
    accessorKey: "feePercentNormal",
    header: () => <div className="text-center max-w-[50px]">Phí(BT)</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("feePercentNormal"));

      return (
        <div className="max-w-[50px] text-center font-medium">{amount}</div>
      );
    },
  },
  {
    accessorKey: "feePercentMB",
    header: () => <div className="text-center max-w-[50px]">Phí(MB)</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("feePercentMB"));

      return (
        <div className="max-w-[50px] text-center font-medium">{amount}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center max-w-[50px]">Trạng thái</div>,
    cell: ({ row }) => (
      <div className="capitalize text-center max-w-[50px]">
        {row.getValue("status")}
      </div>
    ),
  },
  {
    accessorKey: "posType",
    header: () => <div className="text-center max-w-[50px]">Type</div>,
    cell: ({ row }) => (
      <div className="capitalize text-center max-w-[50px]">
        {row.getValue("posType")}
      </div>
    ),
  },
  {
    accessorKey: "sendAt",
    header: () => <div className="text-center">Ngày gửi</div>,
    cell: ({ row }) => {
      const value = row.getValue("sendAt");

      const valueDate = value ? new Date(value as string) : null;
      const formattedDate = valueDate
        ? `${valueDate.getDate().toString().padStart(2, "0")}/${(valueDate.getMonth() + 1).toString().padStart(2, "0")}/${valueDate.getFullYear()}`
        : "N/A";

      return <div className="capitalize text-center">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "receivedAt",
    header: () => <div className="text-center">Ngày nhận</div>,
    cell: ({ row }) => {
      const value = row.getValue("receivedAt");

      const valueDate = value ? new Date(value as string) : null;
      const formattedDate = valueDate
        ? `${valueDate.getDate().toString().padStart(2, "0")}/${(valueDate.getMonth() + 1).toString().padStart(2, "0")}/${valueDate.getFullYear()}`
        : "N/A";

      return <div className="capitalize text-center">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "note",
    header: () => <div className="text-center max-w-[200px]">Note</div>,
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-center">
        {row.getValue("note") ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-pointer">
                {row.getValue("note") || "No note"}
              </span>
            </TooltipTrigger>
            <TooltipContent
              className="max-w-[300px] text-sm text-wrap break-words"
              side="top"
              sideOffset={5}
              align="start"
            >
              <span className="">{row.getValue("note")}</span>
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-gray-500">No note</span>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Copy payment ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ListPosData() {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0, // TanStack Table uses 0-based pageIndex
    pageSize: 10, // Initial page size
  });
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [searchInput, setSearchInput] = React.useState("");
  const debouncedSearch = useDebounce(searchInput, 500); // Debounced search value (500ms delay)

  const { user } = useUser();

  const { data: getPosData, isLoading } = useQuery({
    queryKey: [
      "list-pos",
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearch,
      sorting,
    ],
    queryFn: async () => {
      const response = await useAxios.get(`agent/list-pos`, {
        params: {
          order:
            sorting.length > 0
              ? sorting[0].id === "name" && sorting[0]?.desc
                ? "DESC"
                : "ASC"
              : "ASC",
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: debouncedSearch || undefined, // Use search state for filtering
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

  // Memoize the data to prevent unnecessary re-renders of the table
  const data = React.useMemo(
    () => getPosData?.data?.posTerminals || [],
    [getPosData],
  );

  const pageCount = React.useMemo(
    () => getPosData?.data?.pagemeta?.totalPage || -1,
    [getPosData],
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      _id: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const table = useReactTable({
    data: data,
    columns,

    // Manual pagination settings
    manualPagination: true, // Tell TanStack Table that pagination is handled manually
    pageCount: pageCount, // Provide the total page count from your API
    onPaginationChange: setPagination,

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          value={searchInput}
          onChange={handleSearch}
          placeholder="Tìm kiếm theo tên..."
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table className="w-full">
          <TableHeader className="bg-gray-100 w-auto">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="max-w-[100px]" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="max-w-[100px]" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="w-auto break-words max-w-[150px]"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}

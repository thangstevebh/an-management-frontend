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
import useAxios from "@/lib/axios/axios.config";
import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import Link from "next/link";
import { toGMT7 } from "@/lib/utils";
import { Badge } from "../ui/badge";

interface AgentMember {
  _id: string;
  agentId: string;
  userId: string;
  agentRole: string;
  user: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
  };
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export function AgentMembersTable() {
  const { user } = useUser();
  const [pagination, setPagination] = React.useState({
    pageIndex: 0, // TanStack Table uses 0-based pageIndex
    pageSize: 10, // Initial page size
  });
  const [searchInput, setSearchInput] = React.useState("");
  const debouncedSearch = useDebounce(searchInput, 500); // Debounced search value (500ms delay)

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      _id: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});

  const { data: agentMembers, isLoading } = useQuery({
    queryKey: [
      "get-agent-members",
      user?.agentId,
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearch,
      sorting,
    ],
    queryFn: async () => {
      const response = await useAxios.get(`/agent/list-agent-members`, {
        params: {
          order:
            sorting.length > 0
              ? sorting[0].id === "name" && sorting[0]?.desc
                ? "DESC"
                : "ASC"
              : "ASC",
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: debouncedSearch || undefined,
        },
        headers: {
          "x-agent": (user?.agentId || "") as string,
        },
      });

      if (response?.status !== 200 || response.data?.code !== 200) {
        throw new Error(response.data?.message || "Failed to fetch card");
      }

      return response.data;
    },

    enabled: !!user?.agentId,
  });

  const pageCount = React.useMemo(
    () => agentMembers?.data?.pagemeta?.totalPage || -1,
    [agentMembers],
  );
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const columns: ColumnDef<AgentMember>[] = [
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
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "_id",
      header: "Id",
      cell: ({ row }) => <div className="">{row.getValue("_id")}</div>,
      enableHiding: true,
    },
    {
      id: "name",
      accessorKey: "user.username",
      accessorFn: (row) => row.user.username,

      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            username
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-center max-w-[100px]">
          {row.original.user.username}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "fullName",
      accessorFn: (row) => `${row.user.firstName} ${row.user.lastName}`,

      header: ({ column }) => {
        return <div className="text-center max-w-[100px]">Tên đầy đủ</div>;
      },
      cell: ({ row }) => (
        <div className="uppercase">
          <div className="capitalize text-center max-w-[100px]">
            {row.original.user.firstName} {row.original.user.lastName}
          </div>
        </div>
      ),
    },
    {
      id: "phone_number",
      accessorFn: (row) => row.user.phoneNumber,

      header: ({ column }) => {
        return <div className="text-center max-w-[100px]">Phone Number</div>;
      },
      cell: ({ row }) => (
        <div className="uppercase">
          <div className="capitalize text-center max-w-[100px]">
            {row.original.user.phoneNumber}
          </div>
        </div>
      ),
    },
    {
      id: "Role",
      accessorFn: (row) => row.user.role,

      header: ({ column }) => {
        return <div className="text-center max-w-[100px]">Role</div>;
      },
      cell: ({ row }) => (
        <div className="uppercase">
          <div className="capitalize text-center max-w-[100px]">
            {row.original.agentRole && row.original.agentRole !== "owner" ? (
              <Badge
                variant="secondary"
                className="bg-emerald-500 text-white dark:bg-emerald-600"
              >
                Nhân viên
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-blue-500 text-white dark:bg-blue-600"
              >
                Chủ sở hữu
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "status",
      accessorFn: (row) => row.isActive,

      header: ({ column }) => {
        return <div className="text-center max-w-[100px]">Status</div>;
      },
      cell: ({ row }) => (
        <div className="uppercase">
          <div className="capitalize text-center max-w-[100px]">
            {row.original.isActive ? (
              <Badge
                variant="secondary"
                className="bg-green-500 text-white dark:bg-green-600"
              >
                Active
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-red-500 text-white dark:bg-red-600"
              >
                Inactive
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="uppercase">
          {toGMT7(row.getValue("createdAt"), "DD-MM-YYYY hh:mm:ss")}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original;

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
              <DropdownMenuItem
              // onClick={() => navigator.clipboard.writeText()}
              >
                Copy payment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View customer</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: agentMembers?.data?.agentMembers || [],
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
          placeholder="Tìm kiếm thành viên..."
          value={searchInput}
          onChange={handleSearch}
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
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                    <TableCell key={cell.id}>
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

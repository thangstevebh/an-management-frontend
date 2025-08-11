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
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { toast } from "sonner";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useDebounce } from "@/hooks/use-debounce";
import LoadingThreeDot from "../ui/loading-three-dot";
import { cn } from "@/lib/utils";
import { PosData } from "../pos/pos-by-id";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useListCardsQueryUserOptions } from "@/lib/queryOptions/get-list-cards-option";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { IconCalendarWeek } from "@tabler/icons-react";
import { Calendar } from "../ui/calendar";
import { vi } from "date-fns/locale";
import { IAgent } from "../agent/agent-detail";

interface IPosTerminal {
  _id: string;
  name: string;
  feePerDay: number;
  feePerTerminal: number;
  feeBack: number;
  feePercentNormal: number;
  feePercentMB: number;
}

interface ICard {
  _id: string;
  name: string;
  bankCode: string;
  lastNumber: string;
  defaultFeePercent: number;
  feeBack: number;
  maturityDate: Date; // ISO 8601 string
  cardCollaborator: string;
}

interface IUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface IBill {
  _id: string;
  cardId: string;
  agentId: string;
  code: string;
  posTerminalSummaryId: string | null;
  posTerminalId: string;
  posTerminalName: string;
  amount: string; // Note: This is a string in the JSON
  lot: string;
  billNumber: string;
  note: string;
  customerFee: number;
  customerFeeAmount: string; // Note: This is a string in the JSON
  posFee: number;
  posFeeAmount: string; // Note: This is a string in the JSON
  backFee: number;
  backFeeAmount: string; // Note: This is a string in the JSON
  differenceFee: number;
  differenceFeeAmount: string; // Note: This is a string in the JSON
  paidDate: string | null;
  isMarkedDebt: boolean;
  isConfirmed: boolean;
  createdBy: string;
  confirmedBy: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  atDate: Date; // ISO 8601 string
  createdAt: Date; // ISO 8601 string
  updatedAt: Date; // ISO 8601 string

  // Nested objects
  posTerminal: IPosTerminal;
  card: ICard;
  createdByUser: IUser;
}

export function ListBillsData() {
  const { user, isAdmin } = useUser();

  const [pagination, setPagination] = React.useState({
    pageIndex: 0, // TanStack Table uses 0-based pageIndex
    pageSize: 10, // Initial page size
  });
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "custommer", desc: false },
    { id: "billNumber", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [searchInput, setSearchInput] = React.useState("");
  const debouncedSearch = useDebounce(searchInput, 500); // Debounced search value (500ms delay)
  const [posTerminalId, setPosTerminalId] = React.useState<string | null>(null);
  const [cardId, setCardId] = React.useState<string | null>(null);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [open, setOpen] = React.useState(false);
  const [agent, setAgent] = React.useState<string | null>(null);

  const handleSetToToday = () => {
    const today = new Date();

    setDateRange((prevDateRange) => ({
      to: undefined,
      from: today,
    }));
  };

  const { data: listCard, isLoading: getListCardsLoading } =
    useListCardsQueryUserOptions(
      {
        user: user,
      },
      {
        queryKey: ["get-list-cards-by-user", user?._id],
        enabled: !!user && !cardId, // Only fetch if user exists and no specific cardId is provided
      },
    ) as UseQueryResult<any, Error>;

  const listCards = React.useMemo(() => {
    return listCard?.data?.cards || [];
  }, [listCard]);

  const handleSelectCard = (newValue: string) => {
    const selectedCard = listCards.find(
      (card: ICard) => card.name === newValue,
    );

    if (selectedCard) {
      setCardId(selectedCard._id);
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

  const posTerminalsData = React.useMemo(() => {
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

  const { data: getBillsData, isLoading: isGetBillsLoading } = useQuery({
    queryKey: [
      "get-bills-by-user",
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearch,
      sorting,
      posTerminalId,
      cardId,
      dateRange,
      agent,
    ],
    queryFn: async () => {
      const response = await useAxios.get(`card/get-bills`, {
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
          ...(posTerminalId && { posTerminalId }),
          ...(cardId && { cardId }),
          ...(dateRange?.from && {
            startDate: dateRange.from.toISOString(),
          }),
          ...(dateRange?.to && {
            endDate: dateRange.to.toISOString(),
          }),
          ...(agent &&
            !!isAdmin && {
              agentId:
                agents.find((agentDetail: IAgent) => agentDetail.name === agent)
                  ?._id || "",
            }),
        },
        headers: {
          ...((!!isAdmin && {
            "x-agent":
              agents.find((agentDetail: IAgent) => agentDetail.name === agent)
                ?._id || "",
          }) || {
            "x-agent": user?.agentId || "",
          }),
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
    enabled: !isAdmin ? !!user?.agentId : true,
    staleTime: 5000, // Cache data for 5 seconds
  });

  // Memoize the data to prevent unnecessary re-renders of the table
  const data = React.useMemo(
    () => getBillsData?.data?.bills || [],
    [getBillsData],
  );

  const pageCount = React.useMemo(
    () => getBillsData?.data?.pagemeta?.totalPage || -1,
    [getBillsData],
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

  const { data: getAgents, isLoading: getAgentsLoading } = useQuery({
    queryKey: ["list-agents"],
    queryFn: async () => {
      const response = await useAxios.get(`agent/list-agents`, {
        params: {
          page: 1,
          limit: 100,
        },
        headers: {
          "x-agent": (user?.agentId || "") as string,
        },
      });
      if (response?.status !== 200 && response.data?.code !== 200) {
        toast.error(
          `Failed to fetch agents, ${response.data?.message || "Unknown error"}`,
        );
        return [];
      }
      return response.data.data;
    },
    enabled: !!isAdmin,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const agents = React.useMemo(() => {
    return getAgents?.agents || [];
  }, [getAgents]);

  const columns: ColumnDef<IBill>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
    },
    {
      accessorKey: "_id",
      header: "Id",
      cell: ({ row }) => <div className="">{row.getValue("_id")}</div>,
      enableHiding: false,
    },
    {
      id: "code",
      accessorKey: "code",
      accessorFn: (row) => row.code,
      header: ({ column }) => {
        return <div className="text-center">Mã Code</div>;
      },
      cell: ({ row }) => (
        <div className="text-center font-semibold p-0.5 bg-blue-200 text-blue-700">
          {row.original.code}
        </div>
      ),
    },

    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: () => <div className="text-center">Ngày tạo</div>,
      cell: ({ row }) => {
        const getDate = row.getValue("createdAt");

        const getDateDate = getDate ? new Date(getDate as string) : null;
        const formattedDate = getDateDate
          ? `${getDateDate.getDate().toString().padStart(2, "0")}/${(getDateDate.getMonth() + 1).toString().padStart(2, "0")}/${getDateDate.getFullYear()}`
          : "N/A";

        return <div className="capitalize text-center">{formattedDate}</div>;
      },
    },
    {
      id: "billNumber",
      accessorKey: "billNumber",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Hoá đơn
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="uppercase flex items-center justify-center">
          <Link
            href={`/bill/${row.getValue("_id")}/`}
            className="text-center font-bold text-blue-500 underline"
          >
            {row.getValue("billNumber")}
          </Link>
        </div>
      ),
      enableSorting: true,
    },

    {
      id: "custommer",
      accessorKey: "user.fullName",
      accessorFn: (row) =>
        row.createdByUser.firstName + " " + row.createdByUser.lastName,

      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Khách hàng
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.createdByUser.firstName}{" "}
          {row.original.createdByUser.lastName}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "cardName",
      accessorKey: "card.name",
      accessorFn: (row) => row.card.name,
      header: ({ column }) => {
        return <div className="text-center">Tên thẻ</div>;
      },
      cell: ({ row }) => (
        <div className="text-center font-semibold p-0.5 bg-blue-200 text-blue-700">
          {row.original.card.name}
        </div>
      ),
    },
    {
      id: "bankCode",
      accessorKey: "card.bankCode",
      accessorFn: (row) => row.card.bankCode,
      header: ({ column }) => {
        return <div className="text-center">Tên ngân hàng</div>;
      },
      cell: ({ row }) => (
        <div className="text-center">{row.original.card.bankCode}</div>
      ),
    },
    {
      id: "lastNumber",
      accessorKey: "card.lastNumber",
      accessorFn: (row) => row.card.lastNumber,
      header: ({ column }) => {
        return <div className="text-center">4 số cuối</div>;
      },
      cell: ({ row }) => (
        <div className="text-center bg-blue-200 font-bold text-blue-700 p-0.5">
          {row.original.card.lastNumber}
        </div>
      ),
    },

    {
      id: "lot",
      accessorKey: "lot",
      header: () => <div className="text-center w-12">LOT</div>,
      cell: ({ row }) => (
        <div className="capitalize text-center p-0.5 bg-amber-500 text-white font-bold">
          {row.getValue("lot")}
        </div>
      ),
    },
    {
      id: "posTerminalName",
      accessorKey: "posTerminalName",
      header: () => <div className="text-center">Tên máy</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("posTerminalName")}</div>
      ),
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: () => <div className="text-center">Số tiền</div>,
      cell: ({ row }) => (
        <div className="capitalize text-center">
          {String(row.getValue("amount")).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </div>
      ),
    },
    {
      id: "customerFee",
      accessorKey: "customerFee",
      header: () => <div className="text-center">Phí khách</div>,
      cell: ({ row }) => {
        const customerFee = parseFloat(row.getValue("customerFee"));

        return <div className="text-center">{customerFee}</div>;
      },
      size: 100,
    },
    {
      id: "customerFeeAmount",
      accessorKey: "customerFeeAmount",
      header: () => <div className="text-center">Tiền khách</div>,
      cell: ({ row }) => {
        const customerFeeAmount = parseFloat(row.getValue("customerFeeAmount"));

        return (
          <div className="text-center">
            {String(customerFeeAmount).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        );
      },
    },
    {
      id: "posFee",
      accessorKey: "posFee",
      header: () => <div className="text-center">Phí máy</div>,
      cell: ({ row }) => {
        const posFee = parseFloat(row.getValue("posFee"));

        return <div className="text-center">{posFee}</div>;
      },
    },
    {
      id: "posFeeAmount",
      accessorKey: "posFeeAmount",
      header: () => <div className="text-center">Tiền máy</div>,
      cell: ({ row }) => {
        const posFeeAmount = parseFloat(row.getValue("posFeeAmount"));

        return (
          <div className="text-center">
            {String(posFeeAmount).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        );
      },
    },
    {
      id: "posFeePerDay",
      accessorKey: "posFeePerDay",
      header: () => <div className="text-center">Phí máy theo ngày</div>,
      cell: ({ row }) => {
        const posFeePerDay = parseFloat(row.getValue("posFeePerDay"));

        return <div className="text-center">{posFeePerDay}</div>;
      },
    },
    {
      id: "posFeePerDayAmount",
      accessorKey: "posFeePerDayAmount",
      header: () => <div className="text-center">Tiền máy theo ngày</div>,
      cell: ({ row }) => {
        const posFeePerDayAmount = parseFloat(
          row.getValue("posFeePerDayAmount"),
        );

        return (
          <div className="text-center">
            {String(posFeePerDayAmount).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        );
      },
    },
    {
      id: "backFee",
      accessorKey: "backFee",
      header: () => <div className="text-center">Phí Hoàn</div>,
      cell: ({ row }) => {
        const backFee = parseFloat(row.getValue("backFee"));

        return <div className="text-center">{backFee}</div>;
      },
    },
    {
      id: "backFeeAmount",
      accessorKey: "backFeeAmount",
      header: () => <div className="text-center">Tiền hoàn</div>,
      cell: ({ row }) => {
        const backFeeAmount = parseFloat(row.getValue("backFeeAmount"));

        return (
          <div className="text-center">
            {String(backFeeAmount).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        );
      },
    },
    {
      id: "differenceFee",
      accessorKey: "differenceFee",
      header: () => <div className="text-center">Phí chênh lệch</div>,
      cell: ({ row }) => {
        const differenceFee = parseFloat(row.getValue("differenceFee"));

        return <div className="text-center">{differenceFee}</div>;
      },
    },
    {
      id: "differenceFeeAmount",
      accessorKey: "differenceFeeAmount",
      header: () => <div className="text-center">Tiền chênh lệch</div>,
      cell: ({ row }) => {
        const differenceFeeAmount = parseFloat(
          row.getValue("differenceFeeAmount"),
        );

        return (
          <div className="text-center">
            {String(differenceFeeAmount).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        );
      },
    },
    {
      id: "paidDate",
      accessorKey: "paidDate",
      header: () => <div className="text-center">Ngày thanh toán</div>,
      cell: ({ row }) => {
        const getDate = row.getValue("paidDate");

        const getDateDate = getDate ? new Date(getDate as string) : null;
        const formattedDate = getDateDate
          ? `${getDateDate.getDate().toString().padStart(2, "0")}/${(getDateDate.getMonth() + 1).toString().padStart(2, "0")}/${getDateDate.getFullYear()}`
          : "Chưa thanh toán";

        return (
          <div className="capitalize text-center">
            {formattedDate ? formattedDate : "Chưa thanh toán"}
          </div>
        );
      },
    },
    {
      id: "note",
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
      <div className="flex items-center py-4 gap-2">
        <Input
          value={searchInput}
          onChange={handleSearch}
          placeholder="Tìm kiếm theo tên..."
          className="max-w-sm"
        />

        <div className="flex gap-1">
          <div className="flex-1 flex flex-col gap-1 justify-center items-center">
            <Select
              value={
                listCards.find((card: ICard) => card._id === cardId)?.name || ""
              }
              onValueChange={(newValue) => {
                if (newValue === "all") {
                  setCardId(null);
                  return;
                }
                handleSelectCard(newValue);
              }}
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
                  <SelectItem value="all">Huỷ chọn thẻ</SelectItem>
                  {listCards.map((card: ICard) => (
                    <SelectItem key={card?._id} value={card?.name}>
                      {card?.name} - {card?.lastNumber} - {card?.bankCode}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1 justify-center items-center">
            <div className="relative">
              <Select
                value={
                  posTerminalsData.find(
                    (pos: PosData) => pos._id === posTerminalId,
                  )?.name || ""
                }
                onValueChange={(newValue) => {
                  if (newValue === "all") {
                    setPosTerminalId(null);
                    return;
                  }
                  handleSelectPosTerminal(newValue);
                }}
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
                    <SelectItem value="all">Huỷ chọn máy POS</SelectItem>
                    {posTerminalsData.map((pos) => (
                      <SelectItem key={pos?._id} value={pos?.name}>
                        {pos?.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Cột <ChevronDown />
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
      <div className="flex justify-start items-center gap-2 mb-4">
        {!getAgentsLoading && isAdmin && (
          <Select
            value={
              agents?.length > 0
                ? agents.find((agentItem: IAgent) => agentItem?.name === agent)
                    ?.name
                : ""
            }
            onValueChange={(value: string) => {
              if (value === "all") {
                // setPage(1);
                setAgent(null);
              } else {
                // setPage(1);
                setAgent(value);
              }
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Chọn đại lý" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"all"}>Tất cả</SelectItem>
              {getAgents?.agents.map((agent: IAgent) => (
                <SelectItem key={agent?._id} value={agent.name}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="flex justify-start items-end gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-64 justify-between font-normal"
              >
                {dateRange && dateRange.from
                  ? dateRange.from.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }) +
                    (dateRange.to
                      ? " - " +
                        dateRange.to.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "")
                  : "Chọn ngày"}

                <IconCalendarWeek />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                className="rounded-lg border shadow-sm"
                disabled={(date) => date < new Date("1900-01-01")}
                locale={vi}
              />
            </PopoverContent>
          </Popover>

          <Button
            onClick={handleSetToToday}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Hôm nay
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table className="">
          <TableHeader className="bg-gray-100 w-auto">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="" key={header.id}>
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
          <TableBody className="w-auto py-4 px-2">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "w-auto break-words max-w-[250px]",
                        index % 2 === 0 && "bg-blue-50",
                        cell.column.id === "amount" &&
                          "text-center text-green-700 font-bold",
                        cell.column.id === "customerFeeAmount" &&
                          "text-center text-green-700 font-bold",
                        cell.column.id === "posFeeAmount" &&
                          "text-center text-green-700 font-bold",
                        cell.column.id === "posFeePerDayAmount" &&
                          "text-center text-green-700 font-bold",
                        cell.column.id === "backFeeAmount" &&
                          "text-center text-green-700 font-bold",
                        cell.column.id === "differenceFeeAmount" &&
                          "text-center text-green-700 font-bold",
                      )}
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
                  {isGetBillsLoading ? (
                    <LoadingThreeDot />
                  ) : (
                    <span>Không có dữ liệu</span>
                  )}
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

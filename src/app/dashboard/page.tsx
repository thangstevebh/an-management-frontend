"use client";

import { useMemo, useState } from "react";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { IconCalendarWeek } from "@tabler/icons-react";
import { DailyStatistics } from "@/components/dashboard/daily-statistics";
import { MonthlyStatistics } from "@/components/dashboard/monthly-statistics";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/use-user";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "@/lib/axios/axios.config";
import { ICommonResponse } from "@/lib/constant";
import { toast } from "sonner";
import { dayjs } from "@/lib/utils";
import CardSkeleton from "@/components/skeleton/card-dashboard";
import { DailyStatisticsCard } from "@/components/dashboard/daily-statistics-card";
import { MonthlyStatisticsCard } from "@/components/dashboard/monthly-statistics-card";

export default function Page() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });
  const [open, setOpen] = useState(false);

  const handleSetToToday = () => {
    const today = new Date();

    setDateRange((prevDateRange) => ({
      to: undefined,
      from: today,
    }));
  };

  const { data: getReportsData, isLoading: isGetReportsLoading } = useQuery({
    queryKey: ["get-dashboard-reports", user?.id, dateRange],
    queryFn: async (): Promise<ICommonResponse> => {
      try {
        const response = await useAxios.get<ICommonResponse<any>>(
          `card/get-dashboard-reports`,
          {
            params: {
              startDate: dateRange?.from
                ? dayjs(dateRange.from)
                    .tz("Asia/Ho_Chi_Minh")
                    .startOf("day")
                    .utc()
                    .toISOString()
                : undefined,
              endDate: dateRange?.to
                ? dayjs(dateRange.to)
                    .tz("Asia/Ho_Chi_Minh")
                    .endOf("day")
                    .utc()
                    .toISOString()
                : undefined,
            },
            headers: {
              "x-agent": (user?.agentId || "") as string,
            },
          },
        );

        if (response?.status !== 200 || response.data?.code !== 200) {
          throw new Error(
            `${response.data?.message || "Failed to fetch commands"}`,
          );
        }

        return response.data;
      } catch (error: any) {
        toast.error(`Lấy thông tin tất cả lệnh thất bại`, {
          description: "Xin hãy thử lại sau.",
        });
        throw error;
      }
    },
    enabled: !!user?.agentId,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const reports = useMemo(() => {
    return getReportsData?.data || [];
  }, [getReportsData]);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex justify-end items-end gap-2">
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
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
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
          Đặt ngày về hôm nay
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-blue-600 p-2">
          Thống kê giao dịch theo ngày
        </h2>
        {isGetReportsLoading && reports ? (
          <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <DailyStatistics
            totalTodayPayload={reports?.totalBills?.totalToday}
          />
        )}
      </div>

      <Separator className="my-2" />

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-blue-600 p-2">
          Thống kê thẻ theo ngày
        </h2>
        {isGetReportsLoading && reports ? (
          <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <DailyStatisticsCard
            totalTodayCardPayload={reports?.totalCardDetail?.totalToday}
          />
        )}
      </div>

      <Separator className="my-2" />

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-blue-600 p-2">
          Thống kê giao dịch theo tháng
        </h2>
        {isGetReportsLoading && reports ? (
          <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <MonthlyStatistics
            totalMonthlyPayload={reports?.totalBills?.totalMonth}
          />
        )}
      </div>

      <Separator className="my-2" />

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-blue-600 p-2">
          Thống kê thẻ theo tháng
        </h2>
        {isGetReportsLoading && reports ? (
          <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <MonthlyStatisticsCard
            totalMonthlyCardPayload={reports?.totalCardDetail?.totalMonth}
          />
        )}
      </div>
    </div>
  );
}

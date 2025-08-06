import {
  IconArrowRight,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Icon } from "@tabler/icons-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export function MonthlyStatisticsCard({
  totalMonthlyCardPayload,
}: {
  totalMonthlyCardPayload: {
    fromYearMonth: string;
    toYearMonth: string;
    totalMonth: string;
    totalMonthFeePercent: string;
    totalMonthNegativeRemainingAmount: string;
    totalMonthNotWithdrawAmount: string;
    totalMonthWithdrawedAmount: string;
  };
}) {
  const details = useMemo(() => {
    const details: {
      id: number;
      title: string;
      value: Record<string, any> | any;
      icon: Icon;
      badgeVariant:
        | "outline"
        | "default"
        | "secondary"
        | "destructive"
        | null
        | undefined;
    }[] = [
      {
        id: 1,
        title: "Tổng số tiền thẻ theo tháng",
        value: totalMonthlyCardPayload?.totalMonth,
        icon: IconTrendingUp,
        badgeVariant: "outline",
      },
      {
        id: 3,
        title: "Tổng số tiền âm theo tháng",
        value: totalMonthlyCardPayload?.totalMonthNegativeRemainingAmount,
        icon: IconTrendingUp,
        badgeVariant: "outline",
      },
      {
        id: 2,
        title: "Tổng phí thẻ theo tháng",
        value: totalMonthlyCardPayload?.totalMonthFeePercent,
        icon: IconTrendingUp,
        badgeVariant: "outline",
      },
      {
        id: 4,
        title: "Tổng phí rút theo tháng",
        value: totalMonthlyCardPayload?.totalMonthWithdrawedAmount,
        icon: IconTrendingDown,
        badgeVariant: "outline",
      },
      {
        id: 5,
        title: "Tổng số tiền chưa rút theo tháng",
        value: totalMonthlyCardPayload?.totalMonthNotWithdrawAmount,
        icon: IconTrendingUp,
        badgeVariant: "outline",
      },
    ];
    return details;
  }, [totalMonthlyCardPayload]);

  return (
    <div className="overflow-x-hidden *:data-[slot=card]:from-primary/4 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card max-w-6xl grid grid-cols-1 gap-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-4">
      {details &&
        details.length > 0 &&
        details.map((detail) => (
          <Card key={detail.id} className="@container/card">
            <CardHeader>
              <CardDescription className="font-semibold">
                {detail.title}
              </CardDescription>
              <CardTitle
                className={cn(
                  "text-lg font-semibold tabular-nums @[200px]/card:text-2xl",
                  detail.id === 1 && "text-green-500",
                  detail.id === 3 && "text-red-500",
                )}
              >
                {detail.id === 1 && "+"}
                {detail.id === 3 && "-"}
                {detail.value}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col justify-start gap-1">
              <div className="text-muted-foreground">
                <Badge
                  variant={detail?.badgeVariant || "outline"}
                  className="flex items-center gap-1 text-blue-500"
                >
                  <p className="">Thời gian:</p>{" "}
                  {totalMonthlyCardPayload?.fromYearMonth} <IconArrowRight />{" "}
                  {totalMonthlyCardPayload?.toYearMonth}
                </Badge>
              </div>
            </CardFooter>
          </Card>
        ))}
    </div>
  );
}

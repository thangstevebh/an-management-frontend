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

export function MonthlyStatistics({
  totalMonthlyPayload,
}: {
  totalMonthlyPayload: {
    fromYearMonth: string;
    toYearMonth: string;
    totalMonth: string;
    totalMonthBackFee: string;
    totalMonthCount: number;
    totalMonthCustomerFee: string;
    totalMonthDifferenceFee: string;
    totalMonthPosFee: string;
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
        title: "Tổng số tiền theo tháng",
        value: totalMonthlyPayload?.totalMonth,
        icon: IconTrendingUp,
        badgeVariant: "outline",
      },
      {
        id: 2,
        title: "Tổng số giao dịch theo tháng",
        value: totalMonthlyPayload?.totalMonthCount,
        icon: IconTrendingUp,
        badgeVariant: "outline",
      },
      {
        id: 3,
        title: "Tổng phí khách hàng theo tháng",
        value: totalMonthlyPayload?.totalMonthCustomerFee,
        icon: IconTrendingUp,
        badgeVariant: "outline",
      },
      {
        id: 4,
        title: "Tổng phí POS theo tháng",
        value: totalMonthlyPayload?.totalMonthPosFee,
        icon: IconTrendingUp,
        badgeVariant: "outline",
      },
      {
        id: 5,
        title: "Tổng phí hoàn theo tháng",
        value: totalMonthlyPayload?.totalMonthBackFee,
        icon: IconTrendingDown,
        badgeVariant: "outline",
      },
      {
        id: 6,
        title: "Tổng phí chênh lệch theo tháng",
        value: totalMonthlyPayload?.totalMonthDifferenceFee,
        icon: IconTrendingDown,
        badgeVariant: "outline",
      },
    ];
    return details;
  }, [totalMonthlyPayload]);

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
                )}
              >
                {detail.id === 1 && "+"}
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
                  {totalMonthlyPayload?.fromYearMonth} <IconArrowRight />{" "}
                  {totalMonthlyPayload?.toYearMonth}
                </Badge>
              </div>
            </CardFooter>
          </Card>
        ))}
    </div>
  );
}

"use client";

import { ListBillsData } from "@/components/card/list-bills-data";
import { useUser } from "@/hooks/use-user";

export default function Page() {
  const { user, isAdmin } = useUser();

  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Thông tin hoá đơn
      </h1>
      <div className="h-full w-full max-w-full mx-auto px-4 lg:px-6">
        <ListBillsData />
      </div>
    </div>
  );
}

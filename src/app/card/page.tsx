"use client";

import { ListCardsData } from "@/components/card/list-card-data";
import { ButtonBack } from "@/components/ui/button-back";

export default function Page() {
  return (
    <div>
      <ButtonBack />

      <h1 className="text-2xl font-semibold text-center mb-6">Thông tin thẻ</h1>
      <div className="h-full max-w-[1200px] mx-auto px-4 lg:px-6">
        <ListCardsData />
      </div>
    </div>
  );
}

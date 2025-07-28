"use client";

import { ListPosData } from "@/components/pos/list-pos-data";
import { ButtonBack } from "@/components/ui/button-back";

export default function Page() {
  return (
    <div className="">
      <ButtonBack />
      <h1 className="text-2xl font-semibold text-center mb-6">Thông máy POS</h1>
      <div className="h-full mx-auto w-full">
        <ListPosData />
      </div>
    </div>
  );
}

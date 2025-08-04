"use client";

import PosById from "@/components/pos/pos-by-id";
import { ButtonBack } from "@/components/ui/button-back";
import PosTerminalUI from "@/components/ui/pos-terminal";
import React from "react";

export default function Page() {
  return (
    <div>
      <ButtonBack />
      <div className="flex flex-col gap-4 w-full mx-auto">
        <div className="flex flex-col justify-center items-center mb-1">
          <h1 className="text-2xl font-semibold">Thông tin máy POS</h1>
          <p className="text-gray-500 ml-2">
            Vui lòng chọn máy POS để xem chi tiết.
          </p>
        </div>
        <div className="grid grid-cols-4 w-full items-center justify-center">
          <div className="flex justify-center items-start h-full w-full col-span-1">
            <PosTerminalUI />
          </div>
          <div className="col-span-3 w-full">
            <PosById />
          </div>
        </div>
      </div>
    </div>
  );
}

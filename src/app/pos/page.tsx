"use client";

import { ListPosData } from "@/components/pos/list-pos-data";
import { ButtonBack } from "@/components/ui/button-back";

export default function Page() {
  return (
    <div className="">
      <ButtonBack />
      <h1 className="text-2xl font-semibold text-center mb-6">Máy POS</h1>
      <p className="text-center mb-4 text-gray-500">
        Danh sách máy POS được sử dụng để thanh toán và quản lý giao dịch. Bạn
        có thể xem chi tiết từng máy POS bằng cách chọn từ danh sách bên dưới.
      </p>

      <div className="h-full mx-auto w-full">
        <ListPosData />
      </div>
    </div>
  );
}

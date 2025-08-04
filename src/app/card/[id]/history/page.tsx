"use client";

import { ButtonBack } from "@/components/ui/button-back";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams();
  return (
    <div>
      <ButtonBack />
      <div className="flex flex-col gap-4 w-full mx-auto">
        <div className="flex flex-col justify-center items-center mb-1">
          <h1 className="text-2xl font-semibold">Lịch sử thẻ</h1>
          <p className="text-center text-gray-500 ml-2">
            Lịch sử giao dịch sẽ hiển thị tất cả các giao dịch liên quan đến thẻ
            này, bao gồm các giao dịch đã thực hiện và các giao dịch đang chờ xử
            lý.
          </p>
          <p>{id}</p>
        </div>
      </div>
    </div>
  );
}

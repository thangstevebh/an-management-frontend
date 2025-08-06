"use client";

import { ListCardsData } from "@/components/card/list-card-data";
import { ButtonBack } from "@/components/ui/button-back";

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-center mb-6">Thông tin thẻ</h1>
      <p className="text-center mb-4 text-gray-500">
        Vui lòng chọn thẻ để xem chi tiết. Nếu bạn không thấy thẻ nào, hãy kiểm
        tra lại quyền truy cập hoặc liên hệ với quản trị viên.
      </p>

      <div className="h-full max-w-[1200px] mx-auto px-4 lg:px-6">
        <ListCardsData />
      </div>
    </div>
  );
}

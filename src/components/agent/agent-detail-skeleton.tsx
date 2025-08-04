import React from "react";

export default function AgentDetailSkeleton() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-center mb-6">
        Thông tin đại lý
      </h1>
      <div className="flex flex-col justify-center items-center mb-4">
        {/* Placeholder for "Vui lòng chọn đại lý để xem chi tiết." */}
        <div className="h-5 w-64 animate-pulse rounded bg-gray-300"></div>
      </div>
      <div className="h-full w-full px-4 lg:px-6">
        <div className="flex flex-row justify-center items-center justify-items-center text-center bg-white p-6 rounded-lg shadow-sm border gap-2">
          {/* Skeleton for Tên đại lý */}
          <div className="w-[200px]">
            <label className="block text-sm font-medium text-gray-700">
              Tên đại lý
            </label>
            <div className="mt-1">
              <div className="h-6 w-3/4 animate-shimmer rounded bg-gray-300 mx-auto"></div>
            </div>
          </div>

          {/* Skeleton for Chủ sở hữu */}
          <div className="w-[200px]">
            <label className="block text-sm font-medium text-gray-700">
              Chủ sở hữu
            </label>
            <div className="mt-1">
              <div className="h-6 w-4/5 animate-shimmer rounded bg-gray-300 mx-auto"></div>
            </div>
          </div>

          {/* Skeleton for Trạng thái */}
          <div className="w-[200px]">
            <label className="block text-sm font-medium text-gray-700">
              Trạng thái
            </label>
            <div className="mt-1">
              <div className="h-6 w-2/3 animate-shimmer rounded bg-gray-300 mx-auto"></div>
            </div>
          </div>

          {/* Skeleton for Ngày tạo */}
          <div className="w-[200px]">
            <label className="block text-sm font-medium text-gray-700">
              Ngày tạo
            </label>
            <div className="mt-1">
              <div className="h-6 w-full animate-shimmer rounded bg-gray-300 mx-auto"></div>
            </div>
          </div>

          {/* Skeleton for Ngày cập nhật */}
          <div className="w-[200px]">
            <label className="block text-sm font-medium text-gray-700">
              Ngày cập nhật
            </label>
            <div className="mt-1">
              <div className="h-6 w-full animate-shimmer rounded bg-gray-300 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

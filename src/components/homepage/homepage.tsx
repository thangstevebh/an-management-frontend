"use client";

import { getQueryClient } from "@/lib/get-query-client";
import { pokemonOptions } from "@/lib/queryOptions/sampleQueryOption";
import { Button } from "../ui/button";
import Link from "next/link";

export default function HomePage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(pokemonOptions);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col items-center sm:items-start gap-4">
          <h1 className="text-3xl font-bold text-center sm:text-left">
            Chào mừng đến với hệ thống quản lý
          </h1>
          <p className="text-lg text-gray-600 text-center sm:text-left">
            Hệ thống giúp bạn quản lý một cách hiệu quả và dễ dàng.
          </p>

          <Button
            variant="secondary"
            asChild
            size="sm"
            className="hidden bg-blue-500 hover:bg-blue-700 hover:text-white sm:flex"
          >
            <Link
              href={"/login"}
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-white hover:text-blue-200 transition-colors duration-300"
            >
              Đăng nhập ngay
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

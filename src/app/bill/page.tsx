"use client";

import { useUser } from "@/hooks/use-user";

export default function Page() {
  const { user, isAdmin } = useUser();

  return (
    <div className="flex h-full w-full items-center justify-center">
      <h1 className="text-2xl font-bold">Chức năng đang được phát triển</h1>
    </div>
  );
}

"use client";

import { ButtonBack } from "@/components/ui/button-back";
import { useUser } from "@/hooks/use-user";
import { useParams } from "next/navigation";

export default function Page() {
  const { user } = useUser();
  const { id } = useParams();
  return (
    <div>
      <ButtonBack />

      <div className="flex h-full w-full items-center justify-center">
        <h1 className="text-2xl font-bold">Chức năng đang được phát triển</h1>
      </div>
    </div>
  );
}

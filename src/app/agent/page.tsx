"use client";

import { ButtonBack } from "@/components/ui/button-back";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { user, isAdmin } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin && user?.agentId) {
      router.push(`/agent/${user.agentId}`);
    }
  }, [isAdmin, user?.agentId, router]);

  return (
    <div>
      <ButtonBack />

      {isAdmin && (
        <div className="flex flex-col justify-center items-center gap-4 py-4 md:gap-6 md:py-6">
          <h1 className="text-2xl font-bold">Thông tin đại lý</h1>
          <p className="text-gray-500">
            Please select an agent from the list to view details.
          </p>
        </div>
      )}
    </div>
  );
}

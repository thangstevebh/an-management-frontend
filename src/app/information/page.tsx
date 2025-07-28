"use client";

import { useUserStore } from "@/lib/providers/user-provider";

export default function Page() {
  const { user: userStore, storeUser } = useUserStore((state) => state);
  console.log("userStore", userStore);
  return (
    <div>
      <p>INFORMATION</p>
    </div>
  );
}

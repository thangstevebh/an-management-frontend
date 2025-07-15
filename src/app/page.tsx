"use client";

import HomePage from "@/components/homepage/homepage";
import { CounterStoreProvider } from "@/lib/providers/counter-provider";

export default function Home() {
  return (
    <div>
      <CounterStoreProvider>
        <HomePage />
      </CounterStoreProvider>
    </div>
  );
}

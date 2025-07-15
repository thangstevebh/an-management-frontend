"use client";

import HomePage from "@/components/homepage/homepage";
import { CounterStoreProvider } from "@/lib/providers/CounterProvider";

export default function Home() {
  return (
    <div>
      <CounterStoreProvider>
        <HomePage />
      </CounterStoreProvider>
    </div>
  );
}

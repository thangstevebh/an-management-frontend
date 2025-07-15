"use client";

import HomePage from "@/components/homepage/Homepage";
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

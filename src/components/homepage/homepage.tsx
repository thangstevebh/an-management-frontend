"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCounterStore } from "@/lib/providers/counterProvider";

export default function HomePage() {
  const { count, incrementCount, decrementCount } = useCounterStore(
    (state) => state,
  );
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <div
          style={{ border: "1px solid blue", padding: "10px", margin: "10px" }}
        >
          <h3>Counter (Shared Store)</h3>
          <p>Count: {count}</p>
          <Button onClick={incrementCount}>+</Button>
          <Button onClick={decrementCount}>-</Button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

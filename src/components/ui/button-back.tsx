"use client";

import * as React from "react";

import { IconChevronLeft } from "@tabler/icons-react";
import { Button } from "./button";
import { useRouter } from "next/navigation";

function ButtonBack() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.back()}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <IconChevronLeft className="!size-5" size={24} />
      <span>Back</span>
    </Button>
  );
}

export { ButtonBack };

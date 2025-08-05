import React from "react";

export default function CardSkeleton() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex justify-between items-center">
          <div className="h-4 w-1/3 rounded-full bg-gray-200 animate-shimmer"></div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-12 rounded-full bg-gray-200 animate-shimmer"></div>
          </div>
        </div>
        <div className="mt-2 h-8 w-2/3 rounded-md bg-gray-200 animate-shimmer"></div>
      </div>

      <div className="flex flex-col items-start gap-1.5 p-6 pt-0 text-sm">
        <div className="h-4 w-4/5 rounded-full bg-gray-200 animate-shimmer"></div>
        <div className="h-3 w-1/2 rounded-full bg-gray-200 animate-shimmer"></div>
      </div>
    </div>
  );
}

import React from "react";

export default function CreditCardSkeleton() {
  return (
    <div className="relative m-auto h-48 w-80 rounded-xl bg-gray-200 text-white shadow-xl sm:h-56 sm:w-96">
      {/* Background color changed to gray to fit skeleton aesthetic */}
      <div className="absolute top-4 w-full px-8 sm:top-8">
        <div className="flex justify-between">
          <div className="w-full">
            {/* Placeholder for Name */}
            <div className="h-4 w-1/3 animate-shimmer rounded bg-gray-300 mb-2"></div>
            <div className="h-6 w-3/4 animate-shimmer rounded bg-gray-300"></div>
          </div>
        </div>
        <div className="pt-4">
          {" "}
          {/* Adjusted padding to match original */}
          {/* Placeholder for Card Number */}
          <div className="h-4 w-1/4 animate-shimmer rounded bg-gray-300 mb-2"></div>
          <div className="h-6 w-full animate-shimmer rounded bg-gray-300"></div>
        </div>
        <div className="pt-4 pr-6 sm:pt-6">
          <div className="flex justify-between">
            {/* Placeholder for Valid From */}
            <div className="w-1/4">
              <div className="h-3 w-3/4 animate-shimmer rounded bg-gray-300 mb-1"></div>
              <div className="h-5 w-full animate-shimmer rounded bg-gray-300"></div>
            </div>
            {/* Placeholder for Expiry */}
            <div className="w-1/4">
              <div className="h-3 w-3/4 animate-shimmer rounded bg-gray-300 mb-1"></div>
              <div className="h-5 w-full animate-shimmer rounded bg-gray-300"></div>
            </div>

            {/* Placeholder for CVV */}
            <div className="w-1/6">
              {" "}
              {/* Slightly smaller width for CVV */}
              <div className="h-3 w-full animate-shimmer rounded bg-gray-300 mb-1"></div>
              <div className="h-5 w-full animate-shimmer rounded bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

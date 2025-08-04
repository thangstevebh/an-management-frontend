import React from "react";

export default function GlobalPageLoader() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gray-50">
      <div className="flex space-x-2 justify-center items-center h-screen dark:invert">
        <div className="h-8 w-8 bg-gray-600 opacity-80 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-8 w-8 bg-gray-600 opacity-80 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-8 w-8 bg-gray-600 opacity-80 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}

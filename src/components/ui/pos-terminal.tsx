import React from "react";

export default function PosTerminalUI() {
  return (
    <div className="relative w-80 h-[500px] bg-gray-900 rounded-3xl shadow-lg overflow-hidden flex flex-col border-2 border-gray-800">
      <div className="bg-gray-800 h-20 flex flex-col justify-end items-center py-2 relative rounded-t-3xl">
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-blue-500 rounded-bl-xl"></div>
        <div className="absolute top-0 right-0 bottom-0 w-2 bg-blue-500 rounded-br-xl"></div>

        <div className="text-gray-400 text-sm mb-1">Welcome</div>
        <div className="flex items-center space-x-2 text-white text-lg">
          <svg
            className="w-8 h-8"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22 10V8c-1.66-2.01-4.14-3.51-7-3.93v2.09c2.19.46 4.1 1.77 5.5 3.59zm-1.5 3.5c-.83-1.01-2.07-1.76-3.5-2.1v2.09c1.07.31 1.94.94 2.5 1.78zm-3 3c-.42-.51-1.03-.89-1.5-.99v2.09c.27.08.57.24.8.45.17.16.32.33.45.5zm-3-11v2.09c-.83-.19-1.7-.29-2.5-.29-3.92 0-7.23 2.51-8.5 6h2.09c1.01-2.34 3.32-4 6.41-4 1.17 0 2.27.27 3.23.75zM12 21c-3.92 0-7.23-2.51-8.5-6H1.5c1.27 3.49 4.58 6 8.5 6s7.23-2.51 8.5-6h-2.09c-1.01 2.34-3.32 4-6.41 4s-5.4-1.66-6.41-4H12z" />
            <path d="M16 11c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z" />
          </svg>
          <svg
            className="w-8 h-8 -rotate-90 text-gray-200"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V7h2v2zm3 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
          </svg>
        </div>
      </div>

      {/* Screen Area */}
      <div className="flex-1 bg-white mx-4 mt-4 mb-2 rounded-lg flex items-center justify-center p-4">
        <div className="text-gray-400 text-center font-bold text-xl">
          <p className="mt-2 text-4xl">Welcome</p>
        </div>
      </div>

      {/* Function Buttons (F1, F2, F3) */}
      <div className="flex justify-around mx-6 mb-3">
        <button className="bg-gray-700 text-white text-xs px-3 py-1 rounded-md">
          F1
        </button>
        <button className="bg-gray-700 text-white text-xs px-3 py-1 rounded-md">
          F2
        </button>
        <button className="bg-gray-700 text-white text-xs px-3 py-1 rounded-md">
          F3
        </button>
      </div>

      {/* Keypad */}
      <div className="text-white grid grid-cols-4 gap-2 p-4 mx-2 mb-4 bg-gray-800 rounded-xl">
        {/* Row 1 */}
        <button className="keypad-btn">
          1 <span className="keypad-sub">QZ</span>
        </button>
        <button className="keypad-btn">
          2 <span className="keypad-sub">ABC</span>
        </button>
        <button className="keypad-btn">
          3 <span className="keypad-sub">DEF</span>
        </button>
        <button className="keypad-btn keypad-special bg-red-600 text-white">
          X
        </button>

        {/* Row 2 */}
        <button className="keypad-btn">
          4 <span className="keypad-sub">GHI</span>
        </button>
        <button className="keypad-btn">
          5 <span className="keypad-sub">JKL</span>
        </button>
        <button className="keypad-btn">
          6 <span className="keypad-sub">MNO</span>
        </button>
        <button className="keypad-btn keypad-special bg-yellow-500 text-white">
          <svg
            className="w-6 h-6 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
        </button>

        {/* Row 3 */}
        <button className="keypad-btn">
          7 <span className="keypad-sub">PRS</span>
        </button>
        <button className="keypad-btn">
          8 <span className="keypad-sub">TUV</span>
        </button>
        <button className="keypad-btn">
          9 <span className="keypad-sub">WXY</span>
        </button>
        <button className="keypad-btn keypad-special bg-green-600 text-white">
          #
        </button>

        {/* Row 4 (Bottom special keys) */}
        <button className="keypad-btn">*</button>
        <button className="keypad-btn">0</button>
        <button className="keypad-btn"># 1</button>
        <button className="keypad-btn keypad-special bg-gray-700 text-white flex items-center justify-center">
          {/* Small icon if needed, placeholder */}
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-8c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

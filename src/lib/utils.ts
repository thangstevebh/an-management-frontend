import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertDecimal128ToString(decimalValue: any) {
  // Check if it's the specific {$numberDecimal: '...'} object format
  if (
    typeof decimalValue === "object" &&
    decimalValue !== null &&
    typeof decimalValue.$numberDecimal === "string"
  ) {
    return decimalValue.$numberDecimal;
  }
  // If it's already a string, return it directly
  else if (typeof decimalValue === "string") {
    return decimalValue;
  }
  // If it's a number, convert it to a string
  else if (typeof decimalValue === "number") {
    return String(decimalValue);
  }
  // If it's any other unrecognized format
  else {
    console.warn(
      "Input is not in expected {$numberDecimal: '...'}, string, or number format:",
      decimalValue,
    );
    return null;
  }
}

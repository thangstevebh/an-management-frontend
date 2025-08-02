import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

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

type Dayjs = dayjs.Dayjs;

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TIME_FORMAT = "YYYY-MM-DDTHH:mm:ssZ";

const toUtc = function toUtc(time: Dayjs, format = DEFAULT_TIME_FORMAT) {
  return dayjs(time).utc().format(format);
};

const toGMT7 = (time: Dayjs, format = DEFAULT_TIME_FORMAT) => {
  return dayjs(time).tz("Asia/Ho_Chi_Minh").format(format);
};

export { dayjs, toUtc, toGMT7 };

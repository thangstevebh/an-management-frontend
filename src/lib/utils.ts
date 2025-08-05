import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertDecimal128ToString(decimalValue: any) {
  if (
    typeof decimalValue === "object" &&
    decimalValue !== null &&
    typeof decimalValue.$numberDecimal === "string"
  ) {
    return decimalValue.$numberDecimal;
  } else if (typeof decimalValue === "string") {
    return decimalValue;
  } else if (typeof decimalValue === "number") {
    return String(decimalValue);
  } else {
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

export const DEFAULT_TIME_FORMAT = "YYYY-MM-DDTHH:mm:ssZ";

export const toUtc = function toUtc(time: Dayjs, format = DEFAULT_TIME_FORMAT) {
  return dayjs(time).utc().format(format);
};

export const toGMT7 = (time: Dayjs, format = DEFAULT_TIME_FORMAT) => {
  return dayjs(time).tz("Asia/Ho_Chi_Minh").format(format);
};
dayjs.locale("vi");

export { dayjs };

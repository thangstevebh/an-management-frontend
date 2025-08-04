import { z } from "zod";

export const addBillSchema = z.object({
  amount: z
    .string()
    .transform((val) => {
      const num = parseFloat(val.replace(/\,/g, ""));
      return isNaN(num) ? val : num;
    })
    .refine((val) => typeof Number(val) === "number", {
      message: "Số tiền phải là một số",
    })
    .refine((val) => Number(val) >= 0, {
      message: "Số tiền không được nhỏ hơn 0",
    })
    .default(0),

  cardId: z
    .string()
    .trim()
    .nonempty("ID thẻ không được để trống")
    .regex(/^[0-9a-fA-F]{24}$/, "ID thẻ không hợp lệ"),

  posTerminalId: z
    .string()
    .trim()
    .nonempty("ID máy POS không được để trống")
    .regex(/^[0-9a-fA-F]{24}$/, "ID máy POS không hợp lệ"),

  lot: z
    .string()
    .trim()
    .nonempty("Lot không được để trống")
    .min(1, { message: "Lot không được để trống" }),

  billNumber: z
    .string()
    .trim()
    .nonempty("Số cuối không được để trống")
    .min(1, { message: "Số hóa đơn không được để trống" }),

  customerFee: z
    .string()
    .transform((val) => {
      const num = parseFloat(val);
      return isNaN(num) ? val : num;
    })
    .refine((val) => typeof val === "number", {
      message: "Phí theo ngày phải là một số",
    })
    .refine((val) => Number(val) >= 0, {
      message: "Phí theo ngày không được nhỏ hơn 0",
    })
    .refine((val) => Number(val) <= 100, {
      message: "Phí theo ngày không được lớn hơn 100",
    })
    .default(0),

  posFee: z
    .string()
    .transform((val) => {
      const num = parseFloat(val);
      return isNaN(num) ? val : num;
    })
    .refine((val) => typeof val === "number", {
      message: "Phí theo ngày phải là một số",
    })
    .refine((val) => Number(val) >= 0, {
      message: "Phí theo ngày không được nhỏ hơn 0",
    })
    .refine((val) => Number(val) <= 100, {
      message: "Phí theo ngày không được lớn hơn 100",
    })
    .default(0),

  backFee: z
    .string()
    .transform((val) => {
      const num = parseFloat(val);
      return isNaN(num) ? val : num;
    })
    .refine((val) => typeof val === "number", {
      message: "Phí theo ngày phải là một số",
    })
    .refine((val) => Number(val) >= 0, {
      message: "Phí theo ngày không được nhỏ hơn 0",
    })
    .refine((val) => Number(val) <= 100, {
      message: "Phí theo ngày không được lớn hơn 100",
    })
    .default(0),
  note: z.string().optional(),
});

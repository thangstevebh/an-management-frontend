import { z } from "zod";

export enum PosTerminalType {
  WIFI = "wifi",
  SIM = "sim",
  OTHER = "other",
}

export const createPosSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty("Tên thẻ không được để trống")
    .min(3, "Tên thẻ phải có ít nhất 3 ký tự")
    .max(50, "Tên thẻ không được vượt quá 50 ký tự"),

  posType: z.enum(PosTerminalType),

  feePerDay: z
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

  feePerTerminal: z
    .string()
    .transform((val) => {
      const num = parseFloat(val);
      return isNaN(num) ? val : num;
    })
    .refine((val) => typeof val === "number", {
      message: "Phí theo máy phải là một số",
    })
    .refine((val) => Number(val) >= 0, {
      message: "Phí theo máy không được nhỏ hơn 0",
    })
    .refine((val) => Number(val) <= 100, {
      message: "Phí theo máy không được lớn hơn 100",
    })
    .default(0),

  feeBack: z
    .string()
    .transform((val) => {
      const num = parseFloat(val);
      return isNaN(num) ? val : num;
    })
    .refine((val) => typeof val === "number", {
      message: "Phí hoàn phải là một số",
    })
    .refine((val) => Number(val) >= 0, {
      message: "Phí hoàn không được nhỏ hơn 0",
    })
    .refine((val) => Number(val) <= 100, {
      message: "Phí hoàn không được lớn hơn 100",
    })
    .default(0),
});

export type CreateCardSchema = z.infer<typeof createPosSchema>;

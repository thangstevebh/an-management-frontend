import { z } from "zod";

export const addWithdrawCommandSchema = z.object({
  amount: z
    .string()
    .transform((val) => {
      const num = parseFloat(val.replace(/\./g, ""));
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

  note: z.string().optional(),
});

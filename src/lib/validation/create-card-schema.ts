import { z } from "zod";

export const createCardSchema = z.object({
  name: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "Tên thẻ chỉ được chứa chữ cái không dấu, số và khoảng trắng",
    )
    .nonempty("Tên thẻ không được để trống")
    .min(3, "Tên thẻ phải có ít nhất 3 ký tự")
    .max(50, "Tên thẻ không được vượt quá 50 ký tự"),

  bankCode: z
    .string()
    .trim()
    .nonempty("Tên thẻ không được để trống")
    .min(1, "Mã ngân hàng không được để trống")
    .max(20, "Mã ngân hàng không được vượt quá 20 ký tự"),

  lastNumber: z
    .string()
    .trim()
    .nonempty("Số cuối không được để trống")
    .min(4, "Số cuối phải có 4 chữ số")
    .max(4, "Số cuối phải có 4 chữ số"),

  defaultFeePercent: z
    .string()
    .transform((val) => {
      const num = parseFloat(val);
      return isNaN(num) ? val : num;
    })
    .refine((val) => typeof val === "number", {
      message: "Phí mặc định phải là một số",
    })
    .refine((val) => Number(val) >= 0, {
      message: "Phí mặc định không được nhỏ hơn 0",
    })
    .refine((val) => Number(val) <= 100, {
      message: "Phí mặc định không được lớn hơn 100",
    })
    .default(0),

  feeBack: z
    .string()
    .transform((val) => {
      const num = parseFloat(val);
      return isNaN(num) ? val : num;
    })
    .refine((val) => typeof val === "number", {
      message: "Phí mặc định phải là một số",
    })
    .refine((val) => Number(val) >= 0, {
      message: "Phí mặc định không được nhỏ hơn 0",
    })
    .refine((val) => Number(val) <= 100, {
      message: "Phí mặc định không được lớn hơn 100",
    })
    .default(0),

  maturityDate: z
    .string()
    .transform((str) => new Date(str))
    .refine((date) => !isNaN(date.getTime()), {
      message: "Ngày đáo hạn không hợp lệ",
    }),
  // .refine((date) => date > new Date(), {
  //   message: "Ngày đáo hạn phải sau ngày hiện tại",
  // }),

  collaboratorName: z.string().trim().optional(),
});

export type CreateCardSchema = z.infer<typeof createCardSchema>;

import { z } from "zod";

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, { message: "Mật khẩu cũ phải có ít nhất 6 ký tự" })
      .max(50, { message: "Mật khẩu cũ không được vượt quá 50 ký tự" }),

    newPassword: z
      .string()
      .min(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự" })
      .max(50, { message: "Mật khẩu mới không được vượt quá 50 ký tự" }),

    confirmNewPassword: z
      .string()
      .min(6, { message: "Xác nhận mật khẩu mới phải có ít nhất 6 ký tự" })
      .max(50, {
        message: "Xác nhận mật khẩu mới không được vượt quá 50 ký tự",
      }),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Xác nhận mật khẩu mới không khớp với mật khẩu mới",
        path: ["confirmNewPassword"], // Specify the path to the field where the error occurred
      });
    }
  });

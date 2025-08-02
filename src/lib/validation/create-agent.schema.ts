import { z } from "zod";

export const createAgentSchema = z.object({
  agentName: z
    .string()
    .min(3, { message: "Tên đại lý là bắt buộc" })
    .max(50, { message: "Tên đại lý phải ít hơn 50 ký tự" }),

  username: z
    .string()
    .min(6, { message: "Tên đăng nhập là bắt buộc" })
    .max(20, { message: "Tên đăng nhập phải ít hơn 20 ký tự" }),

  firstName: z
    .string()
    .min(1, { message: "Họ là bắt buộc" })
    .max(30, { message: "Họ phải ít hơn 30 ký tự" }),

  lastName: z
    .string()
    .min(1, { message: "Tên là bắt buộc" })
    .max(30, { message: "Tên phải ít hơn 30 ký tự" }),

  phoneNumber: z
    .string()
    .min(10, { message: "Số điện thoại phải có ít nhất 10 chữ số" })
    .max(15, { message: "Số điện thoại phải ít hơn 15 chữ số" }),

  isMain: z.boolean().optional().default(false),
});

export type CreateAgentSchema = z.infer<typeof createAgentSchema>;

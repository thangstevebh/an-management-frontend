import { z } from "zod";

export const createAgentMemberSchema = z.object({
  username: z
    .string()
    .nonempty("Username không được để trống")
    .min(3, { message: "Username phải có ít nhất 3 ký tự" })
    .max(20, { message: "Username không được vượt quá 20 ký tự" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username chỉ được chứa chữ cái, số và dấu gạch dưới",
    }),
  firstName: z
    .string()
    .min(1, { message: "Firstname phải có ít nhất 1 ký tự" })
    .max(50, { message: "Firstname không vượt quá 50 ký tự" }),
  lastName: z
    .string()
    .min(1, { message: "Last name phải có ít nhất 1 ký tự" })
    .max(50, { message: "Last name không vượt quá 50 ký tự" }),
  phoneNumber: z
    .string()
    .min(10, { message: "Số điện thoại phải có 10 chữ số" })
    .max(15, { message: "Số điện thoại không được vượt quá 15 chữ số" })
    .regex(/^\d+$/, { message: "Số điện thoại chỉ được chứa các chữ số" }),
  agentRole: z.enum(["member", "owner", "manager"]),
});

import { z } from "zod";

export const createAgentSchema = z.object({
  agentName: z
    .string()
    .min(3, { message: "Agent name is required" })
    .max(50, { message: "Agent name must be less than 50 characters" }),

  username: z
    .string()
    .min(6, { message: "Username is required" })
    .max(20, { message: "Username must be less than 20 characters" }),

  firstName: z
    .string()
    .min(1, { message: "First name is required" })
    .max(30, { message: "First name must be less than 30 characters" }),

  lastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .max(30, { message: "Last name must be less than 30 characters" }),

  phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(15, { message: "Phone number must be less than 15 digits" }),

  isMain: z.boolean().optional().default(false),
});

export type CreateAgentSchema = z.infer<typeof createAgentSchema>;

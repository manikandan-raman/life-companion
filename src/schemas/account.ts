import { z } from "zod";

export const accountSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  type: z.enum(["bank", "cash", "credit_card"], {
    message: "Invalid account type",
  }),
  balance: z
    .number()
    .multipleOf(0.01, "Balance can have at most 2 decimal places")
    .default(0),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .default("#3b82f6"),
  icon: z
    .string()
    .max(50, "Icon name must be less than 50 characters")
    .default("wallet"),
  isDefault: z.boolean().default(false),
});

export type AccountFormData = z.infer<typeof accountSchema>;

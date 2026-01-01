import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  type: z.enum(["income", "needs", "wants", "savings"], {
    message: "Invalid category type",
  }),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .default("#6b7280"),
  icon: z
    .string()
    .max(50, "Icon name must be less than 50 characters")
    .default("circle"),
});

export const tagSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .default("#6b7280"),
});

export const budgetGoalSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
  needsPercentage: z
    .number()
    .min(0)
    .max(100)
    .multipleOf(0.01)
    .default(50),
  wantsPercentage: z
    .number()
    .min(0)
    .max(100)
    .multipleOf(0.01)
    .default(30),
  savingsPercentage: z
    .number()
    .min(0)
    .max(100)
    .multipleOf(0.01)
    .default(20),
}).refine(
  (data) => {
    const total = data.needsPercentage + data.wantsPercentage + data.savingsPercentage;
    return Math.abs(total - 100) < 0.01;
  },
  {
    message: "Percentages must add up to 100%",
    path: ["needsPercentage"],
  }
);

export type CategoryFormData = z.infer<typeof categorySchema>;
export type TagFormData = z.infer<typeof tagSchema>;
export type BudgetGoalFormData = z.infer<typeof budgetGoalSchema>;

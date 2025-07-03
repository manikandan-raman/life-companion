import { z } from "zod";

export const expenseCategorySchema = z.object({
  id: z.number({ description: "The expense category's ID" }),
  name: z.string({ description: "The expense category's name" }),
  isActive: z.boolean({ description: "Whether the expense category is active" }),
});

export const createExpenseCategorySchema = expenseCategorySchema.omit({ id: true, isActive: true });

export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
export type CreateExpenseCategory = z.infer<typeof createExpenseCategorySchema>;
import { z } from "zod";

// Budget item type enum
export const budgetItemTypeSchema = z.enum(["limit", "payment"], {
  message: "Please select an item type",
});

// Budget Item schema
export const budgetItemSchema = z.object({
  itemType: budgetItemTypeSchema,
  categoryId: z.string().uuid("Invalid category").optional().nullable(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  amount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places"),
  dueDay: z
    .number()
    .int("Due day must be a whole number")
    .min(1, "Due day must be between 1 and 31")
    .max(31, "Due day must be between 1 and 31")
    .optional()
    .nullable(),
  isRecurring: z.boolean().optional(),
  accountId: z.string().uuid("Invalid account").optional().nullable(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable(),
});

export type BudgetItemFormData = z.infer<typeof budgetItemSchema>;

// Budget Item Payment schema (for marking as paid)
export const budgetItemPaymentSchema = z.object({
  type: z.enum(["needs", "wants", "savings", "investments"], {
    message: "Please select a transaction type",
  }),
  paidDate: z.coerce.date({ message: "Invalid date" }),
  paidAmount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places"),
  accountId: z.string().uuid("Please select an account"),
});

export type BudgetItemPaymentFormData = z.infer<typeof budgetItemPaymentSchema>;

// Monthly Budget schema (for creating/updating budget notes)
export const monthlyBudgetSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable(),
});

export type MonthlyBudgetFormData = z.infer<typeof monthlyBudgetSchema>;

// Filter schemas
export const budgetFilterSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  itemType: z.enum(["limit", "payment", "all"]).optional(),
  status: z.enum(["paid", "unpaid", "overdue", "all"]).optional(),
});

export type BudgetFilterParams = z.infer<typeof budgetFilterSchema>;


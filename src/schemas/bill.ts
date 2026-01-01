import { z } from "zod";

// Recurring Bill schemas
export const recurringBillSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  amount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places"),
  categoryId: z.string().uuid("Invalid category").optional().nullable(),
  accountId: z.string().uuid("Invalid account").optional().nullable(),
  dueDay: z
    .number()
    .int("Due day must be a whole number")
    .min(1, "Due day must be between 1 and 31")
    .max(31, "Due day must be between 1 and 31"),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
});

export type RecurringBillFormData = z.infer<typeof recurringBillSchema>;

// Bill Payment schemas
export const billPaymentSchema = z.object({
  paidDate: z.coerce.date({ message: "Invalid date" }),
  paidAmount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places"),
  accountId: z.string().uuid("Please select an account"),
});

export type BillPaymentFormData = z.infer<typeof billPaymentSchema>;

// Filter schemas
export const billFilterSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  categoryId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
  status: z.enum(["paid", "overdue", "due_today", "upcoming", "pending", "all"]).optional(),
});

export type BillFilterParams = z.infer<typeof billFilterSchema>;

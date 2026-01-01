import { z } from "zod";

export const transactionTypeSchema = z.enum(
  ["income", "needs", "wants", "savings", "investments"],
  { message: "Invalid transaction type" }
);

export const transactionSchema = z.object({
  type: transactionTypeSchema,
  amount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places"),
  description: z
    .string()
    .max(255, "Description must be less than 255 characters")
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable(),
  categoryId: z.string().uuid("Invalid category"),
  subCategoryId: z.string().uuid("Invalid sub-category").optional().nullable(),
  accountId: z.string().uuid("Invalid account").optional().nullable(),
  transactionDate: z.coerce.date({
    message: "Invalid date",
  }),
  tagIds: z.array(z.string().uuid()).optional().default([]),
});

export const transactionFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  categoryId: z.string().uuid().optional(),
  subCategoryId: z.string().uuid().optional(),
  type: transactionTypeSchema.optional(),
  accountId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["transactionDate", "amount", "createdAt"]).default("transactionDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type TransactionFilterParams = z.infer<typeof transactionFilterSchema>;

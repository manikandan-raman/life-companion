import { z } from "zod";

export const expenseTrackerSchema = z.object({
  id: z.string({ description: "The expense tracker's ID" }),
  userId: z.string({ description: "The user's ID" }),
  categoryId: z.number({ description: "The expense category's ID" }),
  amount: z.number({ description: "The expense tracker's amount" }),
  date: z.coerce.date({ description: "The expense tracker's date" }),
  notes: z.string({ description: "The expense tracker's notes" }).optional().nullable(),
  tags: z.array(z.string({ description: "The expense tracker's tags" })).optional().nullable(),
  createdAt: z.string({ description: "The expense tracker's creation date" }),
  updatedAt: z.string({ description: "The expense tracker's last update date" }),
});

export const createExpenseTrackerSchema = expenseTrackerSchema.omit({ id: true, userId: true, createdAt: true, updatedAt: true });

export type ExpenseTracker = z.infer<typeof expenseTrackerSchema>;
export type CreateExpenseTracker = z.infer<typeof createExpenseTrackerSchema>;
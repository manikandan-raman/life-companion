import { z } from "zod";

export const liabilitySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  type: z.enum(["home_loan", "personal_loan", "other"], {
    message: "Invalid liability type",
  }),
  principalAmount: z
    .number({ message: "Principal amount must be a number" })
    .positive("Principal amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places"),
  outstandingBalance: z
    .number({ message: "Outstanding balance must be a number" })
    .nonnegative("Outstanding balance cannot be negative")
    .multipleOf(0.01, "Amount can have at most 2 decimal places"),
  interestRate: z
    .number({ message: "Interest rate must be a number" })
    .min(0, "Interest rate cannot be negative")
    .max(100, "Interest rate cannot exceed 100%"),
  emiAmount: z
    .number()
    .positive("EMI amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places")
    .optional()
    .nullable(),
  startDate: z.coerce.date({
    message: "Invalid start date",
  }),
  endDate: z.coerce.date().optional().nullable(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .default("#ef4444"),
});

export const liabilityPaymentSchema = z.object({
  liabilityId: z.string().uuid("Invalid liability"),
  amount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places"),
  principalPaid: z
    .number()
    .nonnegative("Principal paid cannot be negative")
    .multipleOf(0.01, "Amount can have at most 2 decimal places")
    .optional()
    .nullable(),
  interestPaid: z
    .number()
    .nonnegative("Interest paid cannot be negative")
    .multipleOf(0.01, "Amount can have at most 2 decimal places")
    .optional()
    .nullable(),
  paymentDate: z.coerce.date({
    message: "Invalid payment date",
  }),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable(),
});

export type LiabilityFormData = z.infer<typeof liabilitySchema>;
export type LiabilityPaymentFormData = z.infer<typeof liabilityPaymentSchema>;


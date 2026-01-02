import { z } from "zod";

export const assetSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  type: z.enum(["investment", "fixed_deposit", "retirement"], {
    message: "Invalid asset type",
  }),
  subtype: z.enum(
    ["mutual_fund", "stock", "etf", "fd", "rd", "epf", "ppf", "nps", "other"],
    { message: "Invalid asset subtype" }
  ),
  currentValue: z
    .number({ message: "Current value must be a number" })
    .nonnegative("Current value cannot be negative")
    .multipleOf(0.01, "Value can have at most 2 decimal places"),
  purchaseValue: z
    .number({ message: "Purchase value must be a number" })
    .nonnegative("Purchase value cannot be negative")
    .multipleOf(0.01, "Value can have at most 2 decimal places")
    .default(0),
  purchaseDate: z.coerce.date().optional().nullable(),
  maturityDate: z.coerce.date().optional().nullable(),
  interestRate: z
    .number()
    .min(0, "Interest rate cannot be negative")
    .max(100, "Interest rate cannot exceed 100%")
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .default("#5cb78a"),
});

export const assetValuationSchema = z.object({
  assetId: z.string().uuid("Invalid asset"),
  value: z
    .number({ message: "Value must be a number" })
    .nonnegative("Value cannot be negative")
    .multipleOf(0.01, "Value can have at most 2 decimal places"),
  valuationDate: z.coerce.date({
    message: "Invalid date",
  }),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable(),
});

export type AssetFormData = z.infer<typeof assetSchema>;
export type AssetValuationFormData = z.infer<typeof assetValuationSchema>;


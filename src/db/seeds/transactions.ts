import { db, transactions, transactionTags, type TransactionType } from "@/db";
import { subDays, format, startOfMonth, addDays } from "date-fns";

interface TransactionSeed {
  type: TransactionType;
  categoryKey: string;
  subCategoryKey?: string;
  amount: string;
  description: string;
  dayOffset: number; // Days from start of current month (negative for previous month)
  tagNames?: string[];
}

// Sample transactions for 2 months
const TRANSACTION_TEMPLATES: TransactionSeed[] = [
  // ===== INCOME =====
  { type: "income", categoryKey: "income_salary", subCategoryKey: "monthly_salary", amount: "100000.00", description: "Monthly Salary - January", dayOffset: 1, tagNames: ["Recurring"] },
  { type: "income", categoryKey: "income_salary", subCategoryKey: "monthly_salary", amount: "100000.00", description: "Monthly Salary - December", dayOffset: -30, tagNames: ["Recurring"] },
  { type: "income", categoryKey: "income_investment", subCategoryKey: "dividends", amount: "2500.00", description: "Mutual Fund Dividend", dayOffset: 5 },
  { type: "income", categoryKey: "income_other", subCategoryKey: "cashback", amount: "450.00", description: "Credit Card Cashback", dayOffset: 10 },

  // ===== NEEDS =====
  { type: "needs", categoryKey: "food_groceries", subCategoryKey: "groceries", amount: "3500.00", description: "BigBasket - Monthly Groceries", dayOffset: 2, tagNames: ["Essential", "Recurring"] },
  { type: "needs", categoryKey: "food_groceries", subCategoryKey: "vegetables", amount: "800.00", description: "Fresh vegetables from market", dayOffset: 5, tagNames: ["Essential"] },
  { type: "needs", categoryKey: "food_groceries", subCategoryKey: "dairy", amount: "1200.00", description: "Milk subscription", dayOffset: 1, tagNames: ["Essential", "Recurring"] },
  { type: "needs", categoryKey: "utilities", subCategoryKey: "electricity", amount: "2200.00", description: "BESCOM Electricity Bill", dayOffset: 8, tagNames: ["Essential", "Recurring"] },
  { type: "needs", categoryKey: "utilities", subCategoryKey: "internet", amount: "999.00", description: "ACT Fibernet", dayOffset: 5, tagNames: ["Essential", "Recurring"] },
  { type: "needs", categoryKey: "utilities", subCategoryKey: "mobile_recharge", amount: "599.00", description: "Jio Prepaid Recharge", dayOffset: 15, tagNames: ["Essential"] },
  { type: "needs", categoryKey: "utilities", subCategoryKey: "gas_cylinder", amount: "950.00", description: "LPG Cylinder Refill", dayOffset: 12, tagNames: ["Essential"] },
  { type: "needs", categoryKey: "housing", subCategoryKey: "rent", amount: "25000.00", description: "House Rent - January", dayOffset: 1, tagNames: ["Essential", "Recurring"] },
  { type: "needs", categoryKey: "housing", subCategoryKey: "rent", amount: "25000.00", description: "House Rent - December", dayOffset: -30, tagNames: ["Essential", "Recurring"] },
  { type: "needs", categoryKey: "transportation", subCategoryKey: "petrol", amount: "3000.00", description: "Petrol - HP", dayOffset: 7, tagNames: ["Essential"] },
  { type: "needs", categoryKey: "transportation", subCategoryKey: "petrol", amount: "2500.00", description: "Petrol - HP", dayOffset: -10, tagNames: ["Essential"] },
  { type: "needs", categoryKey: "healthcare", subCategoryKey: "medicines", amount: "450.00", description: "Monthly Medicines - Apollo", dayOffset: 3, tagNames: ["Essential"] },
  { type: "needs", categoryKey: "household_help", subCategoryKey: "maid", amount: "3000.00", description: "Maid Salary", dayOffset: 1, tagNames: ["Essential", "Recurring"] },
  { type: "needs", categoryKey: "household_help", subCategoryKey: "maid", amount: "3000.00", description: "Maid Salary", dayOffset: -30, tagNames: ["Essential", "Recurring"] },

  // ===== WANTS =====
  { type: "wants", categoryKey: "dining_out", subCategoryKey: "restaurants", amount: "1800.00", description: "Dinner at Barbeque Nation", dayOffset: 6, tagNames: ["Personal"] },
  { type: "wants", categoryKey: "dining_out", subCategoryKey: "food_delivery", amount: "450.00", description: "Swiggy Order", dayOffset: 8, tagNames: ["Impulse"] },
  { type: "wants", categoryKey: "dining_out", subCategoryKey: "food_delivery", amount: "380.00", description: "Zomato Order", dayOffset: 12, tagNames: ["Impulse"] },
  { type: "wants", categoryKey: "dining_out", subCategoryKey: "cafe", amount: "350.00", description: "Starbucks Coffee", dayOffset: 4, tagNames: ["Personal"] },
  { type: "wants", categoryKey: "entertainment", subCategoryKey: "ott", amount: "199.00", description: "Netflix Subscription", dayOffset: 1, tagNames: ["Recurring"] },
  { type: "wants", categoryKey: "entertainment", subCategoryKey: "ott", amount: "299.00", description: "Amazon Prime", dayOffset: 1, tagNames: ["Recurring"] },
  { type: "wants", categoryKey: "entertainment", subCategoryKey: "movies", amount: "800.00", description: "PVR - Movie tickets", dayOffset: 14, tagNames: ["Personal", "Family"] },
  { type: "wants", categoryKey: "shopping", subCategoryKey: "clothes", amount: "2500.00", description: "Myntra - Winter wear", dayOffset: -5, tagNames: ["Personal"] },
  { type: "wants", categoryKey: "shopping", subCategoryKey: "electronics", amount: "15000.00", description: "Amazon - Wireless Earbuds", dayOffset: -15, tagNames: ["Personal", "One-time"] },
  { type: "wants", categoryKey: "personal_care", subCategoryKey: "salon", amount: "500.00", description: "Haircut", dayOffset: 10, tagNames: ["Personal"] },
  { type: "wants", categoryKey: "personal_care", subCategoryKey: "gym", amount: "2000.00", description: "Cult.fit Membership", dayOffset: 1, tagNames: ["Recurring", "Personal"] },

  // ===== SAVINGS =====
  { type: "savings", categoryKey: "savings", subCategoryKey: "emergency_fund", amount: "10000.00", description: "Emergency Fund Transfer", dayOffset: 2, tagNames: ["Recurring", "Planned"] },
  { type: "savings", categoryKey: "savings", subCategoryKey: "emergency_fund", amount: "10000.00", description: "Emergency Fund Transfer", dayOffset: -28, tagNames: ["Recurring", "Planned"] },
  { type: "savings", categoryKey: "savings", subCategoryKey: "recurring_deposit", amount: "5000.00", description: "HDFC RD", dayOffset: 5, tagNames: ["Recurring", "Planned"] },

  // ===== INVESTMENTS =====
  { type: "investments", categoryKey: "investments", subCategoryKey: "mutual_funds", amount: "10000.00", description: "SIP - Axis Bluechip", dayOffset: 5, tagNames: ["Recurring", "Planned"] },
  { type: "investments", categoryKey: "investments", subCategoryKey: "mutual_funds", amount: "10000.00", description: "SIP - Axis Bluechip", dayOffset: -25, tagNames: ["Recurring", "Planned"] },
  { type: "investments", categoryKey: "investments", subCategoryKey: "stocks", amount: "5000.00", description: "Zerodha - TCS shares", dayOffset: 8, tagNames: ["Planned"] },
  { type: "investments", categoryKey: "investments", subCategoryKey: "nps", amount: "5000.00", description: "NPS Contribution", dayOffset: 10, tagNames: ["Recurring", "Planned"] },
];

/**
 * Seeds transactions for a user
 * @param userId - The user's UUID
 * @param accountIds - Array of account IDs (uses first bank account)
 * @param categoryIds - Map of category keys to IDs
 * @param subCategoryIds - Map of sub-category keys to IDs
 * @param tagIds - Map of tag names to IDs
 * @returns Array of created transaction IDs
 */
export async function seedTransactions(
  userId: string,
  accountIds: string[],
  categoryIds: Map<string, string>,
  subCategoryIds: Map<string, string>,
  tagIds: Map<string, string>
): Promise<string[]> {
  console.log("💳 Seeding transactions...");

  const transactionIds: string[] = [];
  const today = new Date();
  const currentMonthStart = startOfMonth(today);

  // Use first account (HDFC Savings) as default
  const defaultAccountId = accountIds[0];
  // Use credit card for some expenses
  const creditCardId = accountIds[1];

  for (const template of TRANSACTION_TEMPLATES) {
    const categoryId = categoryIds.get(template.categoryKey);
    const subCategoryId = template.subCategoryKey
      ? subCategoryIds.get(template.subCategoryKey)
      : null;

    if (!categoryId) {
      console.log(`   ⚠ Category not found: ${template.categoryKey}`);
      continue;
    }

    // Calculate transaction date
    let transactionDate: Date;
    if (template.dayOffset >= 0) {
      transactionDate = addDays(currentMonthStart, template.dayOffset);
    } else {
      transactionDate = subDays(currentMonthStart, Math.abs(template.dayOffset));
    }

    // Skip future dates
    if (transactionDate > today) {
      transactionDate = subDays(today, 1);
    }

    // Use credit card for some want expenses
    const accountId =
      template.type === "wants" && Math.random() > 0.5
        ? creditCardId
        : defaultAccountId;

    const [created] = await db
      .insert(transactions)
      .values({
        userId,
        type: template.type,
        accountId,
        categoryId,
        subCategoryId,
        amount: template.amount,
        description: template.description,
        transactionDate: format(transactionDate, "yyyy-MM-dd"),
      })
      .returning();

    transactionIds.push(created.id);

    // Add tags if specified
    if (template.tagNames && template.tagNames.length > 0) {
      for (const tagName of template.tagNames) {
        const tagId = tagIds.get(tagName);
        if (tagId) {
          await db.insert(transactionTags).values({
            transactionId: created.id,
            tagId,
          });
        }
      }
    }
  }

  console.log(`   ✓ Created ${transactionIds.length} transactions`);

  return transactionIds;
}

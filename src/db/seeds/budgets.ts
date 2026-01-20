import { db, monthlyBudgets, budgetItems, type BudgetItemType } from "@/db";

interface BudgetItemSeed {
  itemType: BudgetItemType;
  name: string;
  amount: string;
  categoryKey?: string;
  dueDay?: number;
  isRecurring: boolean;
  isPaid?: boolean;
  notes?: string;
}

// Budget items for the current month
const CURRENT_MONTH_ITEMS: BudgetItemSeed[] = [
  // Spending Limits
  {
    itemType: "limit",
    name: "Food & Groceries",
    amount: "8000.00",
    categoryKey: "food_groceries",
    isRecurring: true,
    notes: "Monthly grocery budget",
  },
  {
    itemType: "limit",
    name: "Dining Out",
    amount: "5000.00",
    categoryKey: "dining_out",
    isRecurring: true,
    notes: "Restaurants and food delivery",
  },
  {
    itemType: "limit",
    name: "Transportation",
    amount: "5000.00",
    categoryKey: "transportation",
    isRecurring: true,
    notes: "Petrol and public transport",
  },
  {
    itemType: "limit",
    name: "Shopping",
    amount: "3000.00",
    categoryKey: "shopping",
    isRecurring: true,
    notes: "Clothes, electronics, etc.",
  },
  {
    itemType: "limit",
    name: "Entertainment",
    amount: "2000.00",
    categoryKey: "entertainment",
    isRecurring: true,
    notes: "OTT, movies, games",
  },

  // Payment Items
  {
    itemType: "payment",
    name: "House Rent",
    amount: "25000.00",
    dueDay: 1,
    isRecurring: true,
    isPaid: true,
    notes: "Monthly rent",
  },
  {
    itemType: "payment",
    name: "Home Loan EMI",
    amount: "45000.00",
    dueDay: 5,
    isRecurring: true,
    isPaid: true,
    notes: "HDFC Home Loan",
  },
  {
    itemType: "payment",
    name: "Internet Bill",
    amount: "999.00",
    dueDay: 5,
    isRecurring: true,
    isPaid: true,
    notes: "ACT Fibernet",
  },
  {
    itemType: "payment",
    name: "Electricity Bill",
    amount: "2500.00",
    dueDay: 10,
    isRecurring: true,
    isPaid: true,
    notes: "BESCOM",
  },
  {
    itemType: "payment",
    name: "Mobile Recharge",
    amount: "599.00",
    dueDay: 20,
    isRecurring: true,
    isPaid: false,
    notes: "Jio Prepaid",
  },
  {
    itemType: "payment",
    name: "Gym Membership",
    amount: "2000.00",
    dueDay: 1,
    isRecurring: true,
    isPaid: true,
    notes: "Cult.fit",
  },
  {
    itemType: "payment",
    name: "Netflix",
    amount: "199.00",
    dueDay: 1,
    isRecurring: true,
    isPaid: true,
    notes: "Mobile plan",
  },
  {
    itemType: "payment",
    name: "SIP - Mutual Fund",
    amount: "10000.00",
    dueDay: 5,
    isRecurring: true,
    isPaid: true,
    notes: "Axis Bluechip",
  },
  {
    itemType: "payment",
    name: "Society Maintenance",
    amount: "3500.00",
    dueDay: 10,
    isRecurring: false,
    isPaid: false,
    notes: "Quarterly payment due this month",
  },
];

/**
 * Seeds monthly budgets and budget items for a user
 * @param userId - The user's UUID
 * @param accountIds - Array of account IDs
 * @param categoryIds - Map of category keys to IDs
 */
export async function seedBudgets(
  userId: string,
  accountIds: string[],
  categoryIds: Map<string, string>
): Promise<void> {
  console.log("💰 Seeding monthly budgets...");

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const defaultAccountId = accountIds[0];

  // Create current month budget
  const [monthlyBudget] = await db
    .insert(monthlyBudgets)
    .values({
      userId,
      month: currentMonth,
      year: currentYear,
      notes: "Current month budget",
    })
    .returning();

  let limitCount = 0;
  let paymentCount = 0;

  for (const item of CURRENT_MONTH_ITEMS) {
    const categoryId = item.categoryKey ? categoryIds.get(item.categoryKey) : null;

    await db.insert(budgetItems).values({
      budgetId: monthlyBudget.id,
      userId,
      itemType: item.itemType,
      categoryId,
      name: item.name,
      amount: item.amount,
      dueDay: item.dueDay,
      isRecurring: item.isRecurring,
      isPaid: item.isPaid ?? false,
      paidDate: item.isPaid ? today.toISOString().split("T")[0] : null,
      paidAmount: item.isPaid ? item.amount : null,
      accountId: item.isPaid ? defaultAccountId : null,
      notes: item.notes,
    });

    if (item.itemType === "limit") {
      limitCount++;
    } else {
      paymentCount++;
    }
  }

  // Also create previous month budget (all items paid)
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const [prevMonthlyBudget] = await db
    .insert(monthlyBudgets)
    .values({
      userId,
      month: prevMonth,
      year: prevYear,
      notes: "Previous month budget",
    })
    .returning();

  // Add all items as paid for previous month
  for (const item of CURRENT_MONTH_ITEMS) {
    const categoryId = item.categoryKey ? categoryIds.get(item.categoryKey) : null;

    await db.insert(budgetItems).values({
      budgetId: prevMonthlyBudget.id,
      userId,
      itemType: item.itemType,
      categoryId,
      name: item.name,
      amount: item.amount,
      dueDay: item.dueDay,
      isRecurring: item.isRecurring,
      isPaid: true, // All paid in previous month
      paidDate: `${prevYear}-${String(prevMonth).padStart(2, "0")}-15`,
      paidAmount: item.amount,
      accountId: defaultAccountId,
      notes: item.notes,
    });
  }

  console.log(`   ✓ Created 2 monthly budgets`);
  console.log(`   ✓ Created ${limitCount} spending limits (current month)`);
  console.log(`   ✓ Created ${paymentCount} payment items (current month)`);
}

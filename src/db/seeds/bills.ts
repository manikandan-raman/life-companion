import { db, recurringBills, billPayments } from "@/db";
import { format, subMonths } from "date-fns";

interface BillSeed {
  name: string;
  amount: string;
  categoryKey: string;
  subCategoryKey?: string;
  dueDay: number;
  notes?: string;
  // Payment history (months ago, with payment status)
  payments?: { monthsAgo: number; isPaid: boolean; paidAmount?: string }[];
}

const SEED_BILLS: BillSeed[] = [
  {
    name: "Netflix Subscription",
    amount: "199.00",
    categoryKey: "entertainment",
    subCategoryKey: "ott",
    dueDay: 1,
    notes: "Mobile plan",
    payments: [
      { monthsAgo: 0, isPaid: true, paidAmount: "199.00" },
      { monthsAgo: 1, isPaid: true, paidAmount: "199.00" },
      { monthsAgo: 2, isPaid: true, paidAmount: "199.00" },
    ],
  },
  {
    name: "Amazon Prime",
    amount: "1499.00",
    categoryKey: "entertainment",
    subCategoryKey: "ott",
    dueDay: 15,
    notes: "Annual subscription (monthly equivalent)",
    payments: [
      { monthsAgo: 0, isPaid: true, paidAmount: "1499.00" },
    ],
  },
  {
    name: "Electricity Bill",
    amount: "2500.00",
    categoryKey: "utilities",
    subCategoryKey: "electricity",
    dueDay: 10,
    notes: "BESCOM - varies monthly",
    payments: [
      { monthsAgo: 0, isPaid: true, paidAmount: "2200.00" },
      { monthsAgo: 1, isPaid: true, paidAmount: "2400.00" },
      { monthsAgo: 2, isPaid: true, paidAmount: "2600.00" },
    ],
  },
  {
    name: "Internet - ACT Fibernet",
    amount: "999.00",
    categoryKey: "utilities",
    subCategoryKey: "internet",
    dueDay: 5,
    notes: "100 Mbps plan",
    payments: [
      { monthsAgo: 0, isPaid: true, paidAmount: "999.00" },
      { monthsAgo: 1, isPaid: true, paidAmount: "999.00" },
      { monthsAgo: 2, isPaid: true, paidAmount: "999.00" },
    ],
  },
  {
    name: "Mobile Recharge",
    amount: "599.00",
    categoryKey: "utilities",
    subCategoryKey: "mobile_recharge",
    dueDay: 20,
    notes: "Jio Prepaid",
    payments: [
      { monthsAgo: 0, isPaid: false },
      { monthsAgo: 1, isPaid: true, paidAmount: "599.00" },
      { monthsAgo: 2, isPaid: true, paidAmount: "599.00" },
    ],
  },
  {
    name: "Gym Membership",
    amount: "2000.00",
    categoryKey: "personal_care",
    subCategoryKey: "gym",
    dueDay: 1,
    notes: "Cult.fit monthly",
    payments: [
      { monthsAgo: 0, isPaid: true, paidAmount: "2000.00" },
      { monthsAgo: 1, isPaid: true, paidAmount: "2000.00" },
    ],
  },
  {
    name: "House Rent",
    amount: "25000.00",
    categoryKey: "housing",
    subCategoryKey: "rent",
    dueDay: 1,
    notes: "Due on 1st of every month",
    payments: [
      { monthsAgo: 0, isPaid: true, paidAmount: "25000.00" },
      { monthsAgo: 1, isPaid: true, paidAmount: "25000.00" },
      { monthsAgo: 2, isPaid: true, paidAmount: "25000.00" },
    ],
  },
  {
    name: "Home Loan EMI",
    amount: "45000.00",
    categoryKey: "housing",
    subCategoryKey: "emi_home",
    dueDay: 5,
    notes: "HDFC Home Loan",
    payments: [
      { monthsAgo: 0, isPaid: true, paidAmount: "45000.00" },
      { monthsAgo: 1, isPaid: true, paidAmount: "45000.00" },
      { monthsAgo: 2, isPaid: true, paidAmount: "45000.00" },
    ],
  },
  {
    name: "Maid Salary",
    amount: "3000.00",
    categoryKey: "household_help",
    subCategoryKey: "maid",
    dueDay: 1,
    notes: "Monthly salary",
    payments: [
      { monthsAgo: 0, isPaid: true, paidAmount: "3000.00" },
      { monthsAgo: 1, isPaid: true, paidAmount: "3000.00" },
    ],
  },
  {
    name: "Society Maintenance",
    amount: "3500.00",
    categoryKey: "utilities",
    subCategoryKey: "maintenance",
    dueDay: 10,
    notes: "Quarterly - shown as monthly",
    payments: [
      { monthsAgo: 0, isPaid: false },
      { monthsAgo: 1, isPaid: true, paidAmount: "3500.00" },
    ],
  },
];

/**
 * Seeds recurring bills and their payment history for a user
 * @param userId - The user's UUID
 * @param accountIds - Array of account IDs
 * @param categoryIds - Map of category keys to IDs
 * @param subCategoryIds - Map of sub-category keys to IDs
 */
export async function seedBills(
  userId: string,
  accountIds: string[],
  categoryIds: Map<string, string>,
  subCategoryIds: Map<string, string>
): Promise<void> {
  console.log("📅 Seeding recurring bills...");

  const today = new Date();
  const defaultAccountId = accountIds[0];
  let billCount = 0;
  let paymentCount = 0;

  for (const bill of SEED_BILLS) {
    const categoryId = categoryIds.get(bill.categoryKey);
    const subCategoryId = bill.subCategoryKey
      ? subCategoryIds.get(bill.subCategoryKey)
      : null;

    const [created] = await db
      .insert(recurringBills)
      .values({
        userId,
        name: bill.name,
        amount: bill.amount,
        categoryId,
        subCategoryId,
        accountId: defaultAccountId,
        dueDay: bill.dueDay,
        notes: bill.notes,
        isActive: true,
      })
      .returning();

    billCount++;

    // Add payment history
    if (bill.payments && bill.payments.length > 0) {
      for (const payment of bill.payments) {
        const paymentDate = subMonths(today, payment.monthsAgo);
        const month = paymentDate.getMonth() + 1;
        const year = paymentDate.getFullYear();

        await db.insert(billPayments).values({
          billId: created.id,
          month,
          year,
          isPaid: payment.isPaid,
          paidDate: payment.isPaid ? format(paymentDate, "yyyy-MM-dd") : null,
          paidAmount: payment.paidAmount,
          accountId: payment.isPaid ? defaultAccountId : null,
        });

        paymentCount++;
      }
    }
  }

  console.log(`   ✓ Created ${billCount} recurring bills`);
  console.log(`   ✓ Created ${paymentCount} bill payments`);
}

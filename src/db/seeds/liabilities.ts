import { db, liabilities, liabilityPayments, type LiabilityType } from "@/db";
import { format, subMonths } from "date-fns";

interface LiabilitySeed {
  name: string;
  type: LiabilityType;
  principalAmount: string;
  outstandingBalance: string;
  interestRate: string;
  emiAmount?: string;
  startDate: string;
  endDate?: string;
  color: string;
  notes?: string;
  // Historical payments (months ago)
  payments?: {
    monthsAgo: number;
    amount: string;
    principalPaid: string;
    interestPaid: string;
  }[];
}

const SEED_LIABILITIES: LiabilitySeed[] = [
  {
    name: "Home Loan - HDFC",
    type: "home_loan",
    principalAmount: "5000000.00",
    outstandingBalance: "4200000.00",
    interestRate: "8.50",
    emiAmount: "45000.00",
    startDate: "2022-01-01",
    endDate: "2042-01-01",
    color: "#ef4444",
    notes: "20 year home loan for 2BHK apartment",
    payments: [
      { monthsAgo: 1, amount: "45000.00", principalPaid: "12000.00", interestPaid: "33000.00" },
      { monthsAgo: 2, amount: "45000.00", principalPaid: "11800.00", interestPaid: "33200.00" },
      { monthsAgo: 3, amount: "45000.00", principalPaid: "11600.00", interestPaid: "33400.00" },
      { monthsAgo: 4, amount: "45000.00", principalPaid: "11400.00", interestPaid: "33600.00" },
      { monthsAgo: 5, amount: "45000.00", principalPaid: "11200.00", interestPaid: "33800.00" },
      { monthsAgo: 6, amount: "45000.00", principalPaid: "11000.00", interestPaid: "34000.00" },
    ],
  },
  {
    name: "Personal Loan - ICICI",
    type: "personal_loan",
    principalAmount: "300000.00",
    outstandingBalance: "180000.00",
    interestRate: "12.00",
    emiAmount: "10000.00",
    startDate: "2024-01-01",
    endDate: "2026-06-01",
    color: "#f97316",
    notes: "Used for home renovation",
    payments: [
      { monthsAgo: 1, amount: "10000.00", principalPaid: "8200.00", interestPaid: "1800.00" },
      { monthsAgo: 2, amount: "10000.00", principalPaid: "8100.00", interestPaid: "1900.00" },
      { monthsAgo: 3, amount: "10000.00", principalPaid: "8000.00", interestPaid: "2000.00" },
    ],
  },
];

/**
 * Seeds liabilities and their payment history for a user
 * @param userId - The user's UUID
 * @returns Array of created liability IDs
 */
export async function seedLiabilities(userId: string): Promise<string[]> {
  console.log("💸 Seeding liabilities...");

  const liabilityIds: string[] = [];
  const today = new Date();

  for (const liability of SEED_LIABILITIES) {
    const [created] = await db
      .insert(liabilities)
      .values({
        userId,
        name: liability.name,
        type: liability.type,
        principalAmount: liability.principalAmount,
        outstandingBalance: liability.outstandingBalance,
        interestRate: liability.interestRate,
        emiAmount: liability.emiAmount,
        startDate: liability.startDate,
        endDate: liability.endDate,
        color: liability.color,
        notes: liability.notes,
        isArchived: false,
      })
      .returning();

    liabilityIds.push(created.id);

    // Add payment history
    if (liability.payments && liability.payments.length > 0) {
      for (const payment of liability.payments) {
        const paymentDate = subMonths(today, payment.monthsAgo);
        await db.insert(liabilityPayments).values({
          liabilityId: created.id,
          amount: payment.amount,
          principalPaid: payment.principalPaid,
          interestPaid: payment.interestPaid,
          paymentDate: format(paymentDate, "yyyy-MM-dd"),
        });
      }
    }
  }

  console.log(`   ✓ Created ${liabilityIds.length} liabilities`);

  return liabilityIds;
}

import { db, networthSnapshots } from "@/db";
import { format, subMonths, startOfMonth } from "date-fns";

interface NetworthSnapshotSeed {
  monthsAgo: number;
  totalAssets: string;
  totalLiabilities: string;
  netWorth: string;
  breakdown: {
    accounts: number;
    investments: number;
    fixedDeposits: number;
    retirement: number;
    homeLoan: number;
    personalLoan: number;
  };
}

// 6 months of historical snapshots showing gradual growth
const NETWORTH_HISTORY: NetworthSnapshotSeed[] = [
  {
    monthsAgo: 6,
    totalAssets: "950000.00",
    totalLiabilities: "4450000.00",
    netWorth: "-3500000.00",
    breakdown: {
      accounts: 140000,
      investments: 180000,
      fixedDeposits: 230000,
      retirement: 400000,
      homeLoan: 4280000,
      personalLoan: 240000,
    },
  },
  {
    monthsAgo: 5,
    totalAssets: "985000.00",
    totalLiabilities: "4420000.00",
    netWorth: "-3435000.00",
    breakdown: {
      accounts: 145000,
      investments: 195000,
      fixedDeposits: 240000,
      retirement: 405000,
      homeLoan: 4260000,
      personalLoan: 230000,
    },
  },
  {
    monthsAgo: 4,
    totalAssets: "1020000.00",
    totalLiabilities: "4390000.00",
    netWorth: "-3370000.00",
    breakdown: {
      accounts: 150000,
      investments: 210000,
      fixedDeposits: 250000,
      retirement: 410000,
      homeLoan: 4240000,
      personalLoan: 220000,
    },
  },
  {
    monthsAgo: 3,
    totalAssets: "1055000.00",
    totalLiabilities: "4360000.00",
    netWorth: "-3305000.00",
    breakdown: {
      accounts: 155000,
      investments: 225000,
      fixedDeposits: 255000,
      retirement: 420000,
      homeLoan: 4220000,
      personalLoan: 210000,
    },
  },
  {
    monthsAgo: 2,
    totalAssets: "1090000.00",
    totalLiabilities: "4330000.00",
    netWorth: "-3240000.00",
    breakdown: {
      accounts: 160000,
      investments: 245000,
      fixedDeposits: 260000,
      retirement: 425000,
      homeLoan: 4200000,
      personalLoan: 200000,
    },
  },
  {
    monthsAgo: 1,
    totalAssets: "1125000.00",
    totalLiabilities: "4300000.00",
    netWorth: "-3175000.00",
    breakdown: {
      accounts: 165000,
      investments: 265000,
      fixedDeposits: 265000,
      retirement: 430000,
      homeLoan: 4180000,
      personalLoan: 190000,
    },
  },
  {
    monthsAgo: 0,
    totalAssets: "1150000.00",
    totalLiabilities: "4380000.00",
    netWorth: "-3230000.00",
    breakdown: {
      accounts: 175000,
      investments: 280000,
      fixedDeposits: 265000,
      retirement: 430000,
      homeLoan: 4200000,
      personalLoan: 180000,
    },
  },
];

/**
 * Seeds net worth snapshots for a user (6 months history)
 * @param userId - The user's UUID
 */
export async function seedNetworthSnapshots(userId: string): Promise<void> {
  console.log("📊 Seeding net worth snapshots...");

  const today = new Date();

  for (const snapshot of NETWORTH_HISTORY) {
    const snapshotDate = startOfMonth(subMonths(today, snapshot.monthsAgo));

    await db.insert(networthSnapshots).values({
      userId,
      snapshotDate: format(snapshotDate, "yyyy-MM-dd"),
      totalAssets: snapshot.totalAssets,
      totalLiabilities: snapshot.totalLiabilities,
      netWorth: snapshot.netWorth,
      breakdown: JSON.stringify(snapshot.breakdown),
    });
  }

  console.log(`   ✓ Created ${NETWORTH_HISTORY.length} net worth snapshots`);
}

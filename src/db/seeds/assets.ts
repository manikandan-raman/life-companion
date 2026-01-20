import { db, assets, assetValuations, type AssetType, type AssetSubtype } from "@/db";
import { format, subMonths } from "date-fns";

interface AssetSeed {
  name: string;
  type: AssetType;
  subtype: AssetSubtype;
  currentValue: string;
  purchaseValue: string;
  purchaseDate: string;
  maturityDate?: string;
  interestRate?: string;
  color: string;
  notes?: string;
  // Historical valuations (months ago -> value)
  valuations?: { monthsAgo: number; value: string }[];
}

const SEED_ASSETS: AssetSeed[] = [
  {
    name: "Axis Bluechip Fund",
    type: "investment",
    subtype: "mutual_fund",
    currentValue: "150000.00",
    purchaseValue: "120000.00",
    purchaseDate: "2024-01-15",
    color: "#3b82f6",
    notes: "Monthly SIP of ₹10,000",
    valuations: [
      { monthsAgo: 6, value: "125000.00" },
      { monthsAgo: 3, value: "140000.00" },
    ],
  },
  {
    name: "HDFC Small Cap Fund",
    type: "investment",
    subtype: "mutual_fund",
    currentValue: "85000.00",
    purchaseValue: "75000.00",
    purchaseDate: "2024-06-01",
    color: "#8b5cf6",
    notes: "Monthly SIP of ₹5,000",
    valuations: [
      { monthsAgo: 3, value: "78000.00" },
    ],
  },
  {
    name: "TCS Shares",
    type: "investment",
    subtype: "stock",
    currentValue: "45000.00",
    purchaseValue: "40000.00",
    purchaseDate: "2024-03-10",
    color: "#22c55e",
    notes: "10 shares @ ₹4,000",
    valuations: [
      { monthsAgo: 6, value: "38000.00" },
      { monthsAgo: 3, value: "42000.00" },
    ],
  },
  {
    name: "HDFC Fixed Deposit",
    type: "fixed_deposit",
    subtype: "fd",
    currentValue: "200000.00",
    purchaseValue: "200000.00",
    purchaseDate: "2024-01-01",
    maturityDate: "2025-01-01",
    interestRate: "7.25",
    color: "#f59e0b",
    notes: "1 year FD",
  },
  {
    name: "SBI Recurring Deposit",
    type: "fixed_deposit",
    subtype: "rd",
    currentValue: "65000.00",
    purchaseValue: "60000.00",
    purchaseDate: "2024-06-01",
    maturityDate: "2025-06-01",
    interestRate: "6.50",
    color: "#06b6d4",
    notes: "₹5,000/month RD",
  },
  {
    name: "Employee Provident Fund",
    type: "retirement",
    subtype: "epf",
    currentValue: "350000.00",
    purchaseValue: "300000.00",
    purchaseDate: "2020-01-01",
    interestRate: "8.15",
    color: "#ec4899",
    notes: "Employer + Employee contribution",
    valuations: [
      { monthsAgo: 12, value: "300000.00" },
      { monthsAgo: 6, value: "325000.00" },
    ],
  },
  {
    name: "Public Provident Fund",
    type: "retirement",
    subtype: "ppf",
    currentValue: "180000.00",
    purchaseValue: "150000.00",
    purchaseDate: "2021-04-01",
    interestRate: "7.10",
    color: "#14b8a6",
    notes: "Annual contribution ₹1.5L",
    valuations: [
      { monthsAgo: 12, value: "150000.00" },
      { monthsAgo: 6, value: "165000.00" },
    ],
  },
  {
    name: "National Pension System",
    type: "retirement",
    subtype: "nps",
    currentValue: "75000.00",
    purchaseValue: "60000.00",
    purchaseDate: "2023-01-01",
    color: "#84cc16",
    notes: "Monthly ₹5,000 contribution",
    valuations: [
      { monthsAgo: 6, value: "65000.00" },
    ],
  },
];

/**
 * Seeds assets and their historical valuations for a user
 * @param userId - The user's UUID
 * @returns Array of created asset IDs
 */
export async function seedAssets(userId: string): Promise<string[]> {
  console.log("📈 Seeding assets...");

  const assetIds: string[] = [];
  const today = new Date();

  for (const asset of SEED_ASSETS) {
    const [created] = await db
      .insert(assets)
      .values({
        userId,
        name: asset.name,
        type: asset.type,
        subtype: asset.subtype,
        currentValue: asset.currentValue,
        purchaseValue: asset.purchaseValue,
        purchaseDate: asset.purchaseDate,
        maturityDate: asset.maturityDate,
        interestRate: asset.interestRate,
        color: asset.color,
        notes: asset.notes,
        isArchived: false,
      })
      .returning();

    assetIds.push(created.id);

    // Add historical valuations
    if (asset.valuations && asset.valuations.length > 0) {
      for (const valuation of asset.valuations) {
        const valuationDate = subMonths(today, valuation.monthsAgo);
        await db.insert(assetValuations).values({
          assetId: created.id,
          value: valuation.value,
          valuationDate: format(valuationDate, "yyyy-MM-dd"),
        });
      }
    }
  }

  console.log(`   ✓ Created ${assetIds.length} assets`);

  return assetIds;
}

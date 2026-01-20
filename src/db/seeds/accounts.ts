import { db, accounts, type AccountType } from "@/db";

// Seed account data
export const SEED_ACCOUNTS: {
  name: string;
  type: AccountType;
  balance: string;
  color: string;
  icon: string;
  isDefault: boolean;
}[] = [
  {
    name: "HDFC Savings",
    type: "bank",
    balance: "125000.00",
    color: "#0046be",
    icon: "landmark",
    isDefault: true,
  },
  {
    name: "ICICI Credit Card",
    type: "credit_card",
    balance: "-15000.00",
    color: "#ff6600",
    icon: "credit-card",
    isDefault: false,
  },
  {
    name: "Cash Wallet",
    type: "cash",
    balance: "5000.00",
    color: "#22c55e",
    icon: "wallet",
    isDefault: false,
  },
  {
    name: "SBI Salary Account",
    type: "bank",
    balance: "45000.00",
    color: "#1e40af",
    icon: "building-2",
    isDefault: false,
  },
];

/**
 * Seeds accounts for a user
 * @param userId - The user's UUID
 * @returns Array of created account IDs
 */
export async function seedAccounts(userId: string): Promise<string[]> {
  console.log("🏦 Seeding accounts...");

  const accountIds: string[] = [];

  for (const account of SEED_ACCOUNTS) {
    const [created] = await db
      .insert(accounts)
      .values({
        userId,
        name: account.name,
        type: account.type,
        balance: account.balance,
        color: account.color,
        icon: account.icon,
        isDefault: account.isDefault,
        isArchived: false,
      })
      .returning();

    accountIds.push(created.id);
    console.log(`   ✓ Created account: ${account.name} (₹${account.balance})`);
  }

  return accountIds;
}

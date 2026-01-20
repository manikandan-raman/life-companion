import * as dotenv from "dotenv";

// Load environment variables first
dotenv.config({ path: ".env.local" });

import { seedUsers, DEMO_USER } from "./seeds/users";
import { seedAccounts } from "./seeds/accounts";
import { seedCategories } from "./seeds/categories";
import { seedTags } from "./seeds/tags";
import { seedTransactions } from "./seeds/transactions";
import { seedBudgetGoals } from "./seeds/budget-goals";
import { seedAssets } from "./seeds/assets";
import { seedLiabilities } from "./seeds/liabilities";
import { seedNetworthSnapshots } from "./seeds/networth";
import { seedBills } from "./seeds/bills";
import { seedBudgets } from "./seeds/budgets";

async function seed() {
  console.log("🌱 Starting database seed...\n");
  console.log("━".repeat(50));

  try {
    // Step 1: Create demo user
    const userId = await seedUsers();
    console.log("");

    // Step 2: Create accounts (depends on user)
    const accountIds = await seedAccounts(userId);
    console.log("");

    // Step 3: Create categories and subcategories (depends on user)
    const { categoryIds, subCategoryIds } = await seedCategories(userId);
    console.log("");

    // Step 4: Create tags (depends on user)
    const tagIds = await seedTags(userId);
    console.log("");

    // Step 5: Create transactions (depends on accounts, categories, tags)
    await seedTransactions(userId, accountIds, categoryIds, subCategoryIds, tagIds);
    console.log("");

    // Step 6: Create budget goals (depends on user)
    await seedBudgetGoals(userId);
    console.log("");

    // Step 7: Create assets and valuations (depends on user)
    await seedAssets(userId);
    console.log("");

    // Step 8: Create liabilities and payments (depends on user)
    await seedLiabilities(userId);
    console.log("");

    // Step 9: Create net worth snapshots (depends on user)
    await seedNetworthSnapshots(userId);
    console.log("");

    // Step 10: Create recurring bills and payments (depends on user, accounts, categories)
    await seedBills(userId, accountIds, categoryIds, subCategoryIds);
    console.log("");

    // Step 11: Create monthly budgets and items (depends on user, accounts, categories)
    await seedBudgets(userId, accountIds, categoryIds);
    console.log("");

    console.log("━".repeat(50));
    console.log("\n✅ Database seeding complete!\n");
    console.log("📝 Demo User Credentials:");
    console.log(`   Email:    ${DEMO_USER.email}`);
    console.log(`   Password: ${DEMO_USER.password}`);
    console.log("");
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

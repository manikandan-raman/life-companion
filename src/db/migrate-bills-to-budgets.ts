/**
 * Migration script to convert existing recurring bills to budget items
 * 
 * Run this ONCE after applying the database migration:
 * npx tsx src/db/migrate-bills-to-budgets.ts
 * 
 * What this does:
 * 1. For each user with recurring bills, creates a monthly budget for the current month
 * 2. Converts each recurring bill to a budget item with itemType: "payment"
 * 3. Marks all converted items as recurring so they auto-copy to future months
 * 4. Migrates payment history for the current month
 */

import { db } from "./index";
import { 
  recurringBills, 
  billPayments, 
  monthlyBudgets, 
  budgetItems,
  users 
} from "./schema";
import { eq, and } from "drizzle-orm";

async function migrateBillsToBudgets() {
  console.log("🚀 Starting migration of bills to budgets...\n");

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Get all users
  const allUsers = await db.query.users.findMany();
  console.log(`Found ${allUsers.length} users\n`);

  let totalBillsMigrated = 0;
  let totalPaymentsMigrated = 0;

  for (const user of allUsers) {
    console.log(`Processing user: ${user.email}`);

    // Get all recurring bills for this user
    const userBills = await db.query.recurringBills.findMany({
      where: eq(recurringBills.userId, user.id),
    });

    if (userBills.length === 0) {
      console.log(`  No bills found, skipping...\n`);
      continue;
    }

    console.log(`  Found ${userBills.length} recurring bills`);

    // Check if budget already exists for this month
    let budget = await db.query.monthlyBudgets.findFirst({
      where: and(
        eq(monthlyBudgets.userId, user.id),
        eq(monthlyBudgets.month, currentMonth),
        eq(monthlyBudgets.year, currentYear)
      ),
    });

    // Create budget if it doesn't exist
    if (!budget) {
      const [newBudget] = await db
        .insert(monthlyBudgets)
        .values({
          userId: user.id,
          month: currentMonth,
          year: currentYear,
          notes: "Auto-created during migration from bills",
        })
        .returning();
      budget = newBudget;
      console.log(`  Created monthly budget for ${currentMonth}/${currentYear}`);
    } else {
      console.log(`  Budget already exists for ${currentMonth}/${currentYear}`);
    }

    // Migrate each bill to a budget item
    for (const bill of userBills) {
      // Check if this bill was already migrated (by name match)
      const existingItem = await db.query.budgetItems.findFirst({
        where: and(
          eq(budgetItems.budgetId, budget.id),
          eq(budgetItems.name, bill.name)
        ),
      });

      if (existingItem) {
        console.log(`  Skipping "${bill.name}" - already migrated`);
        continue;
      }

      // Get payment status for current month
      const payment = await db.query.billPayments.findFirst({
        where: and(
          eq(billPayments.billId, bill.id),
          eq(billPayments.month, currentMonth),
          eq(billPayments.year, currentYear)
        ),
      });

      // Create budget item
      await db.insert(budgetItems).values({
        budgetId: budget.id,
        userId: user.id,
        itemType: "payment",
        categoryId: bill.categoryId,
        name: bill.name,
        amount: bill.amount,
        dueDay: bill.dueDay,
        isRecurring: true, // All bills are recurring
        isPaid: payment?.isPaid || false,
        paidDate: payment?.paidDate || null,
        paidAmount: payment?.paidAmount || null,
        accountId: bill.accountId,
        transactionId: payment?.transactionId || null,
        notes: bill.notes,
      });

      totalBillsMigrated++;
      console.log(`  ✓ Migrated "${bill.name}" (${payment?.isPaid ? "paid" : "unpaid"})`);

      if (payment?.isPaid) {
        totalPaymentsMigrated++;
      }
    }

    console.log("");
  }

  console.log("━".repeat(50));
  console.log(`\n✅ Migration complete!`);
  console.log(`   Bills migrated: ${totalBillsMigrated}`);
  console.log(`   Payments preserved: ${totalPaymentsMigrated}`);
  console.log(`\n📝 Note: The old bills tables are still intact.`);
  console.log(`   You can safely delete them after verifying the migration.`);
}

// Run the migration
migrateBillsToBudgets()
  .then(() => {
    console.log("\nMigration script finished.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });


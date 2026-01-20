import { db, budgetGoals } from "@/db";

/**
 * Seeds budget goals for a user (50/30/20 rule)
 * @param userId - The user's UUID
 */
export async function seedBudgetGoals(userId: string): Promise<void> {
  console.log("🎯 Seeding budget goals...");

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentYear = today.getFullYear();

  // Create budget goals for current month and previous month
  const months = [
    { month: currentMonth, year: currentYear },
    {
      month: currentMonth === 1 ? 12 : currentMonth - 1,
      year: currentMonth === 1 ? currentYear - 1 : currentYear,
    },
  ];

  for (const { month, year } of months) {
    await db.insert(budgetGoals).values({
      userId,
      month,
      year,
      needsPercentage: "50.00",
      wantsPercentage: "30.00",
      savingsPercentage: "20.00",
    });
  }

  console.log(`   ✓ Created budget goals for ${months.length} months`);
}

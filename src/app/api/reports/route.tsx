import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db, transactions, users, budgetGoals, monthlyBudgets, budgetItems, categories } from "@/db";
import { eq, and, gte, lte, sum } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { formatDateToString } from "@/lib/utils";
import { z } from "zod";
import { MonthlyReportDocument, type ReportData, type ReportCategory, type ReportCategoryLimit } from "@/lib/pdf/report-template";

const querySchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
});

// Default budget percentages (50/30/20 rule)
const DEFAULT_NEEDS_PERCENTAGE = 50;
const DEFAULT_WANTS_PERCENTAGE = 30;
const DEFAULT_SAVINGS_PERCENTAGE = 20;

export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const params = querySchema.parse({
      month: searchParams.get("month"),
      year: searchParams.get("year"),
    });

    const { month, year } = params;

    // Get date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month
    const startDateStr = formatDateToString(startDate);
    const endDateStr = formatDateToString(endDate);

    // Fetch user data
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch budget goal for this month/year (if exists)
    const budgetGoal = await db.query.budgetGoals.findFirst({
      where: and(
        eq(budgetGoals.userId, userId),
        eq(budgetGoals.month, month),
        eq(budgetGoals.year, year)
      ),
    });

    // Use stored percentages or defaults
    const needsPercentage = budgetGoal
      ? parseFloat(budgetGoal.needsPercentage)
      : DEFAULT_NEEDS_PERCENTAGE;
    const wantsPercentage = budgetGoal
      ? parseFloat(budgetGoal.wantsPercentage)
      : DEFAULT_WANTS_PERCENTAGE;
    const savingsPercentage = budgetGoal
      ? parseFloat(budgetGoal.savingsPercentage)
      : DEFAULT_SAVINGS_PERCENTAGE;

    // Fetch monthly budget with category limits
    const monthlyBudget = await db.query.monthlyBudgets.findFirst({
      where: and(
        eq(monthlyBudgets.userId, userId),
        eq(monthlyBudgets.month, month),
        eq(monthlyBudgets.year, year)
      ),
    });

    // Fetch category limits if monthly budget exists
    let categoryLimits: ReportCategoryLimit[] = [];
    if (monthlyBudget) {
      const limitItems = await db.query.budgetItems.findMany({
        where: and(
          eq(budgetItems.budgetId, monthlyBudget.id),
          eq(budgetItems.itemType, "limit")
        ),
        with: {
          category: true,
        },
      });

      // Get spending by category for this month
      const spendingByCategory = await db
        .select({
          categoryId: transactions.categoryId,
          total: sum(transactions.amount),
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            gte(transactions.transactionDate, startDateStr),
            lte(transactions.transactionDate, endDateStr)
          )
        )
        .groupBy(transactions.categoryId);

      const spendingMap = new Map(
        spendingByCategory.map((s) => [s.categoryId, parseFloat(String(s.total || 0))])
      );

      // Prepare category limits data
      categoryLimits = limitItems.map((item) => {
        const budgetAmount = parseFloat(String(item.amount));
        const spentAmount = item.categoryId ? spendingMap.get(item.categoryId) || 0 : 0;
        const percentage = budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 100) : 0;
        
        return {
          id: item.id,
          name: item.name,
          categoryName: item.category?.name || "Uncategorized",
          budgetAmount: Math.round(budgetAmount * 100) / 100,
          spentAmount: Math.round(spentAmount * 100) / 100,
          percentage,
          isOverBudget: spentAmount > budgetAmount,
        };
      });
    }

    // Fetch all transactions for the period with categories
    const transactionList = await db.query.transactions.findMany({
      where: and(
        eq(transactions.userId, userId),
        gte(transactions.transactionDate, startDateStr),
        lte(transactions.transactionDate, endDateStr)
      ),
      with: {
        category: true,
        subCategory: true,
        account: true,
      },
      orderBy: (transactions, { desc }) => [
        desc(transactions.transactionDate),
        desc(transactions.createdAt),
      ],
    });

    // Calculate summary totals
    let totalIncome = 0;
    let totalNeeds = 0;
    let totalWants = 0;
    let totalSavings = 0;
    let totalInvestments = 0;
    const categoryTotals: Record<
      string,
      { id: string; name: string; amount: number; type: string }
    > = {};

    transactionList.forEach((t) => {
      const amount = parseFloat(String(t.amount));
      const type = t.type;
      const categoryId = t.category?.id || "uncategorized";
      const categoryName = t.category?.name || "Uncategorized";

      switch (type) {
        case "income":
          totalIncome += amount;
          break;
        case "needs":
          totalNeeds += amount;
          break;
        case "wants":
          totalWants += amount;
          break;
        case "savings":
          totalSavings += amount;
          break;
        case "investments":
          totalInvestments += amount;
          break;
      }

      // Track spending by category (exclude income)
      if (type && type !== "income") {
        if (!categoryTotals[categoryId]) {
          categoryTotals[categoryId] = {
            id: categoryId,
            name: categoryName,
            amount: 0,
            type: type,
          };
        }
        categoryTotals[categoryId].amount += amount;
      }
    });

    const totalExpense = totalNeeds + totalWants + totalSavings + totalInvestments;
    const balance = totalIncome - totalExpense;

    // Calculate budget goals based on income
    const needsGoal = totalIncome * (needsPercentage / 100);
    const wantsGoal = totalIncome * (wantsPercentage / 100);
    const savingsGoal = totalIncome * (savingsPercentage / 100) * 0.5;
    const investmentsGoal = totalIncome * (savingsPercentage / 100) * 0.5;

    // Prepare categories with percentages
    const categories: ReportCategory[] = Object.values(categoryTotals)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        amount: Math.round(cat.amount * 100) / 100,
        percentage:
          totalExpense > 0
            ? Math.round((cat.amount / totalExpense) * 10000) / 100
            : 0,
        type: cat.type,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Prepare transactions for report
    const reportTransactions = transactionList
      .filter((t) => t.type !== "income")
      .map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        transactionDate: t.transactionDate,
        category: t.category ? { name: t.category.name } : null,
        subCategory: t.subCategory ? { name: t.subCategory.name } : null,
      }));

    // Prepare report data
    const reportData: ReportData = {
      month,
      year,
      userName: user.name,
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        balance: Math.round(balance * 100) / 100,
        needs: {
          current: Math.round(totalNeeds * 100) / 100,
          goal: Math.round(needsGoal * 100) / 100,
        },
        wants: {
          current: Math.round(totalWants * 100) / 100,
          goal: Math.round(wantsGoal * 100) / 100,
        },
        savings: {
          current: Math.round(totalSavings * 100) / 100,
          goal: Math.round(savingsGoal * 100) / 100,
        },
        investments: {
          current: Math.round(totalInvestments * 100) / 100,
          goal: Math.round(investmentsGoal * 100) / 100,
        },
      },
      categories,
      transactions: reportTransactions,
      categoryLimits,
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <MonthlyReportDocument data={reportData} />
    );

    // Get month name for filename
    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const monthName = monthNames[month - 1];
    const filename = `financial-report-${monthName}-${year}.pdf`;

    // Return PDF as response
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(pdfBuffer);
    
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("Generate report error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

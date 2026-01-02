import { NextResponse } from "next/server";
import { db, budgetGoals } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { budgetGoalSchema } from "@/schemas/category";
import { z } from "zod";

const querySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

// Default budget percentages (50/30/20 rule)
const DEFAULT_BUDGET_GOAL = {
  needsPercentage: "50.00",
  wantsPercentage: "30.00",
  savingsPercentage: "20.00",
};

// GET - Fetch budget goal for a specific month/year
export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const params = querySchema.parse({
      month: searchParams.get("month"),
      year: searchParams.get("year"),
    });

    // Find existing budget goal for the month/year
    const goal = await db.query.budgetGoals.findFirst({
      where: and(
        eq(budgetGoals.userId, userId),
        eq(budgetGoals.month, params.month),
        eq(budgetGoals.year, params.year)
      ),
    });

    // Return the goal or defaults
    if (goal) {
      return NextResponse.json({
        id: goal.id,
        month: goal.month,
        year: goal.year,
        needsPercentage: parseFloat(goal.needsPercentage),
        wantsPercentage: parseFloat(goal.wantsPercentage),
        savingsPercentage: parseFloat(goal.savingsPercentage),
        isCustom: true,
      });
    }

    // Return defaults if no custom goal exists
    return NextResponse.json({
      id: null,
      month: params.month,
      year: params.year,
      needsPercentage: parseFloat(DEFAULT_BUDGET_GOAL.needsPercentage),
      wantsPercentage: parseFloat(DEFAULT_BUDGET_GOAL.wantsPercentage),
      savingsPercentage: parseFloat(DEFAULT_BUDGET_GOAL.savingsPercentage),
      isCustom: false,
    });
  } catch (error) {
    console.error("Get budget goal error:", error);
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
      { error: "Failed to get budget goal" },
      { status: 500 }
    );
  }
}

// POST - Create or update budget goal for a month/year (upsert)
export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    // Validate input
    const result = budgetGoalSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check if goal already exists for this month/year
    const existingGoal = await db.query.budgetGoals.findFirst({
      where: and(
        eq(budgetGoals.userId, userId),
        eq(budgetGoals.month, data.month),
        eq(budgetGoals.year, data.year)
      ),
    });

    if (existingGoal) {
      // Update existing goal
      const [updated] = await db
        .update(budgetGoals)
        .set({
          needsPercentage: data.needsPercentage.toFixed(2),
          wantsPercentage: data.wantsPercentage.toFixed(2),
          savingsPercentage: data.savingsPercentage.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(budgetGoals.id, existingGoal.id))
        .returning();

      return NextResponse.json({
        id: updated.id,
        month: updated.month,
        year: updated.year,
        needsPercentage: parseFloat(updated.needsPercentage),
        wantsPercentage: parseFloat(updated.wantsPercentage),
        savingsPercentage: parseFloat(updated.savingsPercentage),
        isCustom: true,
        message: "Budget goal updated successfully",
      });
    }

    // Create new goal
    const [created] = await db
      .insert(budgetGoals)
      .values({
        userId,
        month: data.month,
        year: data.year,
        needsPercentage: data.needsPercentage.toFixed(2),
        wantsPercentage: data.wantsPercentage.toFixed(2),
        savingsPercentage: data.savingsPercentage.toFixed(2),
      })
      .returning();

    return NextResponse.json({
      id: created.id,
      month: created.month,
      year: created.year,
      needsPercentage: parseFloat(created.needsPercentage),
      wantsPercentage: parseFloat(created.wantsPercentage),
      savingsPercentage: parseFloat(created.savingsPercentage),
      isCustom: true,
      message: "Budget goal created successfully",
    });
  } catch (error) {
    console.error("Save budget goal error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to save budget goal" },
      { status: 500 }
    );
  }
}

// DELETE - Reset budget goal to defaults (delete custom goal)
export async function DELETE(request: Request) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const params = querySchema.parse({
      month: searchParams.get("month"),
      year: searchParams.get("year"),
    });

    // Delete existing goal
    await db
      .delete(budgetGoals)
      .where(
        and(
          eq(budgetGoals.userId, userId),
          eq(budgetGoals.month, params.month),
          eq(budgetGoals.year, params.year)
        )
      );

    return NextResponse.json({
      message: "Budget goal reset to defaults",
    });
  } catch (error) {
    console.error("Delete budget goal error:", error);
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
      { error: "Failed to reset budget goal" },
      { status: 500 }
    );
  }
}


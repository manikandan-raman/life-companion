import { NextResponse } from "next/server";
import { db, accounts, assets, liabilities, networthSnapshots } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import type { NetWorthBreakdown } from "@/types";

// POST - Create a snapshot of current net worth
export async function POST() {
  try {
    const { userId } = await requireAuth();

    // Fetch all accounts
    const userAccounts = await db.query.accounts.findMany({
      where: and(eq(accounts.userId, userId), eq(accounts.isArchived, false)),
    });

    // Fetch all assets
    const userAssets = await db.query.assets.findMany({
      where: and(eq(assets.userId, userId), eq(assets.isArchived, false)),
    });

    // Fetch all liabilities
    const userLiabilities = await db.query.liabilities.findMany({
      where: and(
        eq(liabilities.userId, userId),
        eq(liabilities.isArchived, false)
      ),
    });

    // Calculate breakdown
    const breakdown: NetWorthBreakdown = {
      bankAccounts: 0,
      cash: 0,
      investments: 0,
      fixedDeposits: 0,
      retirement: 0,
      creditCards: 0,
      loans: 0,
    };

    // Process accounts
    userAccounts.forEach((account) => {
      const balance = parseFloat(String(account.balance));
      switch (account.type) {
        case "bank":
          breakdown.bankAccounts += balance;
          break;
        case "cash":
          breakdown.cash += balance;
          break;
        case "credit_card":
          if (balance < 0) {
            breakdown.creditCards += Math.abs(balance);
          } else {
            breakdown.bankAccounts += balance;
          }
          break;
      }
    });

    // Process assets
    userAssets.forEach((asset) => {
      const value = parseFloat(String(asset.currentValue));
      switch (asset.type) {
        case "investment":
          breakdown.investments += value;
          break;
        case "fixed_deposit":
          breakdown.fixedDeposits += value;
          break;
        case "retirement":
          breakdown.retirement += value;
          break;
      }
    });

    // Process liabilities
    userLiabilities.forEach((liability) => {
      const outstanding = parseFloat(String(liability.outstandingBalance));
      breakdown.loans += outstanding;
    });

    // Calculate totals
    const totalAssets =
      breakdown.bankAccounts +
      breakdown.cash +
      breakdown.investments +
      breakdown.fixedDeposits +
      breakdown.retirement;

    const totalLiabilities = breakdown.creditCards + breakdown.loans;
    const netWorth = totalAssets - totalLiabilities;

    // Create snapshot
    const today = new Date().toISOString().split("T")[0];

    const [snapshot] = await db
      .insert(networthSnapshots)
      .values({
        userId,
        snapshotDate: today,
        totalAssets: String(totalAssets),
        totalLiabilities: String(totalLiabilities),
        netWorth: String(netWorth),
        breakdown: JSON.stringify(breakdown),
      })
      .returning();

    return NextResponse.json({
      data: snapshot,
      message: "Snapshot created successfully",
    });
  } catch (error) {
    console.error("Create snapshot error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create snapshot" },
      { status: 500 }
    );
  }
}


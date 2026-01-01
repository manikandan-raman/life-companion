import { NextResponse } from "next/server";
import { db, accounts, assets, liabilities } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import type { NetWorthBreakdown, NetWorthSummary } from "@/types";

// GET - Calculate current net worth
export async function GET() {
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

    // Process accounts (bank, cash, credit_card)
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
          // Credit card balance is typically negative (amount owed)
          // If positive, treat as prepaid amount (asset)
          if (balance < 0) {
            breakdown.creditCards += Math.abs(balance);
          } else {
            breakdown.bankAccounts += balance; // Treat positive balance as asset
          }
          break;
      }
    });

    // Process assets
    const assetsByType: Record<string, number> = {
      investment: 0,
      fixed_deposit: 0,
      retirement: 0,
    };

    userAssets.forEach((asset) => {
      const value = parseFloat(String(asset.currentValue));
      assetsByType[asset.type] = (assetsByType[asset.type] || 0) + value;

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
    const liabilitiesByType: Record<string, number> = {
      home_loan: 0,
      personal_loan: 0,
      other: 0,
    };

    userLiabilities.forEach((liability) => {
      const outstanding = parseFloat(String(liability.outstandingBalance));
      liabilitiesByType[liability.type] =
        (liabilitiesByType[liability.type] || 0) + outstanding;
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

    // Format assets by type for chart
    const assetsForChart = [
      { type: "Bank Accounts", value: breakdown.bankAccounts },
      { type: "Cash", value: breakdown.cash },
      { type: "Investments", value: breakdown.investments },
      { type: "Fixed Deposits", value: breakdown.fixedDeposits },
      { type: "Retirement", value: breakdown.retirement },
    ].filter((item) => item.value > 0);

    // Format liabilities by type for chart
    const liabilitiesForChart = [
      { type: "Credit Cards", value: breakdown.creditCards },
      { type: "Home Loan", value: liabilitiesByType.home_loan },
      { type: "Personal Loan", value: liabilitiesByType.personal_loan },
      { type: "Other Loans", value: liabilitiesByType.other },
    ].filter((item) => item.value > 0);

    const response: NetWorthSummary = {
      totalAssets: Math.round(totalAssets * 100) / 100,
      totalLiabilities: Math.round(totalLiabilities * 100) / 100,
      netWorth: Math.round(netWorth * 100) / 100,
      breakdown: {
        bankAccounts: Math.round(breakdown.bankAccounts * 100) / 100,
        cash: Math.round(breakdown.cash * 100) / 100,
        investments: Math.round(breakdown.investments * 100) / 100,
        fixedDeposits: Math.round(breakdown.fixedDeposits * 100) / 100,
        retirement: Math.round(breakdown.retirement * 100) / 100,
        creditCards: Math.round(breakdown.creditCards * 100) / 100,
        loans: Math.round(breakdown.loans * 100) / 100,
      },
      assetsByType: assetsForChart,
      liabilitiesByType: liabilitiesForChart,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get net worth error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to calculate net worth" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { db, networthSnapshots } from "@/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";
import type { NetWorthHistory } from "@/types";

const historyQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(12),
});

// GET - Get historical net worth data
export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const params = historyQuerySchema.parse({
      limit: searchParams.get("limit") || 12,
    });

    const snapshots = await db.query.networthSnapshots.findMany({
      where: eq(networthSnapshots.userId, userId),
      orderBy: [desc(networthSnapshots.snapshotDate)],
      limit: params.limit,
    });

    // Transform to response format
    const history: NetWorthHistory[] = snapshots
      .map((snapshot) => ({
        date: snapshot.snapshotDate,
        totalAssets: parseFloat(String(snapshot.totalAssets)),
        totalLiabilities: parseFloat(String(snapshot.totalLiabilities)),
        netWorth: parseFloat(String(snapshot.netWorth)),
      }))
      .reverse(); // Oldest first for chart display

    return NextResponse.json({ data: history });
  } catch (error) {
    console.error("Get net worth history error:", error);
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
      { error: "Failed to get net worth history" },
      { status: 500 }
    );
  }
}


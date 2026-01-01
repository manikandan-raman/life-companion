import { NextResponse } from "next/server";
import { db, assets } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { assetSchema } from "@/schemas/asset";

// GET - List all assets for the user
export async function GET() {
  try {
    const { userId } = await requireAuth();

    const userAssets = await db.query.assets.findMany({
      where: and(eq(assets.userId, userId), eq(assets.isArchived, false)),
      with: {
        valuations: {
          orderBy: (valuations, { desc }) => [desc(valuations.valuationDate)],
          limit: 10,
        },
      },
      orderBy: (assets, { desc }) => [desc(assets.currentValue)],
    });

    return NextResponse.json({ data: userAssets });
  } catch (error) {
    console.error("Get assets error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to get assets" },
      { status: 500 }
    );
  }
}

// POST - Create a new asset
export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    // Validate input
    const validationResult = assetSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create asset
    const [newAsset] = await db
      .insert(assets)
      .values({
        userId,
        name: data.name,
        type: data.type,
        subtype: data.subtype,
        currentValue: String(data.currentValue),
        purchaseValue: String(data.purchaseValue),
        purchaseDate: data.purchaseDate
          ? data.purchaseDate.toISOString().split("T")[0]
          : null,
        maturityDate: data.maturityDate
          ? data.maturityDate.toISOString().split("T")[0]
          : null,
        interestRate: data.interestRate ? String(data.interestRate) : null,
        notes: data.notes,
        color: data.color,
      })
      .returning();

    return NextResponse.json({
      data: newAsset,
      message: "Asset created successfully",
    });
  } catch (error) {
    console.error("Create asset error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}


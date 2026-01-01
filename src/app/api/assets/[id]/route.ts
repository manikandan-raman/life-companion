import { NextResponse } from "next/server";
import { db, assets, assetValuations } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { assetSchema, assetValuationSchema } from "@/schemas/asset";

// GET - Get a single asset with valuations
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const asset = await db.query.assets.findFirst({
      where: and(eq(assets.id, id), eq(assets.userId, userId)),
      with: {
        valuations: {
          orderBy: (valuations, { desc }) => [desc(valuations.valuationDate)],
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ data: asset });
  } catch (error) {
    console.error("Get asset error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to get asset" },
      { status: 500 }
    );
  }
}

// PUT - Update an asset
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Check if asset exists and belongs to user
    const existingAsset = await db.query.assets.findFirst({
      where: and(eq(assets.id, id), eq(assets.userId, userId)),
    });

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Validate input
    const validationResult = assetSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Update asset
    const [updatedAsset] = await db
      .update(assets)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(assets.id, id))
      .returning();

    return NextResponse.json({
      data: updatedAsset,
      message: "Asset updated successfully",
    });
  } catch (error) {
    console.error("Update asset error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

// DELETE - Archive an asset
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    // Check if asset exists and belongs to user
    const existingAsset = await db.query.assets.findFirst({
      where: and(eq(assets.id, id), eq(assets.userId, userId)),
    });

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Archive asset (soft delete)
    await db
      .update(assets)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(eq(assets.id, id));

    return NextResponse.json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Delete asset error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}

// POST - Add a valuation to an asset
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Check if asset exists and belongs to user
    const existingAsset = await db.query.assets.findFirst({
      where: and(eq(assets.id, id), eq(assets.userId, userId)),
    });

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Validate input
    const validationResult = assetValuationSchema.safeParse({
      ...body,
      assetId: id,
    });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create valuation
    const [newValuation] = await db
      .insert(assetValuations)
      .values({
        assetId: id,
        value: String(data.value),
        valuationDate: data.valuationDate.toISOString().split("T")[0],
        notes: data.notes,
      })
      .returning();

    // Update asset current value
    await db
      .update(assets)
      .set({
        currentValue: String(data.value),
        updatedAt: new Date(),
      })
      .where(eq(assets.id, id));

    return NextResponse.json({
      data: newValuation,
      message: "Valuation added successfully",
    });
  } catch (error) {
    console.error("Add valuation error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to add valuation" },
      { status: 500 }
    );
  }
}


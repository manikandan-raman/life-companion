import { NextResponse } from "next/server";
import { db, liabilities } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { liabilitySchema } from "@/schemas/liability";

// GET - List all liabilities for the user
export async function GET() {
  try {
    const { userId } = await requireAuth();

    const userLiabilities = await db.query.liabilities.findMany({
      where: and(
        eq(liabilities.userId, userId),
        eq(liabilities.isArchived, false)
      ),
      with: {
        payments: {
          orderBy: (payments, { desc }) => [desc(payments.paymentDate)],
          limit: 10,
        },
      },
      orderBy: (liabilities, { desc }) => [desc(liabilities.outstandingBalance)],
    });

    return NextResponse.json({ data: userLiabilities });
  } catch (error) {
    console.error("Get liabilities error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to get liabilities" },
      { status: 500 }
    );
  }
}

// POST - Create a new liability
export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    // Validate input
    const validationResult = liabilitySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create liability
    const [newLiability] = await db
      .insert(liabilities)
      .values({
        userId,
        name: data.name,
        type: data.type,
        principalAmount: String(data.principalAmount),
        outstandingBalance: String(data.outstandingBalance),
        interestRate: String(data.interestRate),
        emiAmount: data.emiAmount ? String(data.emiAmount) : null,
        startDate: data.startDate.toISOString().split("T")[0],
        endDate: data.endDate
          ? data.endDate.toISOString().split("T")[0]
          : null,
        notes: data.notes,
        color: data.color,
      })
      .returning();

    return NextResponse.json({
      data: newLiability,
      message: "Liability created successfully",
    });
  } catch (error) {
    console.error("Create liability error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create liability" },
      { status: 500 }
    );
  }
}


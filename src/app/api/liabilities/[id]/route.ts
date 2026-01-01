import { NextResponse } from "next/server";
import { db, liabilities, liabilityPayments } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { liabilitySchema, liabilityPaymentSchema } from "@/schemas/liability";

// GET - Get a single liability with payments
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const liability = await db.query.liabilities.findFirst({
      where: and(eq(liabilities.id, id), eq(liabilities.userId, userId)),
      with: {
        payments: {
          orderBy: (payments, { desc }) => [desc(payments.paymentDate)],
        },
      },
    });

    if (!liability) {
      return NextResponse.json(
        { error: "Liability not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: liability });
  } catch (error) {
    console.error("Get liability error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to get liability" },
      { status: 500 }
    );
  }
}

// PUT - Update a liability
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Check if liability exists and belongs to user
    const existingLiability = await db.query.liabilities.findFirst({
      where: and(eq(liabilities.id, id), eq(liabilities.userId, userId)),
    });

    if (!existingLiability) {
      return NextResponse.json(
        { error: "Liability not found" },
        { status: 404 }
      );
    }

    // Validate input
    const validationResult = liabilitySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Update liability
    const [updatedLiability] = await db
      .update(liabilities)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(liabilities.id, id))
      .returning();

    return NextResponse.json({
      data: updatedLiability,
      message: "Liability updated successfully",
    });
  } catch (error) {
    console.error("Update liability error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update liability" },
      { status: 500 }
    );
  }
}

// DELETE - Archive a liability
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    // Check if liability exists and belongs to user
    const existingLiability = await db.query.liabilities.findFirst({
      where: and(eq(liabilities.id, id), eq(liabilities.userId, userId)),
    });

    if (!existingLiability) {
      return NextResponse.json(
        { error: "Liability not found" },
        { status: 404 }
      );
    }

    // Archive liability (soft delete)
    await db
      .update(liabilities)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(eq(liabilities.id, id));

    return NextResponse.json({ message: "Liability deleted successfully" });
  } catch (error) {
    console.error("Delete liability error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete liability" },
      { status: 500 }
    );
  }
}

// POST - Add a payment to a liability
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Check if liability exists and belongs to user
    const existingLiability = await db.query.liabilities.findFirst({
      where: and(eq(liabilities.id, id), eq(liabilities.userId, userId)),
    });

    if (!existingLiability) {
      return NextResponse.json(
        { error: "Liability not found" },
        { status: 404 }
      );
    }

    // Validate input
    const validationResult = liabilityPaymentSchema.safeParse({
      ...body,
      liabilityId: id,
    });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create payment
    const [newPayment] = await db
      .insert(liabilityPayments)
      .values({
        liabilityId: id,
        amount: String(data.amount),
        principalPaid: data.principalPaid ? String(data.principalPaid) : null,
        interestPaid: data.interestPaid ? String(data.interestPaid) : null,
        paymentDate: data.paymentDate.toISOString().split("T")[0],
        notes: data.notes,
      })
      .returning();

    // Update outstanding balance if principal paid is provided
    if (data.principalPaid) {
      const newOutstanding =
        parseFloat(String(existingLiability.outstandingBalance)) -
        data.principalPaid;
      await db
        .update(liabilities)
        .set({
          outstandingBalance: String(Math.max(0, newOutstanding)),
          updatedAt: new Date(),
        })
        .where(eq(liabilities.id, id));
    }

    return NextResponse.json({
      data: newPayment,
      message: "Payment added successfully",
    });
  } catch (error) {
    console.error("Add payment error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to add payment" },
      { status: 500 }
    );
  }
}


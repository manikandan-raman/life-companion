import { NextResponse } from "next/server";
import { db, recurringBills, billPayments, transactions, accounts } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { billPaymentSchema } from "@/schemas/bill";
import { format } from "date-fns";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Mark a bill as paid for a specific month
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Get month/year from query or default to current
    const url = new URL(request.url);
    const month = parseInt(url.searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(url.searchParams.get("year") || String(new Date().getFullYear()));

    // Check if bill exists and belongs to user
    const bill = await db.query.recurringBills.findFirst({
      where: and(eq(recurringBills.id, id), eq(recurringBills.userId, userId)),
      with: {
        category: true,
        subCategory: true,
      },
    });

    if (!bill) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      );
    }

    // Validate input
    const validationResult = billPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify account belongs to user
    const account = await db.query.accounts.findFirst({
      where: and(
        eq(accounts.id, data.accountId),
        eq(accounts.userId, userId)
      ),
    });
    if (!account) {
      return NextResponse.json(
        { error: "Invalid account" },
        { status: 400 }
      );
    }

    // Check if payment already exists for this month/year
    const existingPayment = await db.query.billPayments.findFirst({
      where: and(
        eq(billPayments.billId, id),
        eq(billPayments.month, month),
        eq(billPayments.year, year)
      ),
    });

    if (existingPayment?.isPaid) {
      return NextResponse.json(
        { error: "Bill already paid for this month" },
        { status: 400 }
      );
    }

    // Format date in local timezone to avoid UTC offset issues
    const paidDateStr = format(data.paidDate, "yyyy-MM-dd");

    // Create a transaction for this payment
    const [newTransaction] = await db
      .insert(transactions)
      .values({
        userId,
        type: data.type,
        amount: String(data.paidAmount),
        description: `${bill.name} - ${month}/${year}`,
        notes: `Bill payment for ${bill.name}`,
        categoryId: bill.categoryId,
        subCategoryId: bill.subCategoryId,
        accountId: data.accountId,
        transactionDate: paidDateStr,
      })
      .returning();

    // Create or update bill payment record
    let payment;
    if (existingPayment) {
      // Update existing payment
      [payment] = await db
        .update(billPayments)
        .set({
          isPaid: true,
          paidDate: paidDateStr,
          paidAmount: String(data.paidAmount),
          accountId: data.accountId,
          transactionId: newTransaction.id,
        })
        .where(eq(billPayments.id, existingPayment.id))
        .returning();
    } else {
      // Create new payment
      [payment] = await db
        .insert(billPayments)
        .values({
          billId: id,
          month,
          year,
          isPaid: true,
          paidDate: paidDateStr,
          paidAmount: String(data.paidAmount),
          accountId: data.accountId,
          transactionId: newTransaction.id,
        })
        .returning();
    }

    // Get the full payment with relations
    const fullPayment = await db.query.billPayments.findFirst({
      where: eq(billPayments.id, payment.id),
      with: {
        bill: true,
        account: true,
        transaction: {
          with: {
            category: true,
            subCategory: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: fullPayment,
      message: "Bill marked as paid successfully",
    });
  } catch (error) {
    console.error("Pay bill error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to mark bill as paid" },
      { status: 500 }
    );
  }
}

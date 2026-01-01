import { NextResponse } from "next/server";
import { db, recurringBills, categories, accounts, billPayments } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { recurringBillSchema, billFilterSchema } from "@/schemas/bill";

// Helper function to compute bill status
function computeBillStatus(
  bill: { dueDay: number; isActive: boolean | null },
  payment: { isPaid: boolean | null } | null,
  month: number,
  year: number
): "paid" | "overdue" | "due_today" | "upcoming" | "pending" {
  if (!bill.isActive) return "pending";
  if (payment?.isPaid) return "paid";

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  // If we're looking at a different month/year, it's just pending
  if (month !== currentMonth || year !== currentYear) {
    return "pending";
  }

  const dueDay = bill.dueDay;

  if (currentDay > dueDay) {
    return "overdue";
  } else if (currentDay === dueDay) {
    return "due_today";
  } else if (dueDay - currentDay <= 7) {
    return "upcoming";
  }

  return "pending";
}

// GET - List all recurring bills with payment status for a month
export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const today = new Date();
    const params = billFilterSchema.parse({
      month: searchParams.get("month") || today.getMonth() + 1,
      year: searchParams.get("year") || today.getFullYear(),
      categoryId: searchParams.get("categoryId") || undefined,
      isActive: searchParams.get("isActive") || undefined,
      status: searchParams.get("status") || undefined,
    });

    const month = params.month || today.getMonth() + 1;
    const year = params.year || today.getFullYear();

    // Build conditions
    const conditions = [eq(recurringBills.userId, userId)];

    if (params.categoryId) {
      conditions.push(eq(recurringBills.categoryId, params.categoryId));
    }
    if (params.isActive !== undefined) {
      conditions.push(eq(recurringBills.isActive, params.isActive));
    }

    // Get bills with relations
    const bills = await db.query.recurringBills.findMany({
      where: and(...conditions),
      with: {
        category: true,
        account: true,
      },
      orderBy: [desc(recurringBills.createdAt)],
    });

    // Get payments for this month/year for all bills
    const billIds = bills.map((b) => b.id);
    const payments = billIds.length > 0
      ? await db.query.billPayments.findMany({
          where: and(
            eq(billPayments.month, month),
            eq(billPayments.year, year)
          ),
          with: {
            account: true,
          },
        })
      : [];

    // Create a map of bill ID to payment
    const paymentMap = new Map(payments.map((p) => [p.billId, p]));

    // Transform bills to include payment status
    const billsWithStatus = bills.map((bill) => {
      const payment = paymentMap.get(bill.id);
      const status = computeBillStatus(bill, payment ?? null, month, year);

      return {
        ...bill,
        payment: payment || null,
        status,
      };
    });

    // Filter by status if requested
    let filteredBills = billsWithStatus;
    if (params.status && params.status !== "all") {
      filteredBills = billsWithStatus.filter((b) => b.status === params.status);
    }

    // Group by status for easier UI rendering
    const grouped = {
      overdue: filteredBills.filter((b) => b.status === "overdue"),
      due_today: filteredBills.filter((b) => b.status === "due_today"),
      upcoming: filteredBills.filter((b) => b.status === "upcoming"),
      pending: filteredBills.filter((b) => b.status === "pending"),
      paid: filteredBills.filter((b) => b.status === "paid"),
    };

    // Calculate summary
    const summary = {
      total: filteredBills.length,
      totalAmount: filteredBills.reduce((sum, b) => sum + parseFloat(String(b.amount)), 0),
      paid: grouped.paid.length,
      paidAmount: grouped.paid.reduce((sum, b) => sum + parseFloat(String(b.payment?.paidAmount || b.amount)), 0),
      unpaid: filteredBills.length - grouped.paid.length,
      unpaidAmount: filteredBills
        .filter((b) => b.status !== "paid")
        .reduce((sum, b) => sum + parseFloat(String(b.amount)), 0),
      overdue: grouped.overdue.length,
    };

    return NextResponse.json({
      data: filteredBills,
      grouped,
      summary,
      month,
      year,
    });
  } catch (error) {
    console.error("Get bills error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to get bills" },
      { status: 500 }
    );
  }
}

// POST - Create a new recurring bill
export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    // Validate input
    const validationResult = recurringBillSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify category belongs to user (if provided)
    if (data.categoryId) {
      const category = await db.query.categories.findFirst({
        where: and(
          eq(categories.id, data.categoryId),
          eq(categories.userId, userId)
        ),
      });
      if (!category) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
      }
    }

    // Verify account belongs to user (if provided)
    if (data.accountId) {
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
    }

    // Create recurring bill
    const [newBill] = await db
      .insert(recurringBills)
      .values({
        userId,
        name: data.name,
        amount: String(data.amount),
        categoryId: data.categoryId || null,
        accountId: data.accountId || null,
        dueDay: data.dueDay,
        notes: data.notes || null,
        isActive: data.isActive,
      })
      .returning();

    // Get the full bill with relations
    const fullBill = await db.query.recurringBills.findFirst({
      where: eq(recurringBills.id, newBill.id),
      with: {
        category: true,
        account: true,
      },
    });

    return NextResponse.json({
      data: fullBill,
      message: "Recurring bill created successfully",
    });
  } catch (error) {
    console.error("Create bill error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create recurring bill" },
      { status: 500 }
    );
  }
}

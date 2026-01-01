import { NextResponse } from "next/server";
import { db, users, categories, accounts } from "@/db";
import { eq } from "drizzle-orm";
import { signupApiSchema } from "@/schemas/auth";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";

// Default categories to create for new users
const DEFAULT_CATEGORIES = [
  // Income
  { name: "Salary", type: "income" as const, color: "#10b981", icon: "briefcase" },
  { name: "Bonus", type: "income" as const, color: "#10b981", icon: "gift" },
  { name: "Investment Returns", type: "income" as const, color: "#10b981", icon: "trending-up" },
  { name: "Other Income", type: "income" as const, color: "#10b981", icon: "plus-circle" },
  // Needs
  { name: "Rent/Home Loan", type: "needs" as const, color: "#3b82f6", icon: "home" },
  { name: "Groceries", type: "needs" as const, color: "#3b82f6", icon: "shopping-cart" },
  { name: "Utilities", type: "needs" as const, color: "#3b82f6", icon: "zap" },
  { name: "Transportation", type: "needs" as const, color: "#3b82f6", icon: "car" },
  { name: "Insurance", type: "needs" as const, color: "#3b82f6", icon: "shield" },
  { name: "Healthcare", type: "needs" as const, color: "#3b82f6", icon: "heart" },
  { name: "EMI", type: "needs" as const, color: "#3b82f6", icon: "credit-card" },
  // Wants
  { name: "Entertainment", type: "wants" as const, color: "#f59e0b", icon: "film" },
  { name: "Dining Out", type: "wants" as const, color: "#f59e0b", icon: "utensils" },
  { name: "Shopping", type: "wants" as const, color: "#f59e0b", icon: "shopping-bag" },
  { name: "Subscriptions", type: "wants" as const, color: "#f59e0b", icon: "tv" },
  { name: "Other Expenses", type: "wants" as const, color: "#f59e0b", icon: "more-horizontal" },
  // Savings
  { name: "PPF", type: "savings" as const, color: "#8b5cf6", icon: "piggy-bank" },
  { name: "NPS", type: "savings" as const, color: "#8b5cf6", icon: "landmark" },
  { name: "Mutual Funds", type: "savings" as const, color: "#8b5cf6", icon: "bar-chart" },
  { name: "Stocks", type: "savings" as const, color: "#8b5cf6", icon: "trending-up" },
  { name: "Fixed Deposit", type: "savings" as const, color: "#8b5cf6", icon: "lock" },
  { name: "Emergency Fund", type: "savings" as const, color: "#8b5cf6", icon: "life-buoy" },
  { name: "Gold", type: "savings" as const, color: "#8b5cf6", icon: "circle" },
];

// Default account to create for new users
const DEFAULT_ACCOUNT = {
  name: "Cash",
  type: "cash" as const,
  balance: "0",
  color: "#10b981",
  icon: "wallet",
  isDefault: true,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = signupApiSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = validationResult.data;

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        name,
      })
      .returning();

    // Create default categories for the user
    await db.insert(categories).values(
      DEFAULT_CATEGORIES.map((cat, index) => ({
        userId: newUser.id,
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        sortOrder: index,
        isSystem: true,
      }))
    );

    // Create default account for the user
    await db.insert(accounts).values({
      userId: newUser.id,
      ...DEFAULT_ACCOUNT,
    });

    // Generate token and set cookie
    const token = await generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });
    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}

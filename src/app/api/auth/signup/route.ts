import { NextResponse } from "next/server";
import { db, users, accounts } from "@/db";
import { eq } from "drizzle-orm";
import { signupApiSchema } from "@/schemas/auth";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";
import { seedCategoriesForUser } from "@/db/seed-categories";

// Default account to create for new users
const DEFAULT_ACCOUNT = {
  name: "Cash",
  type: "cash" as const,
  balance: "0",
  color: "#5cb78a",
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

    // Create default categories and sub-categories for the user
    await seedCategoriesForUser(newUser.id);

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

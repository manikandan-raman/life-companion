import { NextResponse } from "next/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { loginSchema } from "@/schemas/auth";
import { verifyPassword, generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate token and set cookie
    const token = await generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to login. Please try again." },
      { status: 500 }
    );
  }
}


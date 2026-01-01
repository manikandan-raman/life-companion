import { NextResponse } from "next/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const payload = await getCurrentUser();
    
    if (!payload) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
      columns: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to get user information" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { db, categories } from "@/db";
import { eq, and, asc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { categorySchema } from "@/schemas/category";

// GET - List all categories for the user
export async function GET() {
  try {
    const { userId } = await requireAuth();

    const userCategories = await db.query.categories.findMany({
      where: and(
        eq(categories.userId, userId),
        eq(categories.isArchived, false)
      ),
      orderBy: [asc(categories.type), asc(categories.sortOrder), asc(categories.name)],
    });

    return NextResponse.json({ data: userCategories });
  } catch (error) {
    console.error("Get categories error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to get categories" },
      { status: 500 }
    );
  }
}

// POST - Create a new category
export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    // Validate input
    const validationResult = categorySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Get max sort order for this type
    const existingCategories = await db.query.categories.findMany({
      where: and(
        eq(categories.userId, userId),
        eq(categories.type, data.type)
      ),
    });
    const maxSortOrder = Math.max(0, ...existingCategories.map((c) => c.sortOrder || 0));

    // Create category
    const [newCategory] = await db
      .insert(categories)
      .values({
        userId,
        name: data.name,
        type: data.type,
        color: data.color,
        icon: data.icon,
        sortOrder: maxSortOrder + 1,
        isSystem: false,
      })
      .returning();

    return NextResponse.json({
      data: newCategory,
      message: "Category created successfully",
    });
  } catch (error) {
    console.error("Create category error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}


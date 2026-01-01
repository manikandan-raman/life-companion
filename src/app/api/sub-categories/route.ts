import { NextResponse } from "next/server";
import { db, subCategories, categories } from "@/db";
import { eq, and, asc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { subCategorySchema } from "@/schemas/category";

// GET - List sub-categories (optionally filtered by categoryId)
export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const conditions = [
      eq(subCategories.userId, userId),
      eq(subCategories.isArchived, false),
    ];

    if (categoryId) {
      conditions.push(eq(subCategories.categoryId, categoryId));
    }

    const userSubCategories = await db.query.subCategories.findMany({
      where: and(...conditions),
      with: {
        category: true,
      },
      orderBy: [asc(subCategories.sortOrder), asc(subCategories.name)],
    });

    return NextResponse.json({ data: userSubCategories });
  } catch (error) {
    console.error("Get sub-categories error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to get sub-categories" },
      { status: 500 }
    );
  }
}

// POST - Create a new sub-category
export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    // Validate input
    const validationResult = subCategorySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify category belongs to user
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

    // Get max sort order for this category
    const existingSubCategories = await db.query.subCategories.findMany({
      where: eq(subCategories.categoryId, data.categoryId),
    });
    const maxSortOrder = Math.max(0, ...existingSubCategories.map((c) => c.sortOrder || 0));

    // Create sub-category
    const [newSubCategory] = await db
      .insert(subCategories)
      .values({
        categoryId: data.categoryId,
        userId,
        name: data.name,
        icon: data.icon,
        sortOrder: maxSortOrder + 1,
        isSystem: false,
      })
      .returning();

    return NextResponse.json({
      data: newSubCategory,
      message: "Sub-category created successfully",
    });
  } catch (error) {
    console.error("Create sub-category error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create sub-category" },
      { status: 500 }
    );
  }
}


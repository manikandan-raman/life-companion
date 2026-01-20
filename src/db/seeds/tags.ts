import { db, tags } from "@/db";

// Seed tag data
export const SEED_TAGS = [
  { name: "Essential", color: "#ef4444" },
  { name: "Recurring", color: "#3b82f6" },
  { name: "Work", color: "#8b5cf6" },
  { name: "Personal", color: "#22c55e" },
  { name: "Family", color: "#f59e0b" },
  { name: "One-time", color: "#6b7280" },
  { name: "Planned", color: "#06b6d4" },
  { name: "Impulse", color: "#ec4899" },
];

/**
 * Seeds tags for a user
 * @param userId - The user's UUID
 * @returns Map of tag names to their IDs
 */
export async function seedTags(userId: string): Promise<Map<string, string>> {
  console.log("🏷️  Seeding tags...");

  const tagIdMap = new Map<string, string>();

  for (const tag of SEED_TAGS) {
    const [created] = await db
      .insert(tags)
      .values({
        userId,
        name: tag.name,
        color: tag.color,
      })
      .returning();

    tagIdMap.set(tag.name, created.id);
  }

  console.log(`   ✓ Created ${SEED_TAGS.length} tags`);

  return tagIdMap;
}

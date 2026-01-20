import { db, users } from "@/db";
import bcrypt from "bcryptjs";

// Demo user credentials
export const DEMO_USER = {
  email: "test@gmail.com",
  password: "Test@123",
  name: "Demo User",
};

/**
 * Seeds the demo user
 * @returns The created user's ID
 */
export async function seedUsers(): Promise<string> {
  console.log("👤 Seeding users...");

  // Hash the password
  const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);

  const [user] = await db
    .insert(users)
    .values({
      email: DEMO_USER.email,
      passwordHash,
      name: DEMO_USER.name,
    })
    .returning();

  console.log(`   ✓ Created user: ${DEMO_USER.email}`);
  console.log(`   ℹ Password: ${DEMO_USER.password}`);

  return user.id;
}

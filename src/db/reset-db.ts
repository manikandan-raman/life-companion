import postgres from "postgres";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

async function resetDatabase() {
  console.log("🗑️  Starting database reset...\n");

  const sql = postgres(connectionString, {
    max: 1,
    onnotice: () => {}, // Suppress notices
  });

  try {
    // Drop all tables in reverse dependency order using CASCADE
    // This ensures foreign key constraints don't block deletion
    const tables = [
      // Junction and child tables first
      "transaction_tags",
      "bill_payments",
      "budget_items",
      "liability_payments",
      "asset_valuations",
      "networth_snapshots",
      // Main tables with foreign keys
      "monthly_budgets",
      "recurring_bills",
      "budget_goals",
      "transactions",
      "tags",
      "sub_categories",
      "liabilities",
      "assets",
      "categories",
      "accounts",
      // Root table last
      "users",
    ];

    // Also drop enums
    const enums = [
      "account_type",
      "transaction_type",
      "asset_type",
      "asset_subtype",
      "liability_type",
      "budget_item_type",
    ];

    console.log("📋 Dropping tables...");
    for (const table of tables) {
      try {
        await sql.unsafe(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`   ✓ Dropped table: ${table}`);
      } catch (error) {
        console.log(`   ⚠ Table ${table} might not exist, skipping...`);
      }
    }

    console.log("\n📋 Dropping enums...");
    for (const enumName of enums) {
      try {
        await sql.unsafe(`DROP TYPE IF EXISTS "${enumName}" CASCADE`);
        console.log(`   ✓ Dropped enum: ${enumName}`);
      } catch (error) {
        console.log(`   ⚠ Enum ${enumName} might not exist, skipping...`);
      }
    }

    // Drop the entire drizzle schema (includes migrations tracking)
    console.log("\n📋 Dropping Drizzle schema...");
    try {
      await sql.unsafe(`DROP SCHEMA IF EXISTS "drizzle" CASCADE`);
      console.log(`   ✓ Dropped drizzle schema`);
    } catch (error) {
      console.log(`   ⚠ drizzle schema might not exist, skipping...`);
    }

    // Also drop any standalone migrations table (in case it exists in public schema)
    try {
      await sql.unsafe(`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE`);
      console.log(`   ✓ Dropped __drizzle_migrations (if existed in public)`);
    } catch (error) {
      // Ignore
    }

    console.log("\n✅ Database reset complete!");
    console.log("\n📝 Next steps:");
    console.log("   1. Run 'yarn db:migrate' to apply migrations");
    console.log("   2. Run 'yarn db:seed' to seed example data");
    console.log("   Or run 'yarn db:fresh' to do both at once");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

resetDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

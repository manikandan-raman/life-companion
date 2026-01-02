import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
  integer,
  date,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const accountTypeEnum = pgEnum("account_type", [
  "bank",
  "cash",
  "credit_card",
]);

// Transaction type (moved from categories)
export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "needs",
  "wants",
  "savings",
  "investments",
]);

export const assetTypeEnum = pgEnum("asset_type", [
  "investment",
  "fixed_deposit",
  "retirement",
]);

export const assetSubtypeEnum = pgEnum("asset_subtype", [
  "mutual_fund",
  "stock",
  "etf",
  "fd",
  "rd",
  "epf",
  "ppf",
  "nps",
  "other",
]);

export const liabilityTypeEnum = pgEnum("liability_type", [
  "home_loan",
  "personal_loan",
  "other",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Accounts table
export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: accountTypeEnum("type").notNull().default("bank"),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull().default("0"),
  color: varchar("color", { length: 7 }).default("#3b82f6"),
  icon: varchar("icon", { length: 50 }).default("wallet"),
  isDefault: boolean("is_default").default(false),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories table (type-agnostic now)
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }).default("circle"),
  sortOrder: integer("sort_order").default(0),
  isSystem: boolean("is_system").default(false),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sub-categories table
export const subCategories = pgTable("sub_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }).default("circle"),
  sortOrder: integer("sort_order").default(0),
  isSystem: boolean("is_system").default(false),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tags table
export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  color: varchar("color", { length: 7 }).default("#6b7280"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  type: transactionTypeEnum("type").notNull(),
  accountId: uuid("account_id")
    .references(() => accounts.id, { onDelete: "set null" }),
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "set null" }),
  subCategoryId: uuid("sub_category_id")
    .references(() => subCategories.id, { onDelete: "set null" }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }),
  notes: text("notes"),
  transactionDate: date("transaction_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transaction Tags junction table (many-to-many)
export const transactionTags = pgTable(
  "transaction_tags",
  {
    transactionId: uuid("transaction_id")
      .references(() => transactions.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.transactionId, table.tagId] })]
);

// Budget Goals table
export const budgetGoals = pgTable("budget_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  needsPercentage: decimal("needs_percentage", { precision: 5, scale: 2 })
    .notNull()
    .default("50"),
  wantsPercentage: decimal("wants_percentage", { precision: 5, scale: 2 })
    .notNull()
    .default("30"),
  savingsPercentage: decimal("savings_percentage", { precision: 5, scale: 2 })
    .notNull()
    .default("20"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Assets table - for investments, FDs, retirement funds
export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: assetTypeEnum("type").notNull(),
  subtype: assetSubtypeEnum("subtype").notNull(),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }).notNull().default("0"),
  purchaseValue: decimal("purchase_value", { precision: 15, scale: 2 }).notNull().default("0"),
  purchaseDate: date("purchase_date"),
  maturityDate: date("maturity_date"),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  notes: text("notes"),
  color: varchar("color", { length: 7 }).default("#5cb78a"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Asset Valuations - historical value tracking
export const assetValuations = pgTable("asset_valuations", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id")
    .references(() => assets.id, { onDelete: "cascade" })
    .notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  valuationDate: date("valuation_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Liabilities table - for loans
export const liabilities = pgTable("liabilities", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: liabilityTypeEnum("type").notNull(),
  principalAmount: decimal("principal_amount", { precision: 15, scale: 2 }).notNull(),
  outstandingBalance: decimal("outstanding_balance", { precision: 15, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  emiAmount: decimal("emi_amount", { precision: 15, scale: 2 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  notes: text("notes"),
  color: varchar("color", { length: 7 }).default("#ef4444"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Liability Payments - track EMI/loan payments
export const liabilityPayments = pgTable("liability_payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  liabilityId: uuid("liability_id")
    .references(() => liabilities.id, { onDelete: "cascade" })
    .notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  principalPaid: decimal("principal_paid", { precision: 15, scale: 2 }),
  interestPaid: decimal("interest_paid", { precision: 15, scale: 2 }),
  paymentDate: date("payment_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Net Worth Snapshots - for trend tracking
export const networthSnapshots = pgTable("networth_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  snapshotDate: date("snapshot_date").notNull(),
  totalAssets: decimal("total_assets", { precision: 15, scale: 2 }).notNull(),
  totalLiabilities: decimal("total_liabilities", { precision: 15, scale: 2 }).notNull(),
  netWorth: decimal("net_worth", { precision: 15, scale: 2 }).notNull(),
  breakdown: text("breakdown"), // JSON string for detailed breakdown
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Recurring Bills table
export const recurringBills = pgTable("recurring_bills", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "set null" }),
  subCategoryId: uuid("sub_category_id")
    .references(() => subCategories.id, { onDelete: "set null" }),
  accountId: uuid("account_id")
    .references(() => accounts.id, { onDelete: "set null" }),
  dueDay: integer("due_day").notNull(), // 1-31
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bill Payments table - tracks monthly payment status
export const billPayments = pgTable("bill_payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  billId: uuid("bill_id")
    .references(() => recurringBills.id, { onDelete: "cascade" })
    .notNull(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  isPaid: boolean("is_paid").default(false),
  paidDate: date("paid_date"),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }),
  accountId: uuid("account_id")
    .references(() => accounts.id, { onDelete: "set null" }),
  transactionId: uuid("transaction_id")
    .references(() => transactions.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  categories: many(categories),
  subCategories: many(subCategories),
  tags: many(tags),
  transactions: many(transactions),
  budgetGoals: many(budgetGoals),
  assets: many(assets),
  liabilities: many(liabilities),
  networthSnapshots: many(networthSnapshots),
  recurringBills: many(recurringBills),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  subCategories: many(subCategories),
  transactions: many(transactions),
  recurringBills: many(recurringBills),
}));

export const subCategoriesRelations = relations(subCategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subCategories.categoryId],
    references: [categories.id],
  }),
  user: one(users, {
    fields: [subCategories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  recurringBills: many(recurringBills),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
  transactionTags: many(transactionTags),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  subCategory: one(subCategories, {
    fields: [transactions.subCategoryId],
    references: [subCategories.id],
  }),
  transactionTags: many(transactionTags),
}));

export const transactionTagsRelations = relations(transactionTags, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionTags.transactionId],
    references: [transactions.id],
  }),
  tag: one(tags, {
    fields: [transactionTags.tagId],
    references: [tags.id],
  }),
}));

export const budgetGoalsRelations = relations(budgetGoals, ({ one }) => ({
  user: one(users, {
    fields: [budgetGoals.userId],
    references: [users.id],
  }),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  user: one(users, {
    fields: [assets.userId],
    references: [users.id],
  }),
  valuations: many(assetValuations),
}));

export const assetValuationsRelations = relations(assetValuations, ({ one }) => ({
  asset: one(assets, {
    fields: [assetValuations.assetId],
    references: [assets.id],
  }),
}));

export const liabilitiesRelations = relations(liabilities, ({ one, many }) => ({
  user: one(users, {
    fields: [liabilities.userId],
    references: [users.id],
  }),
  payments: many(liabilityPayments),
}));

export const liabilityPaymentsRelations = relations(liabilityPayments, ({ one }) => ({
  liability: one(liabilities, {
    fields: [liabilityPayments.liabilityId],
    references: [liabilities.id],
  }),
}));

export const networthSnapshotsRelations = relations(networthSnapshots, ({ one }) => ({
  user: one(users, {
    fields: [networthSnapshots.userId],
    references: [users.id],
  }),
}));

export const recurringBillsRelations = relations(recurringBills, ({ one, many }) => ({
  user: one(users, {
    fields: [recurringBills.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [recurringBills.categoryId],
    references: [categories.id],
  }),
  subCategory: one(subCategories, {
    fields: [recurringBills.subCategoryId],
    references: [subCategories.id],
  }),
  account: one(accounts, {
    fields: [recurringBills.accountId],
    references: [accounts.id],
  }),
  payments: many(billPayments),
}));

export const billPaymentsRelations = relations(billPayments, ({ one }) => ({
  bill: one(recurringBills, {
    fields: [billPayments.billId],
    references: [recurringBills.id],
  }),
  account: one(accounts, {
    fields: [billPayments.accountId],
    references: [accounts.id],
  }),
  transaction: one(transactions, {
    fields: [billPayments.transactionId],
    references: [transactions.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type SubCategory = typeof subCategories.$inferSelect;
export type NewSubCategory = typeof subCategories.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type TransactionTag = typeof transactionTags.$inferSelect;
export type NewTransactionTag = typeof transactionTags.$inferInsert;

export type BudgetGoal = typeof budgetGoals.$inferSelect;
export type NewBudgetGoal = typeof budgetGoals.$inferInsert;

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;

export type AssetValuation = typeof assetValuations.$inferSelect;
export type NewAssetValuation = typeof assetValuations.$inferInsert;

export type Liability = typeof liabilities.$inferSelect;
export type NewLiability = typeof liabilities.$inferInsert;

export type LiabilityPayment = typeof liabilityPayments.$inferSelect;
export type NewLiabilityPayment = typeof liabilityPayments.$inferInsert;

export type NetworthSnapshot = typeof networthSnapshots.$inferSelect;
export type NewNetworthSnapshot = typeof networthSnapshots.$inferInsert;

export type RecurringBill = typeof recurringBills.$inferSelect;
export type NewRecurringBill = typeof recurringBills.$inferInsert;

export type BillPayment = typeof billPayments.$inferSelect;
export type NewBillPayment = typeof billPayments.$inferInsert;

export type AccountType = (typeof accountTypeEnum.enumValues)[number];
export type TransactionType = (typeof transactionTypeEnum.enumValues)[number];
export type AssetType = (typeof assetTypeEnum.enumValues)[number];
export type AssetSubtype = (typeof assetSubtypeEnum.enumValues)[number];
export type LiabilityType = (typeof liabilityTypeEnum.enumValues)[number];

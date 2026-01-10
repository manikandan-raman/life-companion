import type {
  User,
  Account,
  Category,
  SubCategory,
  Tag,
  Transaction,
  BudgetGoal,
  AccountType,
  TransactionType,
  Asset,
  AssetValuation,
  Liability,
  LiabilityPayment,
  NetworthSnapshot,
  AssetType,
  AssetSubtype,
  LiabilityType,
  RecurringBill,
  BillPayment,
  MonthlyBudget,
  BudgetItem,
  BudgetItemType,
} from "@/db/schema";

// Re-export database types
export type {
  User,
  Account,
  Category,
  SubCategory,
  Tag,
  Transaction,
  BudgetGoal,
  AccountType,
  TransactionType,
  Asset,
  AssetValuation,
  Liability,
  LiabilityPayment,
  NetworthSnapshot,
  AssetType,
  AssetSubtype,
  LiabilityType,
  RecurringBill,
  BillPayment,
  MonthlyBudget,
  BudgetItem,
  BudgetItemType,
};

// Category with nested sub-categories
export interface CategoryWithSubCategories extends Category {
  subCategories: SubCategory[];
}

// Extended types with relations
export interface TransactionWithRelations extends Transaction {
  account: Account | null;
  category: Category | null;
  subCategory: SubCategory | null;
  tags: Tag[];
}

// Account with calculated balance from the database view
export interface AccountWithBalance extends Account {
  currentBalance: string; // Decimal from DB view
}

// Helper type for the API response (from account_with_balances view)
export interface AccountFromView {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: string;
  color: string | null;
  icon: string | null;
  isDefault: boolean | null;
  isArchived: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  currentBalance: string; // Calculated from transactions
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

// Finance Summary types
export interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byType: TypeSummary[];
}

export interface TypeSummary {
  type: TransactionType;
  total: number;
  goal: number;
  percentage: number;
}

// Form types
export interface TransactionFormData {
  type: TransactionType;
  amount: number;
  description?: string;
  notes?: string;
  categoryId: string;
  subCategoryId?: string;
  accountId?: string;
  transactionDate: Date;
  tagIds?: string[];
}

export interface AccountFormData {
  name: string;
  type: AccountType;
  balance?: number;
  color?: string;
  icon?: string;
  isDefault?: boolean;
}

export interface CategoryFormData {
  name: string;
  icon?: string;
}

export interface SubCategoryFormData {
  categoryId: string;
  name: string;
  icon?: string;
}

export interface TagFormData {
  name: string;
  color?: string;
}

export interface BudgetGoalFormData {
  month: number;
  year: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
}

// Filter types
export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  subCategoryId?: string;
  type?: TransactionType;
  accountId?: string;
  tagIds?: string[];
  search?: string;
}

// Asset types with relations
export interface AssetWithValuations extends Asset {
  valuations: AssetValuation[];
}

export interface AssetFormData {
  name: string;
  type: AssetType;
  subtype: AssetSubtype;
  currentValue: number;
  purchaseValue: number;
  purchaseDate?: Date;
  maturityDate?: Date;
  interestRate?: number;
  notes?: string;
  color?: string;
}

// Liability types with relations
export interface LiabilityWithPayments extends Liability {
  payments: LiabilityPayment[];
}

export interface LiabilityFormData {
  name: string;
  type: LiabilityType;
  principalAmount: number;
  outstandingBalance: number;
  interestRate: number;
  emiAmount?: number;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  color?: string;
}

// Net Worth types
export interface NetWorthBreakdown {
  bankAccounts: number;
  cash: number;
  investments: number;
  fixedDeposits: number;
  retirement: number;
  creditCards: number;
  loans: number;
}

export interface NetWorthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  breakdown: NetWorthBreakdown;
  assetsByType: Array<{ type: string; value: number }>;
  liabilitiesByType: Array<{ type: string; value: number }>;
}

export interface NetWorthHistory {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

// Bill types with relations
export interface RecurringBillWithRelations extends RecurringBill {
  category: Category | null;
  subCategory: SubCategory | null;
  account: Account | null;
  payments: BillPayment[];
}

export interface BillPaymentWithRelations extends BillPayment {
  bill: RecurringBill;
  account: Account | null;
  transaction: Transaction | null;
}

// Bill form data types
export interface RecurringBillFormData {
  name: string;
  amount: number;
  categoryId?: string;
  subCategoryId?: string;
  accountId?: string;
  dueDay: number;
  notes?: string;
}

export interface BillPaymentFormData {
  paidDate: Date;
  paidAmount: number;
  accountId: string;
}

// Bill status type
export type BillStatus = "paid" | "overdue" | "due_today" | "upcoming" | "pending";

// Budget types with relations
export interface BudgetItemWithRelations extends BudgetItem {
  category: Category | null;
  account: Account | null;
  transaction: Transaction | null;
}

export interface MonthlyBudgetWithRelations extends MonthlyBudget {
  items: BudgetItemWithRelations[];
}

// Budget item status type
export type BudgetItemStatus = "paid" | "unpaid" | "overdue" | "due_today" | "upcoming";

// Budget summary for a month
export interface BudgetSummary {
  month: number;
  year: number;
  totalBudgeted: number;
  totalSpent: number;
  remaining: number;
  limits: {
    total: number;
    count: number;
  };
  payments: {
    total: number;
    paid: number;
    unpaid: number;
    overdue: number;
    paidAmount: number;
    unpaidAmount: number;
  };
}

// Budget item form data
export interface BudgetItemFormData {
  itemType: BudgetItemType;
  categoryId?: string | null;
  name: string;
  amount: number;
  dueDay?: number | null;
  isRecurring?: boolean;
  accountId?: string | null;
  notes?: string | null;
}

// Budget item payment form data
export interface BudgetItemPaymentFormData {
  type: "needs" | "wants" | "savings" | "investments";
  paidDate: Date;
  paidAmount: number;
  accountId: string;
}

// Transaction type labels for UI
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "Income",
  needs: "Needs",
  wants: "Wants",
  savings: "Savings",
  investments: "Investments",
};

// Budget item type labels for UI
export const BUDGET_ITEM_TYPE_LABELS: Record<BudgetItemType, string> = {
  limit: "Spending Limit",
  payment: "Payment",
};

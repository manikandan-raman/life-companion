import type {
  User,
  Account,
  Category,
  Tag,
  Transaction,
  BudgetGoal,
  AccountType,
  CategoryType,
  Asset,
  AssetValuation,
  Liability,
  LiabilityPayment,
  NetworthSnapshot,
  AssetType,
  AssetSubtype,
  LiabilityType,
} from "@/db/schema";

// Re-export database types
export type {
  User,
  Account,
  Category,
  Tag,
  Transaction,
  BudgetGoal,
  AccountType,
  CategoryType,
  Asset,
  AssetValuation,
  Liability,
  LiabilityPayment,
  NetworthSnapshot,
  AssetType,
  AssetSubtype,
  LiabilityType,
};

// Extended types with relations
export interface TransactionWithRelations extends Transaction {
  account: Account | null;
  category: Category | null;
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
  byCategory: CategorySummary[];
}

export interface CategorySummary {
  type: CategoryType;
  total: number;
  goal: number;
  percentage: number;
}

// Form types
export interface TransactionFormData {
  amount: number;
  description: string;
  notes?: string;
  categoryId: string;
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
  type: CategoryType;
  color?: string;
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
  categoryType?: CategoryType;
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


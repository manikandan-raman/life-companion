import type { GroupedTransaction } from "@/hooks/use-transactions";
import type { TransactionWithRelations, TransactionType } from "@/types";

/**
 * Convert a server-grouped transaction (lightweight shape returned by the
 * grouped/summary endpoints) into the full `TransactionWithRelations` shape
 * expected by `TransactionCard`.
 */
export function mapToTransactionWithRelations(
  t: GroupedTransaction,
): TransactionWithRelations {
  return {
    id: t.id,
    userId: "",
    type: t.type as TransactionType,
    amount: t.amount,
    description: t.description,
    notes: t.notes,
    transactionDate: t.transactionDate,
    categoryId: t.category?.id || null,
    subCategoryId: t.subCategory?.id || null,
    accountId: t.account?.id || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: t.category
      ? {
          id: t.category.id,
          userId: "",
          name: t.category.name,
          icon: t.category.icon,
          sortOrder: null,
          isSystem: null,
          isArchived: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      : null,
    subCategory: t.subCategory
      ? {
          id: t.subCategory.id,
          categoryId: t.category?.id || "",
          userId: "",
          name: t.subCategory.name,
          icon: t.subCategory.icon,
          sortOrder: null,
          isSystem: null,
          isArchived: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      : null,
    account: t.account
      ? {
          id: t.account.id,
          userId: "",
          name: t.account.name,
          type: t.account.type as "bank" | "cash" | "credit_card",
          balance: "0",
          color: t.account.color,
          icon: null,
          isDefault: null,
          isArchived: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      : null,
    tags: t.tags.map((tag) => ({
      id: tag.id,
      userId: "",
      name: tag.name,
      color: tag.color,
      createdAt: new Date(),
    })),
  };
}

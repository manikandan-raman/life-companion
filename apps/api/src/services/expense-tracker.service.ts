import db from "@/config/db";
import * as HttpStatusCodes from "@/errors/http-status-codes";
import { HTTPException } from "hono/http-exception";

export const getAllExpenseTrackers = async (userId: string) => {
  const expenseTrackers = await db.expenseTracker.findMany({
    where: {
      userId,
    },
  });
  return expenseTrackers;
};

export const getExpenseTrackerByUserIdAndExpenseId = async (userId: string, expenseId: string) => {
  const expenseTracker = await db.expenseTracker.findUnique({
    where: {
      id: expenseId,
      userId,
    },
  });
  if (!expenseTracker) {
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: "Expense tracker not found" });
  }
  return expenseTracker;
}; 
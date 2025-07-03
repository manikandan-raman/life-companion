import { AppRouteHandler } from "@/lib/types";
import { CreateExpenseTrackerRoute, DeleteExpenseTrackerRoute, GetExpenseTrackerByIdRoute, GetExpenseTrackersRoute, UpdateExpenseTrackerRoute } from "@/routes/expense-tracker/expense-tracker.routes";
import db from "@/config/db";
import * as HttpStatusCodes from "@/errors/http-status-codes";
import { getAllExpenseTrackers, getExpenseTrackerByUserIdAndExpenseId } from "@/services/expense-tracker.service";

export const createExpenseTracker: AppRouteHandler<CreateExpenseTrackerRoute> = async (c) => {
  const { userId } = c.req.valid("param");
  const payload = c.req.valid("json");
  console.log({payload});
  const expenseTracker = await db.expenseTracker.create({
    data: {
      ...payload,
      userId,
      tags: payload.tags || [],
    },
  });
  return c.json(expenseTracker, HttpStatusCodes.CREATED);
};

export const getExpenseTrackers: AppRouteHandler<GetExpenseTrackersRoute> = async (c) => {
  const { userId } = c.req.valid("param");
  const expenseTrackers = await getAllExpenseTrackers(userId);
  return c.json(expenseTrackers, HttpStatusCodes.OK);
};

export const getExpenseTrackerById: AppRouteHandler<GetExpenseTrackerByIdRoute> = async (c) => {
  const { userId, expenseId } = c.req.valid("param");
  const expenseTracker = await getExpenseTrackerByUserIdAndExpenseId(userId, expenseId);
  return c.json(expenseTracker, HttpStatusCodes.OK);
};

export const updateExpenseTracker: AppRouteHandler<UpdateExpenseTrackerRoute> = async (c) => {
  const { userId, expenseId } = c.req.valid("param");
  const payload = c.req.valid("json");
  await getExpenseTrackerByUserIdAndExpenseId(userId, expenseId);
  const expenseTracker = await db.expenseTracker.update({
    where: {
      id: expenseId,
      userId,
    },
    data: {
      ...payload,
      tags: payload.tags || [],
    },
  });
  return c.json(expenseTracker, HttpStatusCodes.OK);
};

export const deleteExpenseTracker: AppRouteHandler<DeleteExpenseTrackerRoute> = async (c) => {
  const { userId, expenseId } = c.req.valid("param");
  await getExpenseTrackerByUserIdAndExpenseId(userId, expenseId);
  await db.expenseTracker.delete({
    where: {
      id: expenseId,
      userId,
    },
  });
  return c.json({ message: "Expense tracker deleted successfully" }, HttpStatusCodes.OK);
}; 
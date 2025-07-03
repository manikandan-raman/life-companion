import { createRouter } from "../../lib/create-app";
import * as routes from "@/routes/expense-tracker/expense-tracker.routes";
import * as handlers from "@/routes/expense-tracker/expense-tracker.handler";

const router = createRouter()
  .openapi(routes.createExpenseTracker, handlers.createExpenseTracker)
  .openapi(routes.getExpenseTrackers, handlers.getExpenseTrackers)
  .openapi(routes.getExpenseTrackerById, handlers.getExpenseTrackerById)
  .openapi(routes.updateExpenseTracker, handlers.updateExpenseTracker)
  .openapi(routes.deleteExpenseTracker, handlers.deleteExpenseTracker);

export default router; 
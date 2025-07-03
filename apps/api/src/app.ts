import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import { errorHandler } from "@/middlewares/error-handler";
import auth from "@/routes/auth/auth.index";
import expenseTracker from "@/routes/expense-tracker/expense-tracker.index";
import index from "@/routes/index.route";
import journal from "@/routes/journal/journal.index";
import todo from "@/routes/todo/todo.index";
import user from "@/routes/user/user.index";

import { jwtMiddleware } from "./middlewares/jwt";

const app = createApp();

configureOpenAPI(app);

app.use("/users/*", jwtMiddleware);

app.route("/", index);
app.route("/auth", auth);
app.route("users", user);
app.route("users/:userId/journals", journal);
app.route("users/:userId/expense-trackers", expenseTracker);
app.route("users/:userId/todos", todo);

app.onError(errorHandler);

export default app;

import * as handlers from "@/routes/todo/todo.handler";
import * as routes from "@/routes/todo/todo.routes";

import { createRouter } from "../../lib/create-app";

const router = createRouter()
  .openapi(routes.createTodo, handlers.createTodo)
  .openapi(routes.getTodos, handlers.getTodos)
  .openapi(routes.getTodoById, handlers.getTodoById)
  .openapi(routes.updateTodo, handlers.updateTodo)
  .openapi(routes.deleteTodo, handlers.deleteTodo);

export default router;

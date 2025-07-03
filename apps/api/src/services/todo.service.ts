import { HTTPException } from "hono/http-exception";

import db from "@/config/db";
import * as HttpStatusCodes from "@/errors/http-status-codes";

export async function getAllTodos(userId: string) {
  const todos = await db.todo.findMany({
    where: {
      userId,
    },
    include: {
      status: true,
    },
  });
  return todos;
}

export async function getTodoByUserIdAndTodoId(userId: string, todoId: string) {
  const todo = await db.todo.findUnique({
    where: {
      id: todoId,
      userId,
    },
    include: {
      status: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  if (!todo) {
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: "Todo not found" });
  }
  return todo;
}

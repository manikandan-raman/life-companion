import type { AppRouteHandler } from "@/lib/types";
import type { CreateTodoRoute, DeleteTodoRoute, GetTodoByIdRoute, GetTodosRoute, UpdateTodoRoute } from "@/routes/todo/todo.routes";

import db from "@/config/db";
import * as HttpStatusCodes from "@/errors/http-status-codes";
import { getAllTodos, getTodoByUserIdAndTodoId } from "@/services/todo.service";

export const createTodo: AppRouteHandler<CreateTodoRoute> = async (c) => {
  const { userId } = c.req.valid("param");
  const payload = c.req.valid("json");
  console.log({ payload });
  const todo = await db.todo.create({
    data: {
      ...payload,
      userId,
    },
    include: {
      status: true,
    },
  });
  return c.json(todo, HttpStatusCodes.CREATED);
};

export const getTodos: AppRouteHandler<GetTodosRoute> = async (c) => {
  const { userId } = c.req.valid("param");
  const todos = await getAllTodos(userId);
  return c.json(todos, HttpStatusCodes.OK);
};

export const getTodoById: AppRouteHandler<GetTodoByIdRoute> = async (c) => {
  const { userId, todoId } = c.req.valid("param");
  const todo = await getTodoByUserIdAndTodoId(userId, todoId);
  return c.json(todo, HttpStatusCodes.OK);
};

export const updateTodo: AppRouteHandler<UpdateTodoRoute> = async (c) => {
  const { userId, todoId } = c.req.valid("param");
  const payload = c.req.valid("json");
  await getTodoByUserIdAndTodoId(userId, todoId);
  const todo = await db.todo.update({
    where: {
      id: todoId,
      userId,
    },
    data: payload,
    include: {
      status: true,
    },
  });
  return c.json(todo, HttpStatusCodes.OK);
};

export const deleteTodo: AppRouteHandler<DeleteTodoRoute> = async (c) => {
  const { userId, todoId } = c.req.valid("param");
  await getTodoByUserIdAndTodoId(userId, todoId);
  await db.todo.delete({
    where: {
      id: todoId,
      userId,
    },
  });
  return c.json({ message: "Todo deleted successfully" }, HttpStatusCodes.OK);
};

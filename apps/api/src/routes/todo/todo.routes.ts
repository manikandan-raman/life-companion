import { createRoute, z } from "@hono/zod-openapi";

import { badRequestSchema, internalServerErrorSchema, unauthorizedSchema } from "@/errors/error-message-schemas";
import * as HttpStatusCodes from "@/errors/http-status-codes";

import { createTodoSchema, todoSchema } from "../../../../../packages/shared/src/schemas";
import jsonContent from "../../openapi/helpers/json-content";
import jsonContentRequired from "../../openapi/helpers/json-content-required";
import { successMessageSchema } from "../../openapi/schemas/create-messge-object";
import getParamsSchema from "../../openapi/schemas/get-params-schema";

const tags = ["Todo"];

const paramsSchema = getParamsSchema({ name: "userId", validator: "uuid" });

const paramsSchemaWithId = getParamsSchema({ name: "userId", validator: "uuid" })
  .merge(getParamsSchema({ name: "todoId", validator: "uuid" }));

export const createTodo = createRoute({
  method: "post",
  path: "",
  tags,
  summary: "Create a todo",
  description: "Create a todo",
  request: {
    params: paramsSchema,
    body: jsonContentRequired(createTodoSchema, "Create Todo Request"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(todoSchema, "Create Todo Response"),
    [HttpStatusCodes.BAD_REQUEST]: badRequestSchema,
    [HttpStatusCodes.UNAUTHORIZED]: unauthorizedSchema,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: internalServerErrorSchema,
  },
});

export const getTodos = createRoute({
  method: "get",
  path: "",
  tags,
  summary: "Get todos",
  description: "Get todos",
  request: {
    params: paramsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.array(todoSchema), "Get Todos Response"),
    [HttpStatusCodes.BAD_REQUEST]: badRequestSchema,
    [HttpStatusCodes.UNAUTHORIZED]: unauthorizedSchema,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: internalServerErrorSchema,
  },
});

export const getTodoById = createRoute({
  method: "get",
  path: "/{todoId}",
  tags,
  summary: "Get a todo by ID",
  description: "Get a todo by ID",
  request: {
    params: paramsSchemaWithId,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(todoSchema, "Get Todo By ID Response"),
    [HttpStatusCodes.BAD_REQUEST]: badRequestSchema,
    [HttpStatusCodes.UNAUTHORIZED]: unauthorizedSchema,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: internalServerErrorSchema,
  },
});

export const updateTodo = createRoute({
  method: "patch",
  path: "{todoId}",
  tags,
  summary: "Update a todo",
  description: "Update a todo",
  request: {
    params: paramsSchemaWithId,
    body: jsonContent(createTodoSchema, "Update Todo Request"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(todoSchema, "Update Todo Response"),
  },
});

export const deleteTodo = createRoute({
  method: "delete",
  path: "{todoId}",
  tags,
  summary: "Delete a todo",
  description: "Delete a todo",
  request: {
    params: paramsSchemaWithId,
  },
  responses: {
    [HttpStatusCodes.OK]: successMessageSchema,
    [HttpStatusCodes.BAD_REQUEST]: badRequestSchema,
    [HttpStatusCodes.UNAUTHORIZED]: unauthorizedSchema,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: internalServerErrorSchema,
  },
});

export type CreateTodoRoute = typeof createTodo;
export type GetTodosRoute = typeof getTodos;
export type GetTodoByIdRoute = typeof getTodoById;
export type UpdateTodoRoute = typeof updateTodo;
export type DeleteTodoRoute = typeof deleteTodo;

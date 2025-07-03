import { createRoute, z } from "@hono/zod-openapi";

import { badRequestSchema, internalServerErrorSchema, unauthorizedSchema } from "@/errors/error-message-schemas";
import * as HttpStatusCodes from "@/errors/http-status-codes";

import { createUserSchema, userSchema } from "../../../../../packages/shared/src/schemas";
import jsonContent from "../../openapi/helpers/json-content";
import { successMessageSchema } from "../../openapi/schemas/create-messge-object";
import getParamsSchema from "../../openapi/schemas/get-params-schema";

const tags = ["User"];

const paramsSchema = getParamsSchema({ name: "userId", validator: "uuid" });

// Create a user response schema without password
const userResponseSchema = userSchema.omit({ password: true });

export const getUsers = createRoute({
  method: "get",
  path: "",
  tags,
  summary: "Get all users",
  description: "Get all users",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.array(userResponseSchema), "Get Users Response"),
    [HttpStatusCodes.BAD_REQUEST]: badRequestSchema,
    [HttpStatusCodes.UNAUTHORIZED]: unauthorizedSchema,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: internalServerErrorSchema,
  },
});

export const getUserById = createRoute({
  method: "get",
  path: "/{userId}",
  tags,
  summary: "Get a user by ID",
  description: "Get a user by ID",
  request: {
    params: paramsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(userResponseSchema, "Get User By ID Response"),
    [HttpStatusCodes.BAD_REQUEST]: badRequestSchema,
    [HttpStatusCodes.UNAUTHORIZED]: unauthorizedSchema,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: internalServerErrorSchema,
  },
});

export const updateUserById = createRoute({
  method: "patch",
  path: "/{userId}",
  tags,
  summary: "Update a user by ID",
  description: "Update a user by ID",
  request: {
    params: paramsSchema,
    body: jsonContent(createUserSchema, "Update User Request"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(userResponseSchema, "Update User Response"),
  },
});

export const deleteUserById = createRoute({
  method: "delete",
  path: "/{userId}",
  tags,
  summary: "Delete a user by ID",
  description: "Delete a user by ID",
  request: {
    params: paramsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: successMessageSchema,
    [HttpStatusCodes.BAD_REQUEST]: badRequestSchema,
    [HttpStatusCodes.UNAUTHORIZED]: unauthorizedSchema,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: internalServerErrorSchema,
  },
});

export type GetUsersRoute = typeof getUsers;
export type GetUserByIdRoute = typeof getUserById;
export type UpdateUserByIdRoute = typeof updateUserById;
export type DeleteUserByIdRoute = typeof deleteUserById;

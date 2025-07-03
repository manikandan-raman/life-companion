import { createRoute, z } from "@hono/zod-openapi";
import { createExpenseTrackerSchema, expenseTrackerSchema } from "../../../../../packages/shared/src/schemas";
import jsonContent from "../../openapi/helpers/json-content";
import * as HttpStatusCodes from "@/errors/http-status-codes";
import { badRequestSchema, internalServerErrorSchema, unauthorizedSchema } from "@/errors/error-message-schemas";
import jsonContentRequired from "../../openapi/helpers/json-content-required";
import getParamsSchema from "../../openapi/schemas/get-params-schema";
import { successMessageSchema } from "../../openapi/schemas/create-messge-object";

const tags = ["Expense Tracker"];

const paramsSchema = getParamsSchema({ name: "userId", validator: "uuid" });

const paramsSchemaWithId = getParamsSchema({ name: "userId", validator: "uuid" })
.merge(getParamsSchema({ name: "expenseId", validator: "uuid" }));

export const createExpenseTracker = createRoute({
  method: "post",
  path: "",
  tags,
  summary: "Create an expense tracker",
  description: "Create an expense tracker",
  request: {
    params: paramsSchema,
    body: jsonContentRequired(createExpenseTrackerSchema, "Create Expense Tracker Request"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(expenseTrackerSchema, "Create Expense Tracker Response"),
    [HttpStatusCodes.BAD_REQUEST]: badRequestSchema,
    [HttpStatusCodes.UNAUTHORIZED]: unauthorizedSchema,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: internalServerErrorSchema,
  },
});

export const getExpenseTrackers = createRoute({
  method: "get",
  path: "",
  tags,
  summary: "Get expense trackers",
  description: "Get expense trackers",
  request: {
    params: paramsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.array(expenseTrackerSchema), "Get Expense Trackers Response"),
    [HttpStatusCodes.BAD_REQUEST]: badRequestSchema,
    [HttpStatusCodes.UNAUTHORIZED]: unauthorizedSchema,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: internalServerErrorSchema,
  },
});

export const getExpenseTrackerById = createRoute({
  method: "get",
  path: "/{expenseId}",
  tags,
  summary: "Get an expense tracker by ID",
  description: "Get an expense tracker by ID",
  request: {
    params: paramsSchemaWithId,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(expenseTrackerSchema, "Get Expense Tracker By ID Response"),
    [HttpStatusCodes.BAD_REQUEST]: badRequestSchema,
    [HttpStatusCodes.UNAUTHORIZED]: unauthorizedSchema,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: internalServerErrorSchema,
  },
});

export const updateExpenseTracker = createRoute({
  method: "patch",
  path: "{expenseId}",
  tags,
  summary: "Update an expense tracker",
  description: "Update an expense tracker",
  request: {
    params: paramsSchemaWithId,
    body: jsonContent(createExpenseTrackerSchema, "Update Expense Tracker Request"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(expenseTrackerSchema, "Update Expense Tracker Response"),
  },
});

export const deleteExpenseTracker = createRoute({
  method: "delete",
  path: "{expenseId}",
  tags,
  summary: "Delete an expense tracker",
  description: "Delete an expense tracker",
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

export type CreateExpenseTrackerRoute = typeof createExpenseTracker;
export type GetExpenseTrackersRoute = typeof getExpenseTrackers;
export type GetExpenseTrackerByIdRoute = typeof getExpenseTrackerById;
export type UpdateExpenseTrackerRoute = typeof updateExpenseTracker;
export type DeleteExpenseTrackerRoute = typeof deleteExpenseTracker; 
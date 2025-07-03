import { createRoute, z } from "@hono/zod-openapi";
import { createJournalSchema, journalSchema } from "../../../../../packages/shared/src/schemas";
import jsonContent from "../../openapi/helpers/json-content";
import * as HttpStatusCodes from "@/errors/http-status-codes";
import { badRequestSchema, internalServerErrorSchema, unauthorizedSchema } from "@/errors/error-message-schemas";
import jsonContentRequired from "../../openapi/helpers/json-content-required";
import getParamsSchema from "../../openapi/schemas/get-params-schema";
import { successMessageSchema } from "../../openapi/schemas/create-messge-object";

const tags = ["Journal"];

const paramsSchema = getParamsSchema({ name: "userId", validator: "uuid" });

const paramsSchemaWithId = getParamsSchema({ name: "userId", validator: "uuid" })
.merge(getParamsSchema({ name: "journalId", validator: "uuid" }));

export const createJournal = createRoute({
  method: "post",
  path: "",
  tags,
  summary: "Create a journal",
  description: "Create a journal",
  request: {
    params: paramsSchema,
    body: jsonContentRequired(createJournalSchema, "Create Journal Request"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(journalSchema, "Create Journal Response"),
    [HttpStatusCodes.BAD_REQUEST]: badRequestSchema,
    [HttpStatusCodes.UNAUTHORIZED]: unauthorizedSchema,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: internalServerErrorSchema,
  },
});

export const getJournal = createRoute({
  method: "get",
  path: "",
  tags,
  summary: "Get a journal",
  description: "Get a journal",
  request: {
    params: paramsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.array(journalSchema), "Get Journal Response"),
    [HttpStatusCodes.BAD_REQUEST]: badRequestSchema,
    [HttpStatusCodes.UNAUTHORIZED]: unauthorizedSchema,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: internalServerErrorSchema,
  },
});

export const getJournalById = createRoute({
  method: "get",
  path: "/{journalId}",
  tags,
  summary: "Get a journal by ID",
  description: "Get a journal by ID",
  request: {
    params: paramsSchemaWithId,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(journalSchema, "Get Journal By ID Response"),
    [HttpStatusCodes.BAD_REQUEST]: badRequestSchema,
    [HttpStatusCodes.UNAUTHORIZED]: unauthorizedSchema,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: internalServerErrorSchema,
  },
});

export const updateJournal = createRoute({
  method: "patch",
  path: "{journalId}",
  tags,
  summary: "Update a journal",
  description: "Update a journal",
  request: {
    params: paramsSchemaWithId,
    body: jsonContent(createJournalSchema, "Update Journal Request"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(journalSchema, "Update Journal Response"),
  },
});

export const deleteJournal = createRoute({
  method: "delete",
  path: "/{journalId}",
  tags,
  summary: "Delete a journal",
  description: "Delete a journal",
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

export type CreateJournalRoute = typeof createJournal;
export type GetJournalsRoute = typeof getJournal;
export type GetJournalByIdRoute = typeof getJournalById;
export type UpdateJournalRoute = typeof updateJournal;
export type DeleteJournalRoute = typeof deleteJournal;
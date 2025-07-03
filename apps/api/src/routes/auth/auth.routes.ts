import { createRoute, z } from "@hono/zod-openapi";

import { badRequestSchema, conflictSchema, internalServerErrorSchema, notFoundSchema } from "@/errors/error-message-schemas";
import * as HttpStatusCodes from "@/errors/http-status-codes";
import jsonContent from "@/openapi/helpers/json-content";

import { createUserSchema, loginSchema, userSchema } from "../../../../../packages/shared/src/schemas";
import jsonContentRequired from "../../openapi/helpers/json-content-required";

const tags = ["Auth"];

export const register = createRoute({
  method: "post",
  path: "/register",
  tags,
  summary: "Register",
  description: "Register a new user",
  request: {
    body: jsonContentRequired(createUserSchema, "Login Request"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(userSchema, "Register Response"),
    [HttpStatusCodes.BAD_REQUEST]: badRequestSchema,
    [HttpStatusCodes.CONFLICT]: conflictSchema,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: internalServerErrorSchema,
  },
});

export const login = createRoute({
  method: "post",
  path: "/login",
  tags,
  summary: "Login",
  description: "Login a user",
  request: {
    body: jsonContentRequired(loginSchema, "Login Request"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(userSchema.extend({ accessToken: z.string() }).omit({ password: true }), "Login Response"),
    [HttpStatusCodes.BAD_REQUEST]: badRequestSchema,
    [HttpStatusCodes.NOT_FOUND]: notFoundSchema,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: internalServerErrorSchema,
  },
});

export type RegisterRoute = typeof register;
export type LoginRoute = typeof login;

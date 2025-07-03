import jsonContent from "../openapi/helpers/json-content";
import createErrorObjectSchema from "../openapi/schemas/create-error-object";
import * as httpStatusCodes from "./http-status-codes";

export const OK = "OK";
export const CREATED = "Created";
export const NO_CONTENT = "No Content";
export const BAD_REQUEST = "Bad Request";
export const UNAUTHORIZED = "Unauthorized";
export const FORBIDDEN = "Forbidden";
export const NOT_FOUND = "Not Found";
export const METHOD_NOT_ALLOWED = "Method Not Allowed";
export const CONFLICT = "Conflict";
export const UNPROCESSABLE_ENTITY = "Unprocessable Entity";
export const INTERNAL_SERVER_ERROR = "Internal Server Error";

export const badRequestSchema = jsonContent(createErrorObjectSchema(BAD_REQUEST), httpStatusCodes.BAD_REQUEST.toString());
export const unauthorizedSchema = jsonContent(createErrorObjectSchema(UNAUTHORIZED), httpStatusCodes.UNAUTHORIZED.toString());
export const forbiddenSchema = jsonContent(createErrorObjectSchema(FORBIDDEN), httpStatusCodes.FORBIDDEN.toString());
export const notFoundSchema = jsonContent(createErrorObjectSchema(NOT_FOUND), httpStatusCodes.NOT_FOUND.toString());
export const methodNotAllowedSchema = jsonContent(createErrorObjectSchema(METHOD_NOT_ALLOWED), httpStatusCodes.METHOD_NOT_ALLOWED.toString());
export const conflictSchema = jsonContent(createErrorObjectSchema(CONFLICT), httpStatusCodes.CONFLICT.toString());
export const unprocessableEntitySchema = jsonContent(createErrorObjectSchema(UNPROCESSABLE_ENTITY), httpStatusCodes.UNPROCESSABLE_ENTITY.toString());
export const internalServerErrorSchema = jsonContent(createErrorObjectSchema(INTERNAL_SERVER_ERROR), httpStatusCodes.INTERNAL_SERVER_ERROR.toString());

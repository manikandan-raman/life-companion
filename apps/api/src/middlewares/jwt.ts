import type { Context, Next } from "hono";

import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";

import env from "@/env";
import * as HttpStatusCodes from "@/errors/http-status-codes";

export async function jwtMiddleware(c: Context, next: Next) {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) {
    throw new HTTPException(HttpStatusCodes.UNAUTHORIZED, { message: "Unauthorized" });
  }
  try {
    const payload = await verify(token, env.JWT_SECRET!);
    c.set("user", payload);
  }
  catch (error: unknown) {
    console.error(error);
    throw new HTTPException(HttpStatusCodes.UNAUTHORIZED, { message: "Invalid token" });
  }

  return next();
}

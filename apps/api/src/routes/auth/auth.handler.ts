import type { AppRouteHandler } from "@/lib/types";
import type { LoginRoute, RegisterRoute } from "@/routes/auth/auth.routes";

import db from "@/config/db";
import * as HttpStatusCodes from "@/errors/http-status-codes";
import { hashPassword, verifyPassword } from "@/utils/hash-password";
import { sign } from "hono/jwt";
import { env } from "process";

export const create: AppRouteHandler<RegisterRoute> = async (c) => {
  const user = c.req.valid("json");
  user.password = await hashPassword(user.password);
  const inserted = await db.user.create({
    data: {
      ...user,
    },
  });
  return c.json(inserted, HttpStatusCodes.CREATED);
};

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const payload = c.req.valid("json");
  const user = await db.user.findUnique({
    where: {
      phone: payload.phone,
    },
  });
  if (!user) {
    return c.json({ error: "User not found" }, HttpStatusCodes.NOT_FOUND);
  }

  const isPasswordValid = await verifyPassword(payload.password, user.password);
  if (!isPasswordValid) {
    return c.json({ error: "Invalid password" }, HttpStatusCodes.BAD_REQUEST);
  }

  const { password, ...userPayload } = user;

  const token = await sign({
      ...userPayload,
      exp: new Date(Date.now() + 1000 * 60 * 60).getTime(),
    },
    env.JWT_SECRET!,
  );
  return c.json({ ...userPayload, accessToken: token }, HttpStatusCodes.OK);
};

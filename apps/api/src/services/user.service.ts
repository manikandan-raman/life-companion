import db from "@/config/db";
import * as HttpStatusCodes from "@/errors/http-status-codes";
import { HTTPException } from "hono/http-exception";

export const getAllUsers = async () => {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return users;
};

export const getUserById = async (userId: string) => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) {
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: "User not found" });
  }
  return user;
}; 
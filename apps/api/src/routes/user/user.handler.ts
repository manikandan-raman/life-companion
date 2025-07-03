import { AppRouteHandler } from "@/lib/types";
import { GetUsersRoute, GetUserByIdRoute, UpdateUserByIdRoute, DeleteUserByIdRoute } from "@/routes/user/user.routes";
import db from "@/config/db";
import * as HttpStatusCodes from "@/errors/http-status-codes";
import { getAllUsers, getUserById } from "@/services/user.service";

export const getUsers: AppRouteHandler<GetUsersRoute> = async (c) => {
  const users = await getAllUsers();
  return c.json(users, HttpStatusCodes.OK);
};

export const getUserByIdHandler: AppRouteHandler<GetUserByIdRoute> = async (c) => {
  const { userId } = c.req.valid("param");
  const user = await getUserById(userId);
  return c.json(user, HttpStatusCodes.OK);
};

export const updateUserById: AppRouteHandler<UpdateUserByIdRoute> = async (c) => {
  const { userId } = c.req.valid("param");
  const payload = c.req.valid("json");
  await getUserById(userId);
  const user = await db.user.update({
    where: {
      id: userId,
    },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return c.json(user, HttpStatusCodes.OK);
};

export const deleteUserById: AppRouteHandler<DeleteUserByIdRoute> = async (c) => {
  const { userId } = c.req.valid("param");
  await getUserById(userId);
  await db.user.delete({
    where: {
      id: userId,
    },
  });
  return c.json({ message: "User deleted successfully" }, HttpStatusCodes.OK);
}; 
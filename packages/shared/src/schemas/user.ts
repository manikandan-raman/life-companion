import { z } from "zod";

export const userSchema = z.object({
  id: z.string({ description: "The user's ID" }),
  name: z.string({ description: "The user's name" }),
  email: z.string({ description: "The user's email" }).email().optional().nullable(),
  phone: z.string({ description: "The user's phone number" }),
  password: z.string({ description: "The user's password" }),
  createdAt: z.string({ description: "The user's creation date" }),
  updatedAt: z.string({ description: "The user's last update date" }),
});

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = userSchema.pick({
  phone: true,
  password: true,
});

export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
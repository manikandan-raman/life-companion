import { z } from "zod";

export const todoStatusSchema = z.object({
  id: z.number({ description: "The todo status's ID" }),
  name: z.string({ description: "The todo status's name" }),
  createdAt: z.string({ description: "The todo status's creation date" }),
  updatedAt: z.string({ description: "The todo status's last update date" }),
});

export const createTodoStatusSchema = todoStatusSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type TodoStatus = z.infer<typeof todoStatusSchema>;
export type CreateTodoStatus = z.infer<typeof createTodoStatusSchema>;
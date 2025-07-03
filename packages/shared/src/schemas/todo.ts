import { z } from "zod";

export const todoSchema = z.object({
  id: z.string({ description: "The todo's ID" }),
  userId: z.string({ description: "The user's ID" }),
  task: z.string({ description: "The todo's task" }),
  notes: z.string({ description: "The todo's notes" }).optional().nullable(),
  remindAt: z.coerce.date({ description: "The todo's remind at date" }),
  statusId: z.number({ description: "The todo status's ID" }),
  createdAt: z.string({ description: "The todo's creation date" }),
  updatedAt: z.string({ description: "The todo's last update date" }),
});

export const createTodoSchema = todoSchema.omit({ id: true, userId: true, createdAt: true, updatedAt: true });

export type Todo = z.infer<typeof todoSchema>;
export type CreateTodo = z.infer<typeof createTodoSchema>;
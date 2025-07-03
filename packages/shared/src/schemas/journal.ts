import { z } from "zod";

export const journalSchema = z.object({
  id: z.string({ description: "The journal's ID" }),
  userId: z.string({ description: "The user's ID" }),
  title: z.string({ description: "The journal's title" }),
  content: z.string({ description: "The journal's content" }),
  date: z.coerce.date({ description: "The journal's date" }),
  createdAt: z.string({ description: "The journal's creation date" }),
  updatedAt: z.string({ description: "The journal's last update date" }),
});

export const createJournalSchema = journalSchema.omit({ id: true, userId: true, createdAt: true, updatedAt: true });

export type Journal = z.infer<typeof journalSchema>;
export type CreateJournal = z.infer<typeof createJournalSchema>;
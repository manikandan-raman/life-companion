import db from "@/config/db";
import * as HttpStatusCodes from "@/errors/http-status-codes";
import { HTTPException } from "hono/http-exception";

export const getAllJournals = async (userId: string) => {
  const journals = await db.dailyJournal.findMany({
    where: {
      userId,
    },
  });
  return journals;
};

export const getJournalByUserIdAndJournalId = async (userId: string, journalId: string) => {
  const journal = await db.dailyJournal.findUnique({
    where: {
      id: journalId,
      userId,
    },
  });
  if (!journal) {
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: "Journal not found" });
  }
  return journal;
};
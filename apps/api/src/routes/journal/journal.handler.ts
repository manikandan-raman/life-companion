import { AppRouteHandler } from "@/lib/types";
import { CreateJournalRoute, DeleteJournalRoute, GetJournalByIdRoute, GetJournalsRoute, UpdateJournalRoute } from "@/routes/journal/journal.routes";
import db from "@/config/db";
import * as HttpStatusCodes from "@/errors/http-status-codes";
import { getAllJournals, getJournalByUserIdAndJournalId } from "@/services/journal.service";

export const createJournal: AppRouteHandler<CreateJournalRoute> = async (c) => {
  const { userId } = c.req.valid("param");
  const payload = c.req.valid("json");
  console.log({payload});
  const journal = await db.dailyJournal.create({
    data: {
      ...payload,
      userId,
    },
  });
  return c.json(journal, HttpStatusCodes.CREATED);
};

export const getJournals: AppRouteHandler<GetJournalsRoute> = async (c) => {
  const { userId } = c.req.valid("param");
  const journals = await getAllJournals(userId);
  return c.json(journals, HttpStatusCodes.OK);
};

export const getJournalById: AppRouteHandler<GetJournalByIdRoute> = async (c) => {
  const { userId, journalId } = c.req.valid("param");
  const journal = await getJournalByUserIdAndJournalId(userId, journalId);
  return c.json(journal, HttpStatusCodes.OK);
};

export const updateJournal: AppRouteHandler<UpdateJournalRoute> = async (c) => {
  const { userId, journalId } = c.req.valid("param");
  const payload = c.req.valid("json");
  await getJournalByUserIdAndJournalId(userId, journalId);
  const journal = await db.dailyJournal.update({
    where: {
      id: journalId,
      userId,
    },
    data: payload,
  });
  return c.json(journal, HttpStatusCodes.OK);
};

export const deleteJournal: AppRouteHandler<DeleteJournalRoute> = async (c) => {
  const { userId, journalId } = c.req.valid("param");
  await getJournalByUserIdAndJournalId(userId, journalId);
  await db.dailyJournal.delete({
    where: {
      id: journalId,
      userId,
    },
  });
  return c.json({ message: "Journal deleted successfully" }, HttpStatusCodes.OK);
};
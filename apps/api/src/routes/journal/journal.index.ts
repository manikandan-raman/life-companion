import { createRouter } from "../../lib/create-app";
import * as routes from "@/routes/journal/journal.routes";
import * as handlers from "@/routes/journal/journal.handler";

const router = createRouter()
  .openapi(routes.createJournal, handlers.createJournal)
  .openapi(routes.getJournal, handlers.getJournals)
  .openapi(routes.getJournalById, handlers.getJournalById)
  .openapi(routes.updateJournal, handlers.updateJournal)
  .openapi(routes.deleteJournal, handlers.deleteJournal);

export default router;

import { createRouter } from "@/lib/create-app";
import * as handlers from "@/routes/auth/auth.handler";
import * as routes from "@/routes/auth/auth.routes";

const router = createRouter()
  .openapi(routes.register, handlers.create)
  .openapi(routes.login, handlers.login);

export default router;

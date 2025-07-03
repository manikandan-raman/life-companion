import { createRouter } from "../../lib/create-app";
import * as routes from "@/routes/user/user.routes";
import * as handlers from "@/routes/user/user.handler";

const router = createRouter()
  .openapi(routes.getUsers, handlers.getUsers)
  .openapi(routes.getUserById, handlers.getUserByIdHandler)
  .openapi(routes.updateUserById, handlers.updateUserById)
  .openapi(routes.deleteUserById, handlers.deleteUserById);

export default router; 
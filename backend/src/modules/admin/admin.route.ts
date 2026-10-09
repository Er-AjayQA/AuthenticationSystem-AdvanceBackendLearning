import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorizedPermissions } from "../../middleware/authorize.middleware.js";
import { Permissions } from "../../common/constants/permissions.js";
import { getUsersController } from "./admin.controller.js";

const router = express.Router();

router
  .route("/all-users")
  .get(
    authMiddleware,
    authorizedPermissions(Permissions.MANAGE_USERS),
    getUsersController,
  );

export default router;

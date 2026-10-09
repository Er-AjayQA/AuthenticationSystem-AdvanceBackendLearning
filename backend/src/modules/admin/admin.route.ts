import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorizedPermissions } from "../../middleware/authorize.middleware.js";
import { Permissions } from "../../common/constants/permissions.js";
import {
  getAllRolesController,
  getRoleByIdController,
  getUsersController,
} from "./admin.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { getRoleByIdSchema } from "./admin.schema.js";

const router = express.Router();

router
  .route("/all-users")
  .get(
    authMiddleware,
    authorizedPermissions(Permissions.MANAGE_USERS),
    getUsersController,
  );

router
  .route("/roles")
  .get(
    authMiddleware,
    authorizedPermissions(Permissions.MANAGE_ROLES),
    getAllRolesController,
  );

router
  .route("/roles/:roleId")
  .get(
    authMiddleware,
    authorizedPermissions(Permissions.MANAGE_ROLES),
    validate(getRoleByIdSchema, "params"),
    getRoleByIdController,
  );

export default router;

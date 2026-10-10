import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorizedPermissions } from "../../middleware/authorize.middleware.js";
import { Permissions } from "../../common/constants/permissions.js";
import {
  assignRolesController,
  createRoleController,
  deleteRoleByIdController,
  getAllRolesController,
  getRoleByIdController,
  getUsersController,
  updateRoleController,
} from "./admin.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  assignRolesBodySchema,
  assignRolesParamsSchema,
  createRoleSchema,
  deleteRolesParamsSchema,
  getRoleByIdSchema,
  updateRoleParamsSchema,
  updateRoleSchema,
} from "./admin.schema.js";

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

router
  .route("/roles")
  .post(
    authMiddleware,
    authorizedPermissions(Permissions.MANAGE_ROLES),
    validate(createRoleSchema),
    createRoleController,
  );

router
  .route("/roles/:roleId")
  .patch(
    authMiddleware,
    authorizedPermissions(Permissions.MANAGE_ROLES),
    validate(updateRoleParamsSchema, "params"),
    validate(updateRoleSchema, "body"),
    updateRoleController,
  );

router
  .route("/roles/:roleId")
  .delete(
    authMiddleware,
    authorizedPermissions(Permissions.MANAGE_ROLES),
    validate(deleteRolesParamsSchema, "params"),
    deleteRoleByIdController,
  );

router
  .route("/users/:userId/roles")
  .post(
    authMiddleware,
    authorizedPermissions(Permissions.MANAGE_USERS),
    validate(assignRolesParamsSchema, "params"),
    validate(assignRolesBodySchema, "body"),
    assignRolesController,
  );

export default router;

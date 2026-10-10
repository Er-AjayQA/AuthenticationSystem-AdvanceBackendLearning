import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorizedPermissions } from "../../middleware/authorize.middleware.js";
import { Permissions } from "../../common/constants/permissions.js";
import {
  assignRolesController,
  createRoleController,
  deleteRoleByIdController,
  getAllRolesController,
  getAllUsersByRoleController,
  getRoleByIdController,
  getUserPermissionsController,
  getUsersController,
  removeUserRoleController,
  updateRoleController,
} from "./admin.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  assignRolesBodySchema,
  assignRolesParamsSchema,
  createRoleSchema,
  deleteRolesParamsSchema,
  getRoleByIdSchema,
  getUsersByRoleParamsSchema,
  getUsersPermissionsParamsSchema,
  removeUserRoleBodySchema,
  removeUserRoleParamsSchema,
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
    authorizedPermissions(Permissions.MANAGE_ROLES),
    validate(assignRolesParamsSchema, "params"),
    validate(assignRolesBodySchema, "body"),
    assignRolesController,
  );

router
  .route("/users/:userId/roles")
  .delete(
    authMiddleware,
    authorizedPermissions(Permissions.MANAGE_ROLES),
    validate(removeUserRoleParamsSchema, "params"),
    validate(removeUserRoleBodySchema, "body"),
    removeUserRoleController,
  );

router
  .route("/users/roles/:roleId")
  .get(
    authMiddleware,
    authorizedPermissions(Permissions.MANAGE_ROLES),
    validate(getUsersByRoleParamsSchema, "params"),
    getAllUsersByRoleController,
  );

router
  .route("/users/:userId/permissions")
  .get(
    authMiddleware,
    authorizedPermissions(Permissions.MANAGE_USERS),
    validate(getUsersPermissionsParamsSchema, "params"),
    getUserPermissionsController,
  );

export default router;

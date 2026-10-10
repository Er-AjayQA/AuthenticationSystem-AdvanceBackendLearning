import express from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { loginUserSchema, registerUserSchema } from "./auth.schema.js";
import {
  getMyPersmissionsController,
  loggedInUserController,
  loginUserController,
  logoutAllDevicesController,
  logoutController,
  refreshTokenController,
  registerUserController,
} from "./auth.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorizedPermissions } from "../../middleware/authorize.middleware.js";
import { Permissions } from "../../common/constants/permissions.js";
const router = express.Router();

router
  .route("/register-user")
  .post(
    authMiddleware,
    authorizedPermissions(Permissions.MANAGE_USERS),
    validate(registerUserSchema),
    registerUserController,
  );

router
  .route("/login-user")
  .post(validate(loginUserSchema), loginUserController);

router.route("/me").get(authMiddleware, loggedInUserController);

router
  .route("/me/permissions")
  .get(authMiddleware, getMyPersmissionsController);

router.route("/refresh-token").post(refreshTokenController);

router.route("/logout").post(authMiddleware, logoutController);

router
  .route("/logout-all-devices")
  .post(authMiddleware, logoutAllDevicesController);

export default router;

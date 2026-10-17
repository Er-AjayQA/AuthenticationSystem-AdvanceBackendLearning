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
import { loginRateLimitter } from "../../middleware/rate-limit/login-rate-limit.middleware.js";
import { registerRateLimiiter } from "../../middleware/rate-limit/register-rate-limit.middleware.js";
import { refreshTokenRateLimitter } from "../../middleware/rate-limit/refresh-token-rate-limit.middleware.js";
const router = express.Router();

router
  .route("/register-user")
  .post(
    registerRateLimiiter,
    validate(registerUserSchema),
    registerUserController,
  );

router
  .route("/login-user")
  .post(loginRateLimitter, validate(loginUserSchema), loginUserController);

router.route("/me").get(authMiddleware, loggedInUserController);

router
  .route("/me/permissions")
  .get(authMiddleware, getMyPersmissionsController);

router
  .route("/refresh-token")
  .post(refreshTokenRateLimitter, refreshTokenController);

router.route("/logout").post(authMiddleware, logoutController);

router
  .route("/logout-all-devices")
  .post(authMiddleware, logoutAllDevicesController);

export default router;

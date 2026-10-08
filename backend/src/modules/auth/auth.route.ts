import express from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { loginUserSchema, registerUserSchema } from "./auth.schema.js";
import {
  loggedInUserController,
  loginUserController,
  refreshTokenController,
  registerUserController,
} from "./auth.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
const router = express.Router();

router
  .route("/register-user")
  .post(validate(registerUserSchema), registerUserController);

router
  .route("/login-user")
  .post(validate(loginUserSchema), loginUserController);

router.route("/me").get(authMiddleware, loggedInUserController);

router.route("/refresh-token").post(refreshTokenController);

export default router;

import express from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { loginUserSchema, registerUserSchema } from "./auth.schema.js";
import {
  loginUserController,
  registerUserController,
} from "./auth.controller.js";
const router = express.Router();

router
  .route("/register-user")
  .post(validate(registerUserSchema), registerUserController);

router
  .route("/login-user")
  .post(validate(loginUserSchema), loginUserController);

export default router;

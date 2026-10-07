import express from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { registerUserSchema } from "./auth.schema.js";
import { registerUserController } from "./auth.controller.js";
const router = express.Router();

router
  .route("/register-user")
  .post(validate(registerUserSchema), registerUserController);

export default router;

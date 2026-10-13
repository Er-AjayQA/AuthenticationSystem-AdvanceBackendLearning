import express from "express";
import {
  googleCallbackController,
  redirectToGoogleController,
} from "./oauth.controller.js";
const router = express.Router();

router.route("/google").get(redirectToGoogleController);

router.route("/google/callback").get(googleCallbackController);

export default router;

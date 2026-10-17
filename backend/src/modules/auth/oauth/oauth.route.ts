import express from "express";
import {
  googleCallbackController,
  redirectToGoogleController,
} from "./oauth.controller.js";
import { oAuthStartRateLimiiter } from "../../../middleware/rate-limit/google-oauth-start-rate-limit.middleware.js";
import { oAuthCallbackRateLimiiter } from "../../../middleware/rate-limit/google-callback-rate-limit.middleware.js";
const router = express.Router();

router.route("/google").get(oAuthStartRateLimiiter, redirectToGoogleController);

router
  .route("/google/callback")
  .get(oAuthCallbackRateLimiiter, googleCallbackController);

export default router;

import { AppError } from "../../../common/errors/AppError.js";
import { googleClient } from "../../../lib/google.js";
import { generateOAuthState } from "./oauth.helper.js";

export class GoogleOAuthService {
  async generateGoogleAuthUrl() {
    const state = generateOAuthState();

    const url = googleClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      state,
      scope: ["openid", "email", "profile"],
    });

    return { url, state };
  }

  validateOAuthState(cookieState: string, state: string) {
    if (!cookieState || !state || cookieState !== state) {
      throw new AppError("Invalid OAuth state", 401);
    }
  }

  async handleGoogleCallback(code: string) {
    return code;
  }
}

import { AppError } from "../../../common/errors/AppError.js";
import { env } from "../../../config/env.config.js";
import { logger } from "../../../config/logger.js";
import { TurnstileVerificationResponse } from "../auth.types.js";

class CaptchaService {
  async verifyTurnstileToken(token: string, ipAddress?: string): Promise<void> {
    if (!token) {
      throw new AppError("Captcha token is required", 400);
    }

    try {
      const formData = new URLSearchParams();

      formData.append("secret", env.CLOUDFLARE_TURNSTILE_SECRET_KEY);
      formData.append("response", token);

      if (ipAddress) {
        formData.append("remoteip", ipAddress);
      }

      const response = await fetch(
        env.CLOUDFLARE_TURNSTILE_TOKEN_VERIFICATION_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new AppError("Captcha verification failed", 400);
      }

      const result = (await response.json()) as TurnstileVerificationResponse;

      if (!result.success) {
        logger.warn({
          event: "captcha_verification_failed",
          errorCodes: result["error-codes"],
          ipAddress,
          timestamp: new Date().toISOString(),
        });

        throw new AppError("Captcha verification failed", 400);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error({
        event: "captcha_service_error",
        error,
        timestamp: new Date().toISOString(),
      });

      throw new AppError("Captcha verification failed", 400);
    }
  }
}

export const captchaService = new CaptchaService();

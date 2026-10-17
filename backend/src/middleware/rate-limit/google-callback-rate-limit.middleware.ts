import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore, RedisReply } from "rate-limit-redis";
import redis from "../../lib/redis.js";

export const oAuthCallbackRateLimiiter = rateLimit({
  windowMs: 10 * 1000,
  max: 4,

  standardHeaders: true,
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<RedisReply>,
    prefix: "register",
  }),

  handler: (_, res) => {
    return res.status(429).json({
      success: false,
      message:
        "OAuth Callback Ratelimitter Message: Too many requests. Please try again later",
    });
  },

  keyGenerator: (req) => {
    return ipKeyGenerator(req.ip as string);
  },
});

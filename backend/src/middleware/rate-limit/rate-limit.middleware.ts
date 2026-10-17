import rateLimit from "express-rate-limit";
import { RedisReply, RedisStore } from "rate-limit-redis";
import redis from "../../lib/redis.js";

// Global Rate Limitter
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400, // "2" for just testing,

  standardHeaders: true,
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<RedisReply>,
    prefix: "global",
  }),

  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message:
        "Global Ratelimitter Message: Too many requests. Please try again later",
    });
  },
});

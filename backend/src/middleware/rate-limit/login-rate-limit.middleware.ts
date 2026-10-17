import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore, RedisReply } from "rate-limit-redis";
import redis from "../../lib/redis.js";

export const loginRateLimitter = rateLimit({
  windowMs: 10 * 1000, // Testing only
  max: 4, // Testing only

  standardHeaders: true,
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<RedisReply>,
    prefix: "login",
  }),

  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message:
        "Login Ratelimitter Message: Too many requests! Please try again later",
    });
  },

  keyGenerator: (req) => {
    return ipKeyGenerator(req.ip as string);
  },
});

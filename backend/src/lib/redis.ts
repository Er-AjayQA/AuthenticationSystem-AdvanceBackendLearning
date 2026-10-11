import { Redis } from "ioredis";
import { env } from "../config/env.config.js";
import { logger } from "../config/logger.js";

const redis = new Redis({
  host: env.REDIS_URL,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  logger.info("Redis connected successfully");
});

redis.on("error", (error) => {
  logger.error(`Redis failed to connect: ${error}`);
});

export default redis;

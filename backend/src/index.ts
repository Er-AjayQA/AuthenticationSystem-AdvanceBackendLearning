import { app } from "./app.js";
import { env } from "./config/env.config.js";
import { logger } from "./config/logger.js";
import { prisma } from "./lib/prisma.js";

const PORT = env.PORT;

const startServer = () => {
  try {
    return app.listen(PORT, () => {
      logger.info(`Server is running on port: ${PORT}`);
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

const server = startServer();

const gracefullShutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully....`);

  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Database disconnected");
    process.exit(0);
  });
};

process.on("SIGINT", () => gracefullShutdown("SIGINT"));
process.on("SIGTERM", () => gracefullShutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
  logger.error(error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(reason);
  process.exit(1);
});

import { app } from "./app.js";
import { env } from "./config/env.config.js";
import { logger } from "./config/logger.js";

const PORT = env.PORT;

const startServer = () => {
  try {
    app.listen(PORT, () => {
      logger.info(`Server is running on port: ${PORT}`);
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

startServer();

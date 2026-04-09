import "dotenv/config";
import { createApp } from "./app";
import { getAllowedOrigins } from "./config/cors";
import { connectDatabase } from "./config/database";
import { ensureUploadDir } from "./config/upload";
import { seedAdminUser } from "./seed/seedAdmin";
import { logger } from "./utils/logger";

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

async function bootstrap(): Promise<void> {
  if (!MONGODB_URI) {
    logger.error("MONGODB_URI is not set");
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    logger.error("JWT_SECRET is not set");
    process.exit(1);
  }

  if (process.env.NODE_ENV === "production") {
    const origins = getAllowedOrigins();
    if (origins.length === 0) {
      logger.error("CORS_ORIGINS is required in production (comma-separated frontend URLs)");
      process.exit(1);
    }
    logger.info("server_starting", { nodeEnv: "production", port: PORT, corsCount: origins.length });
  }

  ensureUploadDir();
  await connectDatabase(MONGODB_URI);
  logger.info("mongodb_connected");

  await seedAdminUser();

  const app = createApp();
  app.listen(PORT, "0.0.0.0", () => {
    logger.info("http_listening", { port: PORT, host: "0.0.0.0" });
  });
}

bootstrap().catch((err) => {
  logger.error("bootstrap_failed", {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  process.exit(1);
});

import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import path from "path";
import { corsOptions } from "./config/cors";
import { errorHandler } from "./middleware/errorHandler";
import { globalApiLimiter } from "./middleware/rateLimit";
import { requestLogger } from "./middleware/requestLogger";
import { apiRouter } from "./routes";

export function createApp(): Express {
  const app = express();

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(globalApiLimiter);
  app.use(express.json({ limit: "10mb" }));
  app.use(cors(corsOptions()));
  app.use(requestLogger);

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.use("/api", apiRouter);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: "রিসোর্স পাওয়া যায়নি",
      code: "NOT_FOUND",
    });
  });

  app.use(errorHandler);

  return app;
}

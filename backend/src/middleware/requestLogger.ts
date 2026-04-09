import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    logger.info("http_request", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs,
    });
  });
  next();
}

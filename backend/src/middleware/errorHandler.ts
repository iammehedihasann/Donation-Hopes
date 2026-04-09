import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      success: false,
      message: "ফাইল আপলোডে সমস্যা হয়েছে",
      code: "UPLOAD_ERROR",
    });
    return;
  }

  if (err instanceof Error && err.message.includes("শুধু ছবি")) {
    res.status(400).json({
      success: false,
      message: err.message,
      code: "INVALID_FILE_TYPE",
    });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof ZodError) {
    const first = err.issues[0];
    res.status(400).json({
      success: false,
      message: first?.message ?? "ইনপুট সঠিক নয়",
      code: "VALIDATION_ERROR",
      errors: err.flatten(),
    });
    return;
  }

  logger.error("unhandled_error", {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  res.status(500).json({
    success: false,
    message: "সার্ভারে সমস্যা হয়েছে। পরে চেষ্টা করুন।",
    code: "INTERNAL_ERROR",
  });
}

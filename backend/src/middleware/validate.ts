import type { NextFunction, Request, Response } from "express";
import { type z, type ZodTypeAny } from "zod";

export function validateBody<T extends ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message ?? "ইনপুট সঠিক নয়",
        code: "VALIDATION_ERROR",
        errors: parsed.error.flatten(),
      });
      return;
    }
    req.body = parsed.data as z.infer<T>;
    next();
  };
}

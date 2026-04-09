import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt";
import type { UserRole } from "../models/User";
import { AppError } from "../utils/AppError";

function extractBearer(req: Request): string | null {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice(7).trim() || null;
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearer(req);
  if (!token) {
    next();
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.authUser = { id: payload.sub, role: payload.role };
  } catch {
    /* অতিথি হিসেবে চালিয়ে যান */
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearer(req);
  if (!token) {
    next(new AppError("লগইন প্রয়োজন", 401, "UNAUTHORIZED"));
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.authUser = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError("সেশন মেয়াদ শেষ। আবার লগইন করুন।", 401, "INVALID_TOKEN"));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      next(new AppError("লগইন প্রয়োজন", 401, "UNAUTHORIZED"));
      return;
    }
    if (!roles.includes(req.authUser.role as UserRole)) {
      next(new AppError("অনুমতি নেই", 403, "FORBIDDEN"));
      return;
    }
    next();
  };
}

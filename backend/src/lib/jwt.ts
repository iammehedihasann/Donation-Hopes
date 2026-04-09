import jwt from "jsonwebtoken";
import type { UserRole } from "../models/User";

export interface JwtPayload {
  sub: string;
  role: UserRole;
}

export function signAccessToken(userId: string, role: UserRole): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.sign({ sub: userId, role }, secret, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  const decoded = jwt.verify(token, secret) as JwtPayload;
  return decoded;
}

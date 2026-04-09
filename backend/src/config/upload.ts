import fs from "fs";
import path from "path";
import type { Request } from "express";
import multer from "multer";

const uploadRoot = path.join(process.cwd(), "uploads", "screenshots");

export function ensureUploadDir(): void {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  const ok = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
  if (!ok) {
    cb(new Error("শুধু ছবি আপলোড করুন (JPEG, PNG, WebP, GIF)"));
    return;
  }
  cb(null, true);
}

export const screenshotUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export function relativeScreenshotPath(filename: string): string {
  return path.join("screenshots", filename).replace(/\\/g, "/");
}

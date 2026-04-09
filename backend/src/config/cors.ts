import type { CorsOptions } from "cors";

/** ডেভ: খালি হলে localhost:3000। প্রোডাকশনে খালি থাকলে server.ts এ প্রসেস বন্ধ। */
export function getAllowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (!raw?.trim()) {
    if (process.env.NODE_ENV === "production") return [];
    return ["http://localhost:3000"];
  }
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function corsOptions(): CorsOptions {
  const allowed = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowed.length === 0) {
        callback(null, false);
        return;
      }
      if (allowed.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  };
}

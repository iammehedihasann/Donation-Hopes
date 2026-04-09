import rateLimit from "express-rate-limit";

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;

/** সার্বজনীন API — IP প্রতি উইন্ডোতে সর্বোচ্চ রিকোয়েস্ট */
export const globalApiLimiter = rateLimit({
  windowMs,
  max: Number(process.env.RATE_LIMIT_MAX) || (process.env.NODE_ENV === "production" ? 400 : 2000),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    message: "অনেক বেশি অনুরোধ। কিছুক্ষণ পর চেষ্টা করুন।",
    code: "RATE_LIMIT",
  },
});

/** লগইন / নিবন্ধন / OTP — কঠিন সীমা */
export const authRouteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "লগইন চেষ্টার সীমা অতিক্রম। পরে চেষ্টা করুন।",
    code: "AUTH_RATE_LIMIT",
  },
});

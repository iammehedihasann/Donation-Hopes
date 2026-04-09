type Level = "info" | "warn" | "error" | "debug";

function line(level: Level, msg: string, meta?: Record<string, unknown>): void {
  const payload = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...meta,
  };
  const out = JSON.stringify(payload);
  if (level === "error") console.error(out);
  else if (level === "warn") console.warn(out);
  else console.log(out);
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => line("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => line("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => line("error", msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "production") line("debug", msg, meta);
  },
};

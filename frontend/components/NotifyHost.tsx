"use client";

import { cn } from "@/lib/cn";
import { useNotifyStore } from "@/store/notifyStore";
import { CheckCircle2, X } from "lucide-react";

export function NotifyHost() {
  const toasts = useNotifyStore((s) => s.toasts);
  const dismiss = useNotifyStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-4 right-4 z-[100] flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-96"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-md",
            t.type === "success" && "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200",
            t.type === "error" && "bg-red-50 text-red-900 ring-1 ring-red-200"
          )}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
          ) : (
            <span className="mt-0.5 text-lg font-bold text-red-600" aria-hidden>
              !
            </span>
          )}
          <p className="flex-1 text-sm leading-relaxed">{t.message}</p>
          <button
            type="button"
            className="rounded-lg p-1 hover:bg-black/5"
            onClick={() => dismiss(t.id)}
            aria-label="বন্ধ করুন"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useAuthHydrated } from "@/hooks/useAuthHydrated";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Mode = "user" | "admin";

export function AuthGate({ mode, children }: { mode: Mode; children: React.ReactNode }) {
  const hydrated = useAuthHydrated();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!hydrated) return;
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (mode === "admin" && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [hydrated, token, user, mode, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 p-6 text-zinc-600">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-hidden />
        <p>লোড হচ্ছে…</p>
      </div>
    );
  }

  if (!token || !user) return null;
  if (mode === "admin" && user.role !== "ADMIN") return null;

  return <>{children}</>;
}

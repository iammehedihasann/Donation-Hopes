"use client";

import { Button } from "@/components/ui/Button";
import { useAuthHydrated } from "@/hooks/useAuthHydrated";
import { useAuthStore } from "@/store/authStore";
import { Heart, LayoutDashboard, LogIn, LogOut, Shield, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const linkCls =
  "rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-zinc-200 dark:hover:bg-zinc-800";

export function AppHeader() {
  const pathname = usePathname();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  const isAuthed = Boolean(hydrated && token && user);
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/95 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl font-semibold text-emerald-800 dark:text-emerald-400"
        >
          <Heart className="h-6 w-6 fill-emerald-600 text-emerald-600" aria-hidden />
          <span>Hopes</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          <Link href="/campaigns" className={linkCls}>
            ক্যাম্পেইন
          </Link>
          <Link href="/transparency" className={linkCls}>
            স্বচ্ছতা
          </Link>

          {!hydrated ? null : isAuthed ? (
            <>
              {isAdmin ? (
                <Link href="/admin" className={linkCls}>
                  <span className="inline-flex items-center gap-1">
                    <Shield className="h-4 w-4" aria-hidden />
                    অ্যাডমিন
                  </span>
                </Link>
              ) : null}
              {!isAdmin ? (
                <Link href="/dashboard" className={linkCls}>
                  <span className="inline-flex items-center gap-1">
                    <LayoutDashboard className="h-4 w-4" aria-hidden />
                    ড্যাশবোর্ড
                  </span>
                </Link>
              ) : null}
              {!isAdmin ? (
                <Link href="/dashboard/deposit" className={linkCls}>
                  <span className="inline-flex items-center gap-1">
                    <Wallet className="h-4 w-4" aria-hidden />
                    টাকা জমা
                  </span>
                </Link>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="min-h-0 px-3 py-2 text-sm"
                leftIcon={<LogOut className="h-4 w-4" aria-hidden />}
                onClick={() => {
                  logout();
                  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
                    window.location.href = "/login";
                  }
                }}
              >
                লগআউট
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-emerald-700"
            >
              <LogIn className="h-4 w-4" aria-hidden />
              লগইন করুন
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

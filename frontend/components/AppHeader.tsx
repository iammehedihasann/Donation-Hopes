"use client";

import { Button } from "@/components/ui/Button";
import { useAuthHydrated } from "@/hooks/useAuthHydrated";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { Heart, Languages, LayoutDashboard, LogIn, LogOut, Moon, Shield, Sun, User, Wallet } from "lucide-react";
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
  const { t } = useTranslation();
  const language = usePreferencesStore((s) => s.language);
  const toggleLanguage = usePreferencesStore((s) => s.toggleLanguage);
  const theme = usePreferencesStore((s) => s.theme);
  const toggleTheme = usePreferencesStore((s) => s.toggleTheme);

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
          <span>{t("app.name")}</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          <Link href="/campaigns" className={linkCls}>
            {t("nav.campaigns")}
          </Link>
          <Link href="/transparency" className={linkCls}>
            {t("nav.transparency")}
          </Link>

          <button
            type="button"
            className={linkCls}
            onClick={toggleLanguage}
            aria-label={t("nav.language")}
            title={t("nav.language")}
          >
            <span className="inline-flex items-center gap-1">
              <Languages className="h-4 w-4" aria-hidden />
              {language.toUpperCase()}
            </span>
          </button>

          <button
            type="button"
            className={linkCls}
            onClick={toggleTheme}
            aria-label={t("nav.theme")}
            title={t("nav.theme")}
          >
            <span className="inline-flex items-center gap-1">
              {theme === "dark" ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
              {theme === "dark" ? t("nav.light") : t("nav.dark")}
            </span>
          </button>

          {!hydrated ? null : isAuthed ? (
            <>
              {isAdmin ? (
                <Link href="/admin" className={linkCls}>
                  <span className="inline-flex items-center gap-1">
                    <Shield className="h-4 w-4" aria-hidden />
                    {t("nav.admin")}
                  </span>
                </Link>
              ) : null}
              {!isAdmin ? (
                <Link href="/dashboard" className={linkCls}>
                  <span className="inline-flex items-center gap-1">
                    <LayoutDashboard className="h-4 w-4" aria-hidden />
                    {t("nav.dashboard")}
                  </span>
                </Link>
              ) : null}
              {!isAdmin ? (
                <Link href="/dashboard/deposit" className={linkCls}>
                  <span className="inline-flex items-center gap-1">
                    <Wallet className="h-4 w-4" aria-hidden />
                    {t("nav.deposit")}
                  </span>
                </Link>
              ) : null}
              {!isAdmin ? (
                <Link href="/dashboard/profile" className={linkCls}>
                  <span className="inline-flex items-center gap-1">
                    <User className="h-4 w-4" aria-hidden />
                    {t("profile.title")}
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
                {t("nav.logout")}
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-emerald-700"
            >
              <LogIn className="h-4 w-4" aria-hidden />
              {t("nav.login")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

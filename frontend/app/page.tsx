"use client";

import { Card, CardTitle } from "@/components/ui/Card";
import { useTranslation } from "@/hooks/useTranslation";
import { Heart, Shield, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";

const btnPrimary =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-emerald-800 shadow-md hover:bg-emerald-50";
const btnOutline =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-white px-4 py-3 text-sm font-medium text-white hover:bg-white/10";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 py-10 sm:p-6">
      <section className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-md sm:p-8">
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
          {t("home.heroTitle")}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-emerald-50 sm:text-base">
          {t("home.heroDesc")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/register" className={btnPrimary}>
            <Sparkles className="h-4 w-4" aria-hidden />
            {t("home.newAccount")}
          </Link>
          <Link href="/campaigns" className={btnOutline}>
            <Heart className="h-4 w-4" aria-hidden />
            {t("home.viewCampaigns")}
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 sm:p-6">
          <Wallet className="mb-2 h-8 w-8 text-emerald-600" aria-hidden />
          <CardTitle className="text-base">{t("home.savingTitle")}</CardTitle>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {t("home.savingDesc")}
          </p>
        </Card>
        <Card className="p-4 sm:p-6">
          <Heart className="mb-2 h-8 w-8 text-rose-500" aria-hidden />
          <CardTitle className="text-base">{t("home.donateTitle")}</CardTitle>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {t("home.donateDesc")}
          </p>
        </Card>
        <Card className="p-4 sm:p-6">
          <Shield className="mb-2 h-8 w-8 text-amber-600" aria-hidden />
          <CardTitle className="text-base">{t("home.transparencyTitle")}</CardTitle>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {t("home.transparencyDesc")}
          </p>
        </Card>
      </div>

      <div className="text-center">
        <Link
          href="/transparency"
          className="inline-flex items-center gap-2 rounded-xl text-sm font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
        >
          {t("home.viewTransparency")}
        </Link>
      </div>
    </div>
  );
}

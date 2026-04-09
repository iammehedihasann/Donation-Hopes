"use client";

import { Card, CardTitle } from "@/components/ui/Card";
import { useTranslation } from "@/hooks/useTranslation";
import { apiRequest } from "@/services/api";
import { notify } from "@/store/notifyStore";
import { BarChart3, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type TransparencyData = {
  totalDonations: number;
  totalReportedFundUsage: number;
  totalSavingsInUserWallets: number;
  campaigns: Array<{
    id: string;
    title: string;
    goalAmount: number;
    collectedAmount: number;
    progress: number;
    donorCount?: number;
  }>;
  fundUsages: Array<{
    id: string;
    title: string;
    amount: number;
    description?: string;
    usageDate: string;
  }>;
};

export default function TransparencyPage() {
  const { t, language } = useTranslation();
  const nLocale = language === "en" ? "en-US" : "bn-BD";
  const [data, setData] = useState<TransparencyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await apiRequest<TransparencyData>("/transparency", { method: "GET", skipAuth: true });
        if (!cancelled) setData(d);
      } catch (e) {
        notify.error(e instanceof Error ? e.message : t("auth.errorGeneric"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  if (loading || !data) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center gap-2 p-6">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" aria-hidden />
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 py-8 sm:p-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-8 w-8 text-emerald-600" aria-hidden />
        <h1 className="text-2xl font-bold">{t("transparency.title")}</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 sm:p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("transparency.totalDonations")}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            ৳{data.totalDonations.toLocaleString(nLocale)}
          </p>
        </Card>
        <Card className="p-4 sm:p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("transparency.walletSavings")}</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            ৳{data.totalSavingsInUserWallets.toLocaleString(nLocale)}
          </p>
        </Card>
        <Card className="p-4 sm:p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("transparency.fundUsage")}</p>
          <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">
            ৳{data.totalReportedFundUsage.toLocaleString(nLocale)}
          </p>
        </Card>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">{t("transparency.campaignProgress")}</h2>
        <ul className="space-y-3">
          {data.campaigns.map((c) => (
            <li key={c.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <span className="text-sm text-zinc-600">{c.progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${c.progress}%` }} />
                </div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  ৳{c.collectedAmount.toLocaleString(nLocale)} / ৳{c.goalAmount.toLocaleString(nLocale)}
                </p>
                {typeof c.donorCount === "number" ? (
                  <p className="mt-1 text-xs text-zinc-500">{t("campaign.donorCount", { count: c.donorCount })}</p>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">{t("transparency.fundUsageDetails")}</h2>
        {data.fundUsages.length === 0 ? (
          <Card className="p-6 text-center text-zinc-600">{t("transparency.noFundUsage")}</Card>
        ) : (
          <ul className="space-y-2">
            {data.fundUsages.map((f) => (
              <li key={f.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{f.title}</p>
                      {f.description ? (
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{f.description}</p>
                      ) : null}
                    </div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                      ৳{f.amount.toLocaleString(nLocale)}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    {new Date(f.usageDate).toLocaleDateString(nLocale)}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

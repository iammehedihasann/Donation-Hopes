"use client";

import { apiRequest } from "@/services/api";
import { useTranslation } from "@/hooks/useTranslation";
import { notify } from "@/store/notifyStore";
import { useEffect, useState } from "react";

type Tx = {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
};

type Filter = "all" | "deposit" | "withdraw" | "donate";

export function TxSection() {
  const { t, language } = useTranslation();
  const nLocale = language === "en" ? "en-US" : "bn-BD";
  const [items, setItems] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const qs = filter === "all" ? "" : `?type=${filter}`;
        const d = await apiRequest<{ items: Tx[] }>(`/transactions/me${qs}`, { method: "GET" });
        if (!cancelled) setItems(d.items);
      } catch (e) {
        notify.error(e instanceof Error ? e.message : t("auth.errorGeneric"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filter, t]);

  if (loading) return <p className="text-sm text-zinc-500">{t("common.loading")}</p>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", t("tx.filterAll")],
            ["deposit", t("tx.filterDeposit")],
            ["withdraw", t("tx.filterWithdraw")],
            ["donate", t("tx.filterDonate")],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={`rounded-xl px-3 py-2 text-sm font-medium shadow-sm ${
              filter === k
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">{t("tx.empty")}</p>
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {items.slice(0, 12).map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <span className="font-medium">
                {t(`tx.type.${row.type}`)} · ৳{row.amount.toLocaleString(nLocale)}
              </span>
              <span className="text-zinc-500">{new Date(row.createdAt).toLocaleString(nLocale)}</span>
              <span
                className={
                  row.status === "completed"
                    ? "rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                    : row.status === "rejected"
                      ? "rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700"
                      : "rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700"
                }
              >
                {t(`tx.status.${row.status}`)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

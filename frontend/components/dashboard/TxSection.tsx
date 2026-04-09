"use client";

import { apiRequest } from "@/services/api";
import { notify } from "@/store/notifyStore";
import { useEffect, useState } from "react";

type Tx = {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
};

const labels: Record<string, string> = {
  deposit: "জমা",
  withdraw: "উত্তোলন",
  donate: "দান",
};

export function TxSection() {
  const [items, setItems] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await apiRequest<{ items: Tx[] }>("/transactions/me", { method: "GET" });
        if (!cancelled) setItems(d.items);
      } catch (e) {
        notify.error(e instanceof Error ? e.message : "ত্রটি");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-sm text-zinc-500">লোড হচ্ছে…</p>;
  if (items.length === 0) return <p className="text-sm text-zinc-500">কোনো লেনদেন নেই।</p>;

  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {items.slice(0, 10).map((t) => (
        <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
          <span>
            {labels[t.type] ?? t.type} ·{" "}
            <span className="font-medium">৳{t.amount.toLocaleString("bn-BD")}</span>
          </span>
          <span className="text-zinc-500">{new Date(t.createdAt).toLocaleString("bn-BD")}</span>
          <span
            className={
              t.status === "completed"
                ? "text-emerald-600"
                : t.status === "rejected"
                  ? "text-red-600"
                  : "text-amber-600"
            }
          >
            {t.status}
          </span>
        </li>
      ))}
    </ul>
  );
}

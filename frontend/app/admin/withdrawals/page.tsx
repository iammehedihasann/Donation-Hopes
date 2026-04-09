"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { apiRequest } from "@/services/api";
import { notify } from "@/store/notifyStore";
import { Check, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  user: { name: string; phone: string };
  amount: number;
};

export default function AdminWithdrawalsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await apiRequest<{ items: Row[] }>("/admin/withdrawals/pending", { method: "GET" });
      setItems(d.items);
    } catch (e) {
      notify.error(e instanceof Error ? e.message : "ত্রটি");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function review(id: string, action: "approve" | "reject") {
    setBusy(id);
    try {
      await apiRequest(`/admin/withdrawals/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      notify.success(action === "approve" ? "অনুমোদিত" : "প্রত্যাখ্যান");
      await load();
    } catch (e) {
      notify.error(e instanceof Error ? e.message : "ত্রটি");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 py-8 sm:p-6">
      <Link href="/admin" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
        ← অ্যাডমিন হোম
      </Link>
      <h1 className="text-xl font-bold">উত্তোলন অনুরোধ</h1>

      {loading ? (
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-hidden />
      ) : items.length === 0 ? (
        <Card className="p-6 text-center text-zinc-600">কোনো অনুরোধ নেই।</Card>
      ) : (
        <ul className="space-y-4">
          {items.map((w) => (
            <li key={w.id}>
              <Card className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6">
                <div>
                  <CardTitle className="text-base">
                    {w.user?.name} · {w.user?.phone}
                  </CardTitle>
                  <p className="mt-1 text-lg font-semibold text-emerald-700">৳{w.amount.toLocaleString("bn-BD")}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    disabled={busy === w.id}
                    leftIcon={busy === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    onClick={() => review(w.id, "approve")}
                  >
                    অনুমোদন
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy === w.id}
                    leftIcon={<X className="h-4 w-4" />}
                    onClick={() => review(w.id, "reject")}
                  >
                    প্রত্যাখ্যান
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

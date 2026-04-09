"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { apiRequest, getApiBaseUrl } from "@/services/api";
import { notify } from "@/store/notifyStore";
import { Check, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  user: { name: string; phone: string };
  method: string;
  amount: number;
  screenshotUrl: string;
};

export default function AdminPaymentsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await apiRequest<{ items: Row[] }>("/admin/payments/pending", { method: "GET" });
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

  async function review(id: string, action: "verify" | "reject") {
    setBusy(id);
    try {
      await apiRequest(`/admin/payments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      notify.success(action === "verify" ? "যাচাই সম্পন্ন" : "প্রত্যাখ্যান সম্পন্ন");
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
      <h1 className="text-xl font-bold">অপেক্ষমান পেমেন্ট</h1>

      {loading ? (
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-hidden />
      ) : items.length === 0 ? (
        <Card className="p-6 text-center text-zinc-600">কোনো অনুরোধ নেই।</Card>
      ) : (
        <ul className="space-y-4">
          {items.map((p) => (
            <li key={p.id}>
              <Card className="p-4 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">
                      {p.user?.name} · {p.user?.phone}
                    </CardTitle>
                    <p className="mt-2 text-sm text-zinc-600">
                      {p.method} · ৳{p.amount.toLocaleString("bn-BD")}
                    </p>
                    <a
                      href={`${getApiBaseUrl()}${p.screenshotUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-emerald-700 underline"
                    >
                      স্ক্রিনশট দেখুন
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      disabled={busy === p.id}
                      leftIcon={busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      onClick={() => review(p.id, "verify")}
                    >
                      যাচাই
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy === p.id}
                      leftIcon={<X className="h-4 w-4" />}
                      onClick={() => review(p.id, "reject")}
                    >
                      প্রত্যাখ্যান
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

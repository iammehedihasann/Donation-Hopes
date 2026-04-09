"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { apiRequest } from "@/services/api";
import { notify } from "@/store/notifyStore";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  title: string;
  amount: number;
  description?: string;
  usageDate: string;
};

export default function AdminFundPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await apiRequest<{ items: Row[] }>("/admin/fund-usage", { method: "GET" });
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!title.trim() || !Number.isFinite(n) || n <= 0) {
      notify.error("সঠিক তথ্য দিন");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("/admin/fund-usage", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          amount: n,
          description: description.trim() || undefined,
        }),
      });
      notify.success("রেকর্ড যুক্ত হয়েছে");
      setTitle("");
      setAmount("");
      setDescription("");
      await load();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "ত্রটি");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 py-8 sm:p-6">
      <Link href="/admin" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
        ← অ্যাডমিন হোম
      </Link>

      <Card>
        <CardTitle>তহবিল ব্যবহারের রেকর্ড যুক্ত করুন</CardTitle>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          স্বচ্ছতা পেজে এই তথ্য সবাই দেখতে পারবে।
        </p>
        <form className="mt-4 space-y-4" onSubmit={onSubmit}>
          <Input label="শিরোনাম" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="পরিমাণ (৳)" name="amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <div>
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">বিবরণ (ঐচ্ছিক)</span>
            <textarea
              className="w-full rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            leftIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          >
            সংরক্ষণ
          </Button>
        </form>
      </Card>

      <section>
        <h2 className="mb-4 text-lg font-semibold">সাম্প্রতিক রেকর্ড</h2>
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
        ) : (
          <ul className="space-y-2">
            {items.map((f) => (
              <li key={f.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-medium">{f.title}</p>
                    <p className="font-semibold text-emerald-700">৳{f.amount.toLocaleString("bn-BD")}</p>
                  </div>
                  {f.description ? <p className="mt-1 text-sm text-zinc-600">{f.description}</p> : null}
                  <p className="mt-2 text-xs text-zinc-500">{new Date(f.usageDate).toLocaleDateString("bn-BD")}</p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

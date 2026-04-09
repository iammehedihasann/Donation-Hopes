"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { apiRequest } from "@/services/api";
import { notify } from "@/store/notifyStore";
import { Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Camp = {
  id: string;
  title: string;
  goalAmount: number;
  collectedAmount: number;
  isActive: boolean;
};

export default function AdminCampaignsPage() {
  const [items, setItems] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await apiRequest<{ items: Camp[] }>("/admin/campaigns", { method: "GET" });
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

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const g = Number(goal);
    if (!title.trim() || !Number.isFinite(g) || g < 0) {
      notify.error("শিরোনাম ও লক্ষ্য পরিমাণ সঠিক দিন");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("/admin/campaigns", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          goalAmount: g,
          description: desc.trim() || undefined,
          isActive: true,
        }),
      });
      notify.success("ক্যাম্পেইন তৈরি হয়েছে");
      setTitle("");
      setGoal("");
      setDesc("");
      await load();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "ত্রটি");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("ক্যাম্পেইন মুছবেন?")) return;
    try {
      await apiRequest(`/admin/campaigns/${id}`, { method: "DELETE" });
      notify.success("মুছে ফেলা হয়েছে");
      await load();
    } catch (e) {
      notify.error(e instanceof Error ? e.message : "ত্রটি");
    }
  }

  async function toggle(id: string, isActive: boolean) {
    try {
      await apiRequest(`/admin/campaigns/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !isActive }),
      });
      await load();
    } catch (e) {
      notify.error(e instanceof Error ? e.message : "ত্রটি");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 py-8 sm:p-6">
      <Link href="/admin" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
        ← অ্যাডমিন হোম
      </Link>

      <Card>
        <CardTitle>নতুন ক্যাম্পেইন</CardTitle>
        <form className="mt-4 space-y-4" onSubmit={create}>
          <Input label="শিরোনাম" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="লক্ষ্য পরিমাণ (৳)" name="goal" type="number" min={0} value={goal} onChange={(e) => setGoal(e.target.value)} required />
          <div>
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">বিবরণ (ঐচ্ছিক)</span>
            <textarea
              className="w-full rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            leftIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          >
            তৈরি করুন
          </Button>
        </form>
      </Card>

      <section>
        <h2 className="mb-4 text-lg font-semibold">সব ক্যাম্পেইন</h2>
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
        ) : (
          <ul className="space-y-3">
            {items.map((c) => (
              <li key={c.id}>
                <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-sm text-zinc-600">
                      ৳{c.collectedAmount.toLocaleString("bn-BD")} / ৳{c.goalAmount.toLocaleString("bn-BD")} ·{" "}
                      {c.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={() => toggle(c.id, c.isActive)}>
                      {c.isActive ? "বন্ধ করুন" : "চালু করুন"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-red-300 text-red-700"
                      leftIcon={<Trash2 className="h-4 w-4" />}
                      onClick={() => remove(c.id)}
                    >
                      মুছুন
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

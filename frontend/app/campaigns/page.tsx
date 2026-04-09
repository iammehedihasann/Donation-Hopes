"use client";

import { Card, CardTitle } from "@/components/ui/Card";
import { apiRequest } from "@/services/api";
import { notify } from "@/store/notifyStore";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type CampaignRow = {
  id: string;
  title: string;
  goalAmount: number;
  collectedAmount: number;
  progress: number;
};

export default function CampaignsPage() {
  const [items, setItems] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<{ items: CampaignRow[] }>("/campaigns", {
          method: "GET",
          skipAuth: true,
        });
        if (!cancelled) setItems(data.items);
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

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center gap-2 p-6 text-zinc-600">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" aria-hidden />
        লোড হচ্ছে…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 py-8 sm:p-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">সক্রিয় ক্যাম্পেইন</h1>
      {items.length === 0 ? (
        <Card className="p-6 text-center text-zinc-600">এখন কোনো ক্যাম্পেইন নেই।</Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((c) => (
            <li key={c.id}>
              <Link href={`/campaigns/${c.id}`}>
                <Card className="h-full p-4 transition-shadow hover:shadow-lg sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">{c.title}</CardTitle>
                    <Heart className="h-5 w-5 shrink-0 text-rose-500" aria-hidden />
                  </div>
                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      সংগৃহীত ৳{c.collectedAmount.toLocaleString("bn-BD")} / লক্ষ্য ৳
                      {c.goalAmount.toLocaleString("bn-BD")}
                    </p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

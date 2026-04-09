"use client";

import { Card } from "@/components/ui/Card";
import { apiRequest } from "@/services/api";
import { notify } from "@/store/notifyStore";
import { BarChart3, Heart, Loader2, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  totalUsers: number;
  totalDonationsAmount: number;
  totalSavingsInWallets: number;
  totalCollectedOnCampaigns: number;
};

const linkCard =
  "flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-md transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900";

export default function AdminHomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await apiRequest<Stats>("/admin/stats", { method: "GET" });
        if (!cancelled) setStats(d);
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

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 py-8 sm:p-6">
      <h1 className="text-2xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h1>

      {loading || !stats ? (
        <div className="flex items-center gap-2 text-zinc-600">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" aria-hidden />
          লোড হচ্ছে…
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <Users className="h-6 w-6 text-emerald-600" aria-hidden />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">মোট ব্যবহারকারী</p>
            <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString("bn-BD")}</p>
          </Card>
          <Card className="p-4">
            <Heart className="h-6 w-6 text-rose-500" aria-hidden />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">মোট দান</p>
            <p className="text-2xl font-bold">৳{stats.totalDonationsAmount.toLocaleString("bn-BD")}</p>
          </Card>
          <Card className="p-4">
            <Wallet className="h-6 w-6 text-amber-600" aria-hidden />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">ওয়ালেটে সঞ্চয়</p>
            <p className="text-2xl font-bold">৳{stats.totalSavingsInWallets.toLocaleString("bn-BD")}</p>
          </Card>
          <Card className="p-4">
            <BarChart3 className="h-6 w-6 text-teal-600" aria-hidden />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">ক্যাম্পেইনে সংগৃহীত</p>
            <p className="text-2xl font-bold">৳{stats.totalCollectedOnCampaigns.toLocaleString("bn-BD")}</p>
          </Card>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/admin/payments" className={linkCard}>
          <span className="text-base font-semibold">পেমেন্ট যাচাই</span>
        </Link>
        <Link href="/admin/withdrawals" className={linkCard}>
          <span className="text-base font-semibold">উত্তোলন অনুরোধ</span>
        </Link>
        <Link href="/admin/campaigns" className={linkCard}>
          <span className="text-base font-semibold">ক্যাম্পেইন ব্যবস্থাপনা</span>
        </Link>
        <Link href="/admin/fund" className={linkCard}>
          <span className="text-base font-semibold">তহবিল ব্যবহার রেকর্ড</span>
        </Link>
        <Link href="/transparency" className={linkCard}>
          <span className="text-base font-semibold">স্বচ্ছতা পেজ (পাবলিক)</span>
        </Link>
      </div>
    </div>
  );
}

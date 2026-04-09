"use client";

import { Card, CardTitle } from "@/components/ui/Card";
import { apiRequest } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { notify } from "@/store/notifyStore";
import { ArrowDownLeft, ArrowUpRight, Gift, History, Loader2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const btn =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-md transition-colors";
const btnPrimary = `${btn} bg-emerald-600 text-white hover:bg-emerald-700`;
const btnOutline = `${btn} border-2 border-emerald-600 text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-zinc-800`;
const btnSecondary = `${btn} bg-slate-800 text-white hover:bg-slate-900`;

const TxSection = dynamic(() => import("@/components/dashboard/TxSection").then((m) => m.TxSection), {
  loading: () => <p className="text-sm text-zinc-500">লোড হচ্ছে…</p>,
  ssr: false,
});

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const w = await apiRequest<{ balance: number }>("/wallet/me", { method: "GET" });
        if (!cancelled) setBalance(w.balance);
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
    <div className="mx-auto max-w-5xl space-y-6 p-4 py-8 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">আমার ড্যাশবোর্ড</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">স্বাগতম, {user?.name}</p>
      </div>

      <Card className="p-4 sm:p-6">
        <CardTitle className="text-base">বর্তমান ব্যালেন্স</CardTitle>
        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-zinc-600">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            লোড হচ্ছে…
          </div>
        ) : (
          <p className="mt-2 text-3xl font-bold text-emerald-700 dark:text-emerald-400">
            ৳{(balance ?? 0).toLocaleString("bn-BD")}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard/deposit" className={btnPrimary}>
            <ArrowDownLeft className="h-4 w-4" aria-hidden />
            টাকা জমা দিন
          </Link>
          <Link href="/dashboard/withdraw" className={btnOutline}>
            <ArrowUpRight className="h-4 w-4" aria-hidden />
            উত্তোলন অনুরোধ
          </Link>
          <Link href="/campaigns" className={btnSecondary}>
            <Gift className="h-4 w-4" aria-hidden />
            দান করুন
          </Link>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-zinc-600" aria-hidden />
          <CardTitle className="text-base">সাম্প্রতিক লেনদেন</CardTitle>
        </div>
        <TxSection />
      </Card>
    </div>
  );
}

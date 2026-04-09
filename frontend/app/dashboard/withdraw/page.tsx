"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { apiRequest } from "@/services/api";
import { notify } from "@/store/notifyStore";
import { Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function WithdrawPage() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      notify.error("সঠিক পরিমাণ দিন");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/wallet/withdraw-request", {
        method: "POST",
        body: JSON.stringify({ amount: n }),
      });
      notify.success("অনুরোধ জমা হয়েছে। অ্যাডমিন অনুমোদনের অপেক্ষায়।");
      setAmount("");
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "ত্রটি");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 py-8 sm:p-6">
      <Link href="/dashboard" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
        ← ড্যাশবোর্ড
      </Link>

      <Card>
        <CardTitle>উত্তোলন অনুরোধ</CardTitle>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          অনুরোধ জমা দিলে অ্যাডমিন অনুমোদনের পর আপনার ওয়ালেট থেকে টাকা কাটা হবে।
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input
            label="পরিমাণ (৳)"
            name="amount"
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          >
            অনুরোধ পাঠান
          </Button>
        </form>
      </Card>
    </div>
  );
}

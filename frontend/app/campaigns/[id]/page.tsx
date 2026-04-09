"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { apiRequest } from "@/services/api";
import { useAuthHydrated } from "@/hooks/useAuthHydrated";
import { useAuthStore } from "@/store/authStore";
import { notify } from "@/store/notifyStore";
import { Gift, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Campaign = {
  id: string;
  title: string;
  goalAmount: number;
  collectedAmount: number;
  description?: string;
  progress: number;
  isActive: boolean;
};

export default function CampaignDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const hydrated = useAuthHydrated();
  const token = useAuthStore((s) => s.token);

  const [c, setC] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<{ campaign: Campaign }>(`/campaigns/${id}`, {
          method: "GET",
          skipAuth: true,
        });
        if (!cancelled) setC(data.campaign);
      } catch (e) {
        notify.error(e instanceof Error ? e.message : "ত্রটি");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function donate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      notify.error("দান করতে লগইন করুন");
      return;
    }
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      notify.error("সঠিক পরিমাণ দিন");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("/donations", {
        method: "POST",
        body: JSON.stringify({ campaignId: id, amount: n }),
      });
      notify.success("দান সফল হয়েছে। ধন্যবাদ!");
      setOpen(false);
      setAmount("");
      const data = await apiRequest<{ campaign: Campaign }>(`/campaigns/${id}`, {
        method: "GET",
        skipAuth: true,
      });
      setC(data.campaign);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "ত্রটি");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !c) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center gap-2 p-6">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" aria-hidden />
        লোড হচ্ছে…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 py-8 sm:p-6">
      <Card>
        <CardTitle>{c.title}</CardTitle>
        {c.description ? <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{c.description}</p> : null}
        <div className="mt-4">
          <div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${c.progress}%` }} />
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            সংগৃহীত ৳{c.collectedAmount.toLocaleString("bn-BD")} / লক্ষ্য ৳{c.goalAmount.toLocaleString("bn-BD")}
          </p>
        </div>

        {c.isActive ? (
          hydrated && token ? (
            <Button
              type="button"
              className="mt-6 w-full"
              leftIcon={<Gift className="h-4 w-4" aria-hidden />}
              onClick={() => setOpen(true)}
            >
              দান করুন
            </Button>
          ) : (
            <Link
              href="/login"
              className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 bg-white px-4 py-3 text-sm font-medium text-emerald-800 shadow-md hover:bg-emerald-50 dark:bg-zinc-950"
            >
              <Gift className="h-4 w-4" aria-hidden />
              দান করতে লগইন করুন
            </Link>
          )
        ) : (
          <p className="mt-6 text-sm text-zinc-500">এই ক্যাম্পেইন বন্ধ আছে।</p>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="দান করুন">
        <form className="space-y-4" onSubmit={donate}>
          <Input
            label="পরিমাণ (৳)"
            name="amount"
            type="number"
            min={1}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
            leftIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
          >
            নিশ্চিত করুন
          </Button>
        </form>
      </Modal>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { apiRequest, uploadsUrl } from "@/services/api";
import { useAuthHydrated } from "@/hooks/useAuthHydrated";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import { notify } from "@/store/notifyStore";
import { Gift, Image as ImageIcon, Loader2, Users } from "lucide-react";
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
  donorCount?: number;
  updates?: Array<{ id: string; text: string; imageUrl?: string; createdAt: string }>;
};

export default function CampaignDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const hydrated = useAuthHydrated();
  const token = useAuthStore((s) => s.token);
  const { t, language } = useTranslation();
  const nLocale = language === "en" ? "en-US" : "bn-BD";

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
        notify.error(e instanceof Error ? e.message : t("auth.errorGeneric"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, t]);

  async function donate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      notify.error(t("campaign.loginToDonate"));
      return;
    }
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      notify.error(t("campaign.invalidAmount"));
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("/donations", {
        method: "POST",
        body: JSON.stringify({ campaignId: id, amount: n }),
      });
      notify.success(t("campaign.donationSuccess"));
      setOpen(false);
      setAmount("");
      const data = await apiRequest<{ campaign: Campaign }>(`/campaigns/${id}`, {
        method: "GET",
        skipAuth: true,
      });
      setC(data.campaign);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : t("auth.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !c) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center gap-2 p-6">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" aria-hidden />
        {t("common.loading")}
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
            {t("campaign.collected")} ৳{c.collectedAmount.toLocaleString(nLocale)} / {t("campaign.goal")} ৳
            {c.goalAmount.toLocaleString(nLocale)}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            <Users className="h-4 w-4" aria-hidden />
            {t("campaign.donorCount", { count: c.donorCount ?? 0 })}
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
              {t("campaign.donate")}
            </Button>
          ) : (
            <Link
              href="/login"
              className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 bg-white px-4 py-3 text-sm font-medium text-emerald-800 shadow-md hover:bg-emerald-50 dark:bg-zinc-950"
            >
              <Gift className="h-4 w-4" aria-hidden />
              {t("campaign.loginToDonate")}
            </Link>
          )
        ) : (
          <p className="mt-6 text-sm text-zinc-500">{t("campaign.closed")}</p>
        )}
      </Card>

      {c.updates && c.updates.length ? (
        <Card className="p-4 sm:p-6">
          <CardTitle className="text-base">{t("campaign.updatesTitle")}</CardTitle>
          <ul className="mt-4 space-y-3">
            {c.updates.map((u) => (
              <li key={u.id} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                <p className="text-sm leading-relaxed">{u.text}</p>
                {u.imageUrl ? (
                  <a
                    href={uploadsUrl(u.imageUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-sm text-emerald-700 underline"
                  >
                    <ImageIcon className="h-4 w-4" aria-hidden />
                    {t("campaign.viewImage")}
                  </a>
                ) : null}
                <p className="mt-2 text-xs text-zinc-500">{new Date(u.createdAt).toLocaleString(nLocale)}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title={t("campaign.donate")}>
        <form className="space-y-4" onSubmit={donate}>
          <Input
            label={t("campaign.amount")}
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
            {t("common.confirm")}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

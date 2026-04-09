"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "@/hooks/useTranslation";
import { apiRequest, getApiBaseUrl } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { notify } from "@/store/notifyStore";
import { Loader2, Smartphone, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Method = "bkash" | "nagad" | "rocket";

export default function DepositPage() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const [method, setMethod] = useState<Method>("bkash");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Array<{ id: string; method: string; amount: number; status: string; screenshotUrl: string }>>([]);

  const refreshList = useCallback(async () => {
    try {
      const d = await apiRequest<{ items: typeof list }>("/payments/me", { method: "GET" });
      setList(d.items);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      notify.error(t("deposit.pickScreenshot"));
      return;
    }
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      notify.error(t("deposit.invalidAmount"));
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("method", method);
      fd.append("amount", String(n));
      fd.append("screenshot", file);

      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${getApiBaseUrl()}/api/payments/submit`, {
        method: "POST",
        headers,
        body: fd,
      });
      const json = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || json.success === false) {
        throw new Error(json.message ?? t("deposit.uploadFailed"));
      }
      notify.success(json.message ?? t("deposit.submit"));
      setAmount("");
      setFile(null);
      await refreshList();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : t("auth.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 py-8 sm:p-6">
      <Link href="/dashboard" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
        ← {t("nav.dashboard")}
      </Link>

      <Card>
        <CardTitle>{t("deposit.title")}</CardTitle>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {t("deposit.hint")}
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("deposit.method")}</span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["bkash", "bKash"],
                  ["nagad", "Nagad"],
                  ["rocket", "Rocket"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMethod(v)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium shadow-sm ${
                    method === v ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Input label={t("deposit.amount")} name="amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <div>
            <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("deposit.screenshot")}</span>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 p-6 dark:border-zinc-600">
              <Upload className="h-8 w-8 text-zinc-400" aria-hidden />
              <span className="mt-2 text-sm text-zinc-600">{t("deposit.chooseImage")}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {file ? <p className="mt-2 text-xs text-zinc-500">{file.name}</p> : null}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
          >
            {t("deposit.submit")}
          </Button>
        </form>
      </Card>

      <Card className="p-4 sm:p-6">
        <CardTitle className="text-base">{t("deposit.mySubmissions")}</CardTitle>
        <ul className="mt-4 space-y-3 text-sm">
          {list.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
              <span>
                {p.method} · ৳{p.amount.toLocaleString("bn-BD")}
              </span>
              <span className="text-zinc-500">{p.status}</span>
              <a
                href={`${getApiBaseUrl()}${p.screenshotUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 underline dark:text-emerald-400"
              >
                {t("deposit.viewImage")}
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

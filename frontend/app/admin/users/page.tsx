"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/hooks/useTranslation";
import { apiRequest } from "@/services/api";
import { notify } from "@/store/notifyStore";
import { Ban, Loader2, Trash2, User, UserCheck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  status?: "active" | "suspended";
  isDeleted?: boolean;
  balance?: number;
  createdAt: string;
};

type Details = {
  user: Row;
  walletBalance: number;
  totalDonation: number;
  donationCount: number;
  transactionCount: number;
};

export default function AdminUsersPage() {
  const { t, language } = useTranslation();
  const nLocale = language === "en" ? "en-US" : "bn-BD";

  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<Details | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiRequest<{ items: Row[] }>("/admin/users", { method: "GET" });
      setItems(d.items);
    } catch (e) {
      notify.error(e instanceof Error ? e.message : t("auth.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  async function openDetails(id: string) {
    setOpen(true);
    setDetails(null);
    try {
      const d = await apiRequest<Details>(`/admin/users/${id}`, { method: "GET" });
      setDetails(d);
    } catch (e) {
      notify.error(e instanceof Error ? e.message : t("auth.errorGeneric"));
      setOpen(false);
    }
  }

  async function action(id: string, action: "suspend" | "activate" | "soft_delete") {
    setBusy(id);
    try {
      await apiRequest(`/admin/users/${id}/action`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      notify.success(t("common.confirm"));
      await load();
      if (details?.user.id === id) {
        const d = await apiRequest<Details>(`/admin/users/${id}`, { method: "GET" });
        setDetails(d);
      }
    } catch (e) {
      notify.error(e instanceof Error ? e.message : t("auth.errorGeneric"));
    } finally {
      setBusy(null);
    }
  }

  const active = useMemo(() => items.filter((u) => !u.isDeleted), [items]);
  const deleted = useMemo(() => items.filter((u) => u.isDeleted), [items]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 py-8 sm:p-6">
      <Link href="/admin" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
        ← {t("nav.admin")}
      </Link>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{t("admin.usersTitle")}</h1>
        <span className="text-sm text-zinc-600">
          {t("admin.totalUsers")}: {active.length.toLocaleString(nLocale)}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-zinc-600">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" aria-hidden />
          {t("common.loading")}
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="p-4">
            <CardTitle className="text-base">{t("admin.activeUsers")}</CardTitle>
            <ul className="mt-3 space-y-2">
              {active.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                  <button type="button" className="text-left" onClick={() => openDetails(u.id)}>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-zinc-500">{u.phone}{u.email ? ` · ${u.email}` : ""}</p>
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        u.status === "suspended"
                          ? "rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700"
                          : "rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                      }
                    >
                      {u.status ?? "active"}
                    </span>
                    {u.status === "suspended" ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-0 px-3 py-2 text-sm"
                        disabled={busy === u.id}
                        leftIcon={<UserCheck className="h-4 w-4" />}
                        onClick={() => action(u.id, "activate")}
                      >
                        {t("admin.activate")}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-0 px-3 py-2 text-sm"
                        disabled={busy === u.id}
                        leftIcon={<Ban className="h-4 w-4" />}
                        onClick={() => action(u.id, "suspend")}
                      >
                        {t("admin.suspend")}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-0 border-red-300 px-3 py-2 text-sm text-red-700"
                      disabled={busy === u.id}
                      leftIcon={<Trash2 className="h-4 w-4" />}
                      onClick={() => {
                        if (confirm("Soft delete user?")) action(u.id, "soft_delete");
                      }}
                    >
                      {t("admin.softDelete")}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {deleted.length ? (
            <Card className="p-4">
              <CardTitle className="text-base">{t("admin.deletedUsers")}</CardTitle>
              <ul className="mt-3 space-y-2">
                {deleted.map((u) => (
                  <li key={u.id} className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                    {u.name} · {u.phone}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t("admin.userDetailsTitle")}>
        {!details ? (
          <div className="flex items-center gap-2 text-zinc-600">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" aria-hidden />
            {t("common.loading")}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
              <User className="mt-0.5 h-5 w-5 text-emerald-700" aria-hidden />
              <div>
                <p className="font-semibold">{details.user.name}</p>
                <p className="text-sm text-zinc-600">{details.user.phone}{details.user.email ? ` · ${details.user.email}` : ""}</p>
                <p className="text-xs text-zinc-500">
                  {details.user.role} · {details.user.status ?? "active"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="p-4">
                <p className="text-sm text-zinc-600">{t("profile.walletBalance")}</p>
                <p className="mt-1 text-xl font-bold">৳{details.walletBalance.toLocaleString(nLocale)}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-zinc-600">{t("profile.totalDonation")}</p>
                <p className="mt-1 text-xl font-bold">৳{details.totalDonation.toLocaleString(nLocale)}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-zinc-600">{t("profile.donationCount")}</p>
                <p className="mt-1 text-xl font-bold">{details.donationCount.toLocaleString(nLocale)}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-zinc-600">{t("admin.transactionCount")}</p>
                <p className="mt-1 text-xl font-bold">{details.transactionCount.toLocaleString(nLocale)}</p>
              </Card>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


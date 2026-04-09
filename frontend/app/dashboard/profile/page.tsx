"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "@/hooks/useTranslation";
import { apiRequest } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { notify } from "@/store/notifyStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { KeyRound, Loader2, Pencil, Save, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Profile = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  status?: string;
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const language = usePreferencesStore((s) => s.language);
  const authUser = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [summary, setSummary] = useState<{ walletBalance: number; totalDonation: number; donationCount: number } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await apiRequest<{ user: Profile }>("/users/profile", { method: "GET" });
        const s = await apiRequest<{ walletBalance: number; totalDonation: number; donationCount: number }>(
          "/users/profile/summary",
          { method: "GET" }
        );
        if (cancelled) return;
        setProfile(p.user);
        setSummary(s);
        setName(p.user.name ?? "");
        setEmail(p.user.email ?? "");
      } catch (e) {
        notify.error(e instanceof Error ? e.message : t("auth.errorGeneric"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await apiRequest<{ user: Profile }>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      setProfile(r.user);
      setEditing(false);
      // keep auth store user in sync (backward compatible)
      if (token && authUser) {
        const status = r.user.status === "suspended" ? "suspended" : r.user.status === "active" ? "active" : authUser.status;
        setAuth(token, { ...authUser, name: r.user.name, email: r.user.email, status });
      }
      notify.success(t("common.confirm"));
    } catch (e) {
      notify.error(e instanceof Error ? e.message : t("auth.errorGeneric"));
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setChanging(true);
    try {
      await apiRequest("/users/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      notify.success(t("common.confirm"));
    } catch (e) {
      notify.error(e instanceof Error ? e.message : t("auth.errorGeneric"));
    } finally {
      setChanging(false);
    }
  }

  const nLocale = language === "en" ? "en-US" : "bn-BD";

  if (loading || !profile || !summary) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center gap-2 p-6 text-zinc-600">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" aria-hidden />
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 py-8 sm:p-6">
      <Link href="/dashboard" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
        ← {t("nav.dashboard")}
      </Link>

      <Card className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">{profile.name}</CardTitle>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {profile.phone}
              {profile.email ? ` · ${profile.email}` : ""}
            </p>
          </div>
          <Button
            variant="outline"
            className="min-h-0 px-3 py-2 text-sm"
            leftIcon={<Pencil className="h-4 w-4" />}
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? t("common.close") : t("profile.edit")}
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("profile.walletBalance")}</p>
            <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-400">
              ৳{summary.walletBalance.toLocaleString(nLocale)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("profile.totalDonation")}</p>
            <p className="mt-1 text-xl font-bold">
              ৳{summary.totalDonation.toLocaleString(nLocale)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("profile.donationCount")}</p>
            <p className="mt-1 text-xl font-bold">{summary.donationCount.toLocaleString(nLocale)}</p>
          </Card>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-zinc-600" aria-hidden />
          <CardTitle className="text-base">{t("profile.title")}</CardTitle>
        </div>
        <form className="space-y-4" onSubmit={saveProfile}>
          <Input label={t("auth.name")} name="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!editing} required />
          <Input label={t("auth.email")} name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!editing} />
          <Button
            type="submit"
            disabled={!editing || saving}
            className="w-full"
            leftIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          >
            {t("profile.save")}
          </Button>
        </form>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-zinc-600" aria-hidden />
          <CardTitle className="text-base">{t("profile.changePasswordTitle")}</CardTitle>
        </div>
        <form className="space-y-4" onSubmit={changePassword}>
          <Input
            label={t("profile.currentPassword")}
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label={t("profile.newPassword")}
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={changing}
            leftIcon={changing ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          >
            {t("profile.updatePassword")}
          </Button>
        </form>
      </Card>
    </div>
  );
}


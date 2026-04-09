"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { apiRequest } from "@/services/api";
import type { AuthUser } from "@/store/authStore";
import { useAuthStore } from "@/store/authStore";
import { notify } from "@/store/notifyStore";
import { Loader2, Mail, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Tab = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [tab, setTab] = useState<Tab>("phone");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  async function onEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiRequest<{ token: string; user: AuthUser }>("/auth/login/email", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      });
      setAuth(data.token, data.user);
      notify.success("লগইন সফল");
      router.replace(data.user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "ত্রটি");
    } finally {
      setLoading(false);
    }
  }

  async function onSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiRequest<{ devOtp?: string }>("/auth/login/phone/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
        skipAuth: true,
      });
      setOtpSent(true);
      setDevOtp(data?.devOtp ?? null);
      notify.success("OTP পাঠানো হয়েছে (মক)");
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "ত্রটি");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiRequest<{ token: string; user: AuthUser }>("/auth/login/phone/verify", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
        skipAuth: true,
      });
      setAuth(data.token, data.user);
      notify.success("লগইন সফল");
      router.replace(data.user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "ত্রটি");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-4 py-10 sm:p-6">
      <Card>
        <CardTitle>লগইন করুন</CardTitle>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          ইমেইল অথবা ফোন + OTP দিয়ে প্রবেশ করুন।
        </p>

        <div className="mt-4 flex gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium ${
              tab === "phone" ? "bg-white shadow-sm dark:bg-zinc-950" : "text-zinc-600"
            }`}
            onClick={() => setTab("phone")}
          >
            <Smartphone className="h-4 w-4" aria-hidden />
            ফোন
          </button>
          <button
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium ${
              tab === "email" ? "bg-white shadow-sm dark:bg-zinc-950" : "text-zinc-600"
            }`}
            onClick={() => setTab("email")}
          >
            <Mail className="h-4 w-4" aria-hidden />
            ইমেইল
          </button>
        </div>

        {tab === "email" ? (
          <form className="mt-6 space-y-4" onSubmit={onEmailLogin}>
            <Input label="ইমেইল" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input
              label="পাসওয়ার্ড"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading} leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}>
              লগইন করুন
            </Button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            {!otpSent ? (
              <form className="space-y-4" onSubmit={onSendOtp}>
                <Input
                  label="মোবাইল নম্বর"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  leftIcon={
                    loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />
                  }
                >
                  OTP পাঠান
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={onVerifyOtp}>
                {devOtp ? (
                  <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    ডেভ মোড: OTP = <strong>{devOtp}</strong>
                  </p>
                ) : null}
                <Input label="OTP" name="otp" inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                >
                  যাচাই করুন
                </Button>
                <button
                  type="button"
                  className="w-full text-sm text-emerald-700 underline"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setDevOtp(null);
                  }}
                >
                  নম্বর পরিবর্তন
                </button>
              </form>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-zinc-600">
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/register" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            নিবন্ধন করুন
          </Link>
        </p>
      </Card>
    </div>
  );
}

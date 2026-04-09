"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { apiRequest } from "@/services/api";
import type { AuthUser } from "@/store/authStore";
import { useAuthStore } from "@/store/authStore";
import { notify } from "@/store/notifyStore";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body: Record<string, string> = { name, phone, password };
      if (email.trim()) body.email = email.trim();
      const data = await apiRequest<{ token: string; user: AuthUser }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
        skipAuth: true,
      });
      setAuth(data.token, data.user);
      notify.success("নিবন্ধন সফল");
      router.replace("/dashboard");
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "ত্রটি");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-4 py-10 sm:p-6">
      <Card>
        <CardTitle>নিবন্ধন করুন</CardTitle>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">নাম, ফোন ও পাসওয়ার্ড দিন। ইমেইল ঐচ্ছিক।</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input label="নাম" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="মোবাইল নম্বর" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <Input
            label="ইমেইল (ঐচ্ছিক — ইমেইল লগইনের জন্য)"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="পাসওয়ার্ড"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          >
            অ্যাকাউন্ট খুলুন
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            লগইন করুন
          </Link>
        </p>
      </Card>
    </div>
  );
}

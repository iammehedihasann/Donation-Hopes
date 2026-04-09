import { Card, CardTitle } from "@/components/ui/Card";
import { Heart, Shield, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";

const btnPrimary =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-emerald-800 shadow-md hover:bg-emerald-50";
const btnOutline =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-white px-4 py-3 text-sm font-medium text-white hover:bg-white/10";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 py-10 sm:p-6">
      <section className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-md sm:p-8">
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
          দান ও সঞ্চয় — সহজ, স্বচ্ছ, মোবাইল-ফ্রেন্ডলি
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-emerald-50 sm:text-base">
          গ্রামের মানুষের জন্য বাংলায় সরল ইন্টারফেস। আপনার ওয়ালেটে টাকা জমা করুন, ক্যাম্পেইনে দান করুন,
          সব হিসাব এক জায়গায় দেখুন।
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/register" className={btnPrimary}>
            <Sparkles className="h-4 w-4" aria-hidden />
            নতুন অ্যাকাউন্ট
          </Link>
          <Link href="/campaigns" className={btnOutline}>
            <Heart className="h-4 w-4" aria-hidden />
            ক্যাম্পেইন দেখুন
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 sm:p-6">
          <Wallet className="mb-2 h-8 w-8 text-emerald-600" aria-hidden />
          <CardTitle className="text-base">সঞ্চয়</CardTitle>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            বিকাশ, নগদ, রকেট মক পেমেন্টের স্ক্রিনশট জমা দিন। অ্যাডমিন যাচাই করলে ব্যালেন্স যুক্ত হবে।
          </p>
        </Card>
        <Card className="p-4 sm:p-6">
          <Heart className="mb-2 h-8 w-8 text-rose-500" aria-hidden />
          <CardTitle className="text-base">দান</CardTitle>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            সক্রিয় ক্যাম্পেইন বেছে নিয়ে ওয়ালেট থেকে সরাসরি দান করুন।
          </p>
        </Card>
        <Card className="p-4 sm:p-6">
          <Shield className="mb-2 h-8 w-8 text-amber-600" aria-hidden />
          <CardTitle className="text-base">স্বচ্ছতা</CardTitle>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            মোট দান, ক্যাম্পেইন অগ্রগতি ও তহবিল ব্যবহারের রেকর্ড সবার জন্য উন্মুক্ত।
          </p>
        </Card>
      </div>

      <div className="text-center">
        <Link
          href="/transparency"
          className="inline-flex items-center gap-2 rounded-xl text-sm font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
        >
          স্বচ্ছতা পেজ দেখুন
        </Link>
      </div>
    </div>
  );
}

import { AppHeader } from "@/components/AppHeader";
import { NotifyHost } from "@/components/NotifyHost";
import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const bengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-bn",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hopes — দান ও সঞ্চয়",
  description: "গ্রামীণ বাংলাদেশের জন্য সহজ দান ও সঞ্চয় প্ল্যাটফর্ম",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${bengali.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <NotifyHost />
        <AppHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

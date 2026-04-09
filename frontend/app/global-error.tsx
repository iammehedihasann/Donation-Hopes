"use client";

/** রুট লেআউটের বাইরের ত্রটি — নিজস্ব html/body প্রয়োজন */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bn">
      <body className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 font-sans text-zinc-900">
        <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-md">
          <h1 className="text-lg font-bold text-red-700">গুরুতর ত্রটি</h1>
          <p className="mt-2 text-sm text-zinc-600">অ্যাপ লোড করা যায়নি। পেজ রিফ্রেশ করুন।</p>
          {process.env.NODE_ENV === "development" ? (
            <pre className="mt-4 max-h-24 overflow-auto rounded-lg bg-zinc-100 p-2 text-left text-xs">{error.message}</pre>
          ) : null}
          <button
            type="button"
            className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-md"
            onClick={() => reset()}
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </body>
    </html>
  );
}

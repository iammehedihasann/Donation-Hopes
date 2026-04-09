"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center p-6">
      <Card className="w-full p-6 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-600" aria-hidden />
        <CardTitle className="mt-4">কিছু সমস্যা হয়েছে</CardTitle>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          পেজ লোড বা চালানোর সময় ত্রটি হয়েছে। আবার চেষ্টা করুন।
        </p>
        {process.env.NODE_ENV === "development" && error.message ? (
          <pre className="mt-4 max-h-32 overflow-auto rounded-xl bg-zinc-100 p-3 text-left text-xs text-red-800 dark:bg-zinc-900 dark:text-red-300">
            {error.message}
          </pre>
        ) : null}
        <Button type="button" className="mt-6 w-full" onClick={() => reset()} leftIcon={<span aria-hidden>↻</span>}>
          আবার চেষ্টা করুন
        </Button>
      </Card>
    </div>
  );
}

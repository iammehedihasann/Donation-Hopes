"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

/** localStorage থেকে auth পুনরুদ্ধার সম্পন্ন হয়েছে কিনা */
export function useAuthHydrated(): boolean {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const finish = () => setOk(true);
    const p = useAuthStore.persist;
    if (!p) {
      queueMicrotask(finish);
      return;
    }
    if (p.hasHydrated()) {
      queueMicrotask(finish);
      return;
    }
    return p.onFinishHydration(() => finish());
  }, []);

  return ok;
}

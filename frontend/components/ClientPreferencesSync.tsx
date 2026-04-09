"use client";

import { usePreferencesStore } from "@/store/preferencesStore";
import { useEffect } from "react";

export function ClientPreferencesSync() {
  const theme = usePreferencesStore((s) => s.theme);
  const language = usePreferencesStore((s) => s.language);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null;
}


"use client";

import bn from "@/locales/bn.json";
import en from "@/locales/en.json";
import { usePreferencesStore, type Language } from "@/store/preferencesStore";

type Dict = Record<string, unknown>;

function getDict(lang: Language): Dict {
  // JSON import types are inferred; cast through unknown for safe dict access.
  return (lang === "en" ? (en as unknown) : (bn as unknown)) as Dict;
}

function getByPath(dict: Dict, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Dict)) return (acc as Dict)[key];
    return undefined;
  }, dict);
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) => String(params[k] ?? ""));
}

export function useTranslation() {
  const language = usePreferencesStore((s) => s.language);
  const dict = getDict(language);

  function t(key: string, params?: Record<string, string | number>): string {
    const raw = getByPath(dict, key);
    if (typeof raw === "string") return interpolate(raw, params);
    return key; // fallback keeps backward compatibility during migration
  }

  return { t, language };
}


import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "bn" | "en";
export type ThemeMode = "light" | "dark";

type PreferencesState = {
  language: Language;
  theme: ThemeMode;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      language: "bn",
      theme: "light",
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set({ language: get().language === "bn" ? "en" : "bn" }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
    }),
    { name: "hopes-preferences" }
  )
);


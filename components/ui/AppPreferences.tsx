"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { languages, translations, type Language, type TranslationKey } from "@/lib/i18n";

type Theme = "dark" | "light";
type Preferences = {
  language: Language;
  theme: Theme;
  t: (key: TranslationKey) => string;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
};

const defaultLanguage: Language = "es";
const defaultTheme: Theme = "dark";
const languageStorageKey = "matchday-language";
const themeStorageKey = "matchday-theme";

const PreferencesContext = createContext<Preferences | null>(null);

function getStoredLanguage(): Language {
  const storedLanguage = window.localStorage.getItem(languageStorageKey) as Language | null;

  return storedLanguage && storedLanguage in translations ? storedLanguage : defaultLanguage;
}

function getStoredTheme(): Theme {
  const storedTheme = window.localStorage.getItem(themeStorageKey) as Theme | null;

  return storedTheme === "light" || storedTheme === "dark" ? storedTheme : defaultTheme;
}

function applyDocumentPreferences(language: Language, theme: Theme) {
  document.documentElement.lang = language;
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("light", theme === "light");
}

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedLanguage = getStoredLanguage();
      const storedTheme = getStoredTheme();

      setLanguageState(storedLanguage);
      setThemeState(storedTheme);
      applyDocumentPreferences(storedLanguage, storedTheme);
      setHasMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    applyDocumentPreferences(language, theme);
    window.localStorage.setItem(languageStorageKey, language);
    window.localStorage.setItem(themeStorageKey, theme);
  }, [hasMounted, language, theme]);

  const value = useMemo<Preferences>(
    () => ({
      language,
      theme,
      t: (key) => translations[language][key],
      setLanguage: setLanguageState,
      setTheme: setThemeState,
    }),
    [language, theme],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const preferences = useContext(PreferencesContext);

  if (!preferences) {
    throw new Error("usePreferences must be used inside AppPreferencesProvider");
  }

  return preferences;
}

export function Trans({ k }: { k: TranslationKey }) {
  const { t } = usePreferences();

  return <>{t(k)}</>;
}

export function PreferenceControls() {
  const { language, theme, setLanguage, setTheme, t } = usePreferences();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/75 p-2 shadow-sm shadow-black/20 backdrop-blur">
      <label className="sr-only" htmlFor="matchday-language">
        {t("language")}
      </label>
      <select
        id="matchday-language"
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-100 outline-none transition-colors hover:border-zinc-500"
      >
        {languages.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-bold text-amber-100 transition-colors hover:bg-amber-300/20"
        aria-label={t("theme")}
      >
        {theme === "dark" ? "☾" : "☀"} {theme === "dark" ? t("dark") : t("light")}
      </button>
    </div>
  );
}

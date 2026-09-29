import { isLocale, type Locale } from "@/i18n/locales.ts";
import type { StoredCodec } from "./storage.ts";

export type ThemeChoice = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "qg.theme";
export const LOCALE_STORAGE_KEY = "qg.locale";
export const SALARY_HISTORY_STORAGE_KEY = "qg.salary-history.v1";

export const THEME_STORE: StoredCodec<ThemeChoice> = {
  key: THEME_STORAGE_KEY,
  fallback: "system",
  decode: (raw) => (raw === "light" || raw === "dark" ? raw : "system"),
  encode: (choice) => (choice === "system" ? null : choice),
};

export const LOCALE_STORE: StoredCodec<Locale | null> = {
  key: LOCALE_STORAGE_KEY,
  fallback: null,
  decode: (raw) => (isLocale(raw) ? raw : null),
  encode: (locale) => locale,
};

function isList(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

export const SALARY_HISTORY_STORE: StoredCodec<readonly unknown[]> = {
  key: SALARY_HISTORY_STORAGE_KEY,
  fallback: [],
  decode: (raw) => {
    const parsed: unknown = JSON.parse(raw);
    return isList(parsed) ? parsed : [];
  },
  encode: (entries) => JSON.stringify(entries),
};

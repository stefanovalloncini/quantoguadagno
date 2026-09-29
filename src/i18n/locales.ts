export const LOCALES = ["it", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "it";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export type TextDirection = "ltr" | "rtl";

const RTL_LOCALES: ReadonlySet<string> = new Set(["ar", "he", "fa", "ur"]);

export function dirOf(locale: string): TextDirection {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}

export const BCP47_TAG: Record<Locale, string> = {
  it: "it-IT",
  en: "en-GB",
};

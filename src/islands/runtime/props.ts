import type { Locale } from "@/i18n/locales.ts";

export interface IslandProps {
  readonly locale: Locale;
  readonly messages: Record<string, string>;
}

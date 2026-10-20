import { latestVerification } from "@/data/index.ts";
import { dateArticle, type DateArticle } from "@/i18n/articles.ts";
import type { Locale } from "@/i18n/locales.ts";
import { formatDate } from "@/i18n/numbers.ts";
import { hrefFor } from "@/routePaths.ts";

export interface VerifiedLine {
  readonly date: string;
  readonly dateArticle: DateArticle;
  readonly href: string;
}

// The date of the latest data check, linked to the sources page. The article travels with the
// date because Italian elides it before 8 and 11: "l’8 maggio", "il 20 maggio".
export function verifiedLine(locale: Locale): VerifiedLine | null {
  const iso = latestVerification();
  if (iso === null) return null;
  const date = new Date(iso);
  return {
    date: formatDate(date, locale),
    dateArticle: dateArticle(date),
    href: hrefFor("sources", locale),
  };
}

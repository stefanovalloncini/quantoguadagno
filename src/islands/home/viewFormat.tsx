import { useMemo, type ReactNode } from "react";
import { percentArticle, type PercentArticle } from "@/i18n/articles.ts";
import { BCP47_TAG, type Locale } from "@/i18n/locales.ts";
import { formatMoney, formatPercent } from "@/i18n/numbers.ts";
import { useLocale } from "@/i18n/react.tsx";

export interface ViewFormat {
  readonly locale: Locale;
  readonly money: (value: number) => string;
  readonly whole: (value: number) => string;
  readonly signed: (value: number) => string;
  readonly percent: (rate: number) => string;
  readonly article: (rate: number) => PercentArticle;
  readonly list: (parts: readonly string[]) => string;
  readonly capitalize: (text: string) => string;
}

const ITALIAN_AND_BEFORE_E = / e (?=[eEèé])/g;

export function percentDigits(rate: number): number {
  const hundredths = Math.round(rate * 10_000);
  return hundredths % 100 === 0 ? 0 : 2;
}

export function useViewFormat(): ViewFormat {
  const locale = useLocale();
  return useMemo(() => {
    const lists = new Intl.ListFormat(BCP47_TAG[locale], { type: "conjunction" });
    return {
      locale,
      money: (value) => formatMoney(value, locale),
      whole: (value) => formatMoney(value, locale, { integer: true }),
      signed: (value) => formatMoney(value, locale, { sign: "always" }),
      percent: (rate) => formatPercent(rate, locale, percentDigits(rate)),
      article: (rate) => percentArticle(rate * 100),
      list: (parts) => {
        const joined = lists.format(parts);
        return locale === "it" ? joined.replace(ITALIAN_AND_BEFORE_E, " ed ") : joined;
      },
      capitalize: (text) => text.charAt(0).toLocaleUpperCase(BCP47_TAG[locale]) + text.slice(1),
    };
  }, [locale]);
}

export interface AmountProps {
  readonly children: ReactNode;
}

export function Amount({ children }: AmountProps) {
  return <bdi>{children}</bdi>;
}

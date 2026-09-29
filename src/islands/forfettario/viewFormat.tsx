import { useMemo, type ReactNode } from "react";
import { percentArticle, type PercentArticle } from "@/i18n/articles.ts";
import type { Locale } from "@/i18n/locales.ts";
import { formatMoney, formatPercent } from "@/i18n/numbers.ts";
import { useLocale } from "@/i18n/react.tsx";

export interface ViewFormat {
  readonly locale: Locale;
  readonly money: (value: number) => string;
  readonly whole: (value: number) => string;
  readonly percent: (rate: number) => string;
  readonly article: (rate: number) => PercentArticle;
}

function percentDigits(rate: number): number {
  const hundredths = Math.round(rate * 10_000);
  return hundredths % 100 === 0 ? 0 : 2;
}

export function useViewFormat(): ViewFormat {
  const locale = useLocale();
  return useMemo(
    () => ({
      locale,
      money: (value) => formatMoney(value, locale),
      whole: (value) => formatMoney(value, locale, { integer: true }),
      percent: (rate) => formatPercent(rate, locale, percentDigits(rate)),
      article: (rate) => percentArticle(rate * 100),
    }),
    [locale],
  );
}

export interface AmountProps {
  readonly children: ReactNode;
}

export function Amount({ children }: AmountProps) {
  return <bdi>{children}</bdi>;
}

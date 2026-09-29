import type { Locale } from "@/i18n/locales.ts";
import { formatPercent } from "@/i18n/numbers.ts";

const MINUS = String.fromCharCode(0x2212);

export function signedPercent(rate: number, locale: Locale, digits: number): string {
  const text = formatPercent(Math.abs(rate), locale, digits);
  const visible = Math.abs(rate) >= 0.5 * 10 ** -(digits + 2);
  if (!visible) return text;
  return rate < 0 ? `${MINUS}${text}` : `+${text}`;
}

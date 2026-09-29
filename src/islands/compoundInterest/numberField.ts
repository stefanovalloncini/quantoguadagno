import { useEffect, useRef, useState } from "react";
import { BCP47_TAG, type Locale } from "@/i18n/locales.ts";

const plainFormatters = new Map<Locale, Intl.NumberFormat>();

function plainFormatter(locale: Locale): Intl.NumberFormat {
  let formatter = plainFormatters.get(locale);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat(BCP47_TAG[locale], {
      useGrouping: false,
      maximumFractionDigits: 4,
    });
    plainFormatters.set(locale, formatter);
  }
  return formatter;
}

export function formatYearsText(value: number): string {
  return Number.isFinite(value) ? String(Math.trunc(value)) : "";
}

export function formatPercentPoints(value: number, locale: Locale): string {
  if (!Number.isFinite(value)) return "";
  const rounded = Math.round(value * 100 * 10_000) / 10_000;
  return plainFormatter(locale).format(rounded);
}

export interface NumberField {
  readonly text: string;
  readonly onValueChange: (raw: string) => void;
  readonly onFocus: () => void;
  readonly onBlur: () => void;
}

export function useNumberField(
  value: number,
  format: (value: number) => string,
  parse: (raw: string) => number | null,
  commit: (value: number) => void,
): NumberField {
  const [text, setText] = useState(() => format(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(format(value));
  }, [value, format]);

  const onValueChange = (raw: string) => {
    setText(raw);
    const parsed = parse(raw);
    commit(parsed ?? Number.NaN);
  };

  const onFocus = () => {
    focused.current = true;
  };

  const onBlur = () => {
    focused.current = false;
    const parsed = parse(text);
    if (parsed !== null) setText(format(parsed));
  };

  return { text, onValueChange, onFocus, onBlur };
}

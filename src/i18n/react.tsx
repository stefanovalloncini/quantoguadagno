import { createContext, Fragment, useCallback, useContext, useMemo, type ReactNode } from "react";
import { formatMessage, type MessageValue, type MessageValues } from "./format.ts";
import {
  formatDate,
  formatMoney,
  formatNumber,
  formatPercent,
  type DateStyle,
  type FormatMoneyOptions,
} from "./numbers.ts";
import type { Locale } from "./locales.ts";

interface I18nContextValue {
  readonly locale: Locale;
  readonly messages: Record<string, string>;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  readonly locale: Locale;
  readonly messages: Record<string, string>;
  readonly children: ReactNode;
}

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  const value = useMemo<I18nContextValue>(() => ({ locale, messages }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18nContext(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useT, useLocale and useFormat must be used within an I18nProvider");
  }
  return ctx;
}

export function useLocale(): Locale {
  return useI18nContext().locale;
}

export type TranslateFn = (key: string, values?: MessageValues) => string;

export function useT(): TranslateFn {
  const { locale, messages } = useI18nContext();
  return useCallback(
    (key: string, values?: MessageValues) => {
      const source = messages[key];
      if (source === undefined) {
        throw new Error(`Missing message for key "${key}"`);
      }
      return formatMessage(source, locale, values);
    },
    [locale, messages],
  );
}

export type RichValue = MessageValue | ReactNode;
export type RichValues = Readonly<Record<string, RichValue>>;
export type RichTranslateFn = (key: string, values: RichValues) => ReactNode;

const SLOT_MARK = String.fromCharCode(0xe000);
const SLOT_PATTERN = new RegExp(`${SLOT_MARK}(\\d+)${SLOT_MARK}`, "g");

function isPlainValue(value: RichValue): value is MessageValue {
  return typeof value === "string" || typeof value === "number";
}

export function interleave(text: string, slots: readonly ReactNode[]): ReactNode {
  if (slots.length === 0) return text;
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(SLOT_PATTERN)) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(slots[Number(match[1])]);
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.map((part, index) => <Fragment key={index}>{part}</Fragment>);
}

export function useRichT(): RichTranslateFn {
  const t = useT();
  return useCallback(
    (key: string, values: RichValues) => {
      const slots: ReactNode[] = [];
      const plain: MessageValues = {};
      for (const [name, value] of Object.entries(values)) {
        if (isPlainValue(value)) {
          plain[name] = value;
          continue;
        }
        plain[name] = `${SLOT_MARK}${String(slots.length)}${SLOT_MARK}`;
        slots.push(value);
      }
      return interleave(t(key, plain), slots);
    },
    [t],
  );
}

export interface FormatApi {
  readonly money: (value: number, options?: FormatMoneyOptions) => string;
  readonly number: (value: number, fractionDigits?: number) => string;
  readonly percent: (value: number, fractionDigits?: number) => string;
  readonly date: (value: Date, style?: DateStyle) => string;
}

export function useFormat(): FormatApi {
  const { locale } = useI18nContext();
  return useMemo<FormatApi>(
    () => ({
      money: (value, options) => formatMoney(value, locale, options),
      number: (value, fractionDigits) => formatNumber(value, locale, fractionDigits),
      percent: (value, fractionDigits) => formatPercent(value, locale, fractionDigits),
      date: (value, style) => formatDate(value, locale, style),
    }),
    [locale],
  );
}

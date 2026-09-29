import type { FocusEvent } from "react";
import type { Locale } from "@/i18n/locales.ts";
import { formatAmountInput, parseMoneyInput } from "@/i18n/numbers.ts";
import { useLocale } from "@/i18n/react.tsx";
import { afterPointerRelease, trackPointer } from "./pointer.ts";
import { TextInput, type InputWidth, type TextInputProps } from "./TextInput.tsx";

const EURO = "€";

export type MoneyInputProps = Omit<
  TextInputProps,
  "inputMode" | "unit" | "unitPosition" | "width"
> & {
  readonly width?: Exclude<InputWidth, "full">;
};

export function tidyMoneyText(raw: string, locale: Locale): string {
  const value = parseMoneyInput(raw, locale);
  return value === null ? raw : formatAmountInput(value, locale);
}

export function MoneyInput({
  onBlur,
  onFocus,
  onValueChange,
  value,
  width = "money",
  ...rest
}: MoneyInputProps) {
  const locale = useLocale();
  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    trackPointer();
    onFocus?.(event);
  };
  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const tidy = tidyMoneyText(value, locale);
    if (tidy !== value) {
      afterPointerRelease(() => {
        onValueChange(tidy);
      });
    }
    onBlur?.(event);
  };
  return (
    <TextInput
      {...rest}
      value={value}
      onValueChange={onValueChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      inputMode="decimal"
      width={width}
      unit={EURO}
      unitPosition={locale === "it" ? "end" : "start"}
    />
  );
}

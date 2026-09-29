import { useEffect, useState } from "react";
import { parseMoneyInput } from "@/i18n/numbers.ts";
import type { TranslateFn } from "@/i18n/react.tsx";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";
import type { AfterTone, FieldMessages } from "./Field.tsx";
import { afterPointerRelease, trackPointer } from "./pointer.ts";

export const TYPING_PAUSE_MS = 700;
const MONTHLY_NOTE_MIN = 500;
const MONTHLY_NOTE_MAX = 6_000;

export interface AmountAfter {
  readonly text: string;
  readonly tone: AfterTone;
}

export interface Typing {
  readonly focused: boolean;
  readonly editing: boolean;
  readonly settled: boolean;
  readonly onType: () => void;
  readonly onFocus: () => void;
  readonly onBlur: () => void;
}

export function useTyping(value: string): Typing {
  const [focused, setFocused] = useState(false);
  const [edited, setEdited] = useState(false);
  const [settled, setSettled] = useState(true);

  useEffect(() => {
    if (settled) return undefined;
    const timer = window.setTimeout(() => {
      setSettled(true);
    }, TYPING_PAUSE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [value, settled]);

  return {
    focused,
    editing: focused && edited,
    settled,
    onType: () => {
      setEdited(true);
      setSettled(false);
    },
    onFocus: () => {
      trackPointer();
      setFocused(true);
      setEdited(false);
    },
    onBlur: () => {
      afterPointerRelease(() => {
        setFocused(false);
        setEdited(false);
        setSettled(true);
      });
    },
  };
}

export interface AmountAfterInput {
  readonly raw: string;
  readonly typing: Pick<Typing, "editing">;
  readonly count: number;
  readonly keyPrefix: string;
  readonly t: TranslateFn;
  readonly f: ViewFormat;
}

export function amountAfter({
  raw,
  typing,
  count,
  keyPrefix,
  t,
  f,
}: AmountAfterInput): AmountAfter | null {
  const value = parseMoneyInput(raw, f.locale);
  if (value === null || value <= 0) return null;
  if (typing.editing) {
    return { tone: "quiet", text: t(`${keyPrefix}.readAs`, { amount: f.money(value) }) };
  }
  if (value >= MONTHLY_NOTE_MIN && value < MONTHLY_NOTE_MAX) {
    const amount = (figure: number) =>
      Number.isInteger(figure) ? f.whole(figure) : f.money(figure);
    return {
      tone: "note",
      text: t(`${keyPrefix}.monthlyNote`, {
        monthly: amount(value),
        count,
        annual: amount(value * count),
      }),
    };
  }
  return {
    tone: "quiet",
    text: t(`${keyPrefix}.monthly`, { amount: f.money(value / count), count }),
  };
}

export function afterMessages(after: AmountAfter | null): FieldMessages {
  if (after === null) return {};
  return { after: after.text, afterTone: after.tone };
}

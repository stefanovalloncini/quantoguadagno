import { useEffect, useRef, useState } from "react";

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

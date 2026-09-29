import { useLayoutEffect, useRef, type RefObject } from "react";
import { findTypedControls, type FormControlValue } from "./formControls.ts";

export type TypedControlListener = (name: string, value: FormControlValue) => void;

export function useHydratedFormValues<E extends HTMLElement>(
  containerRef: RefObject<E | null>,
  onValueTyped: TypedControlListener,
): void {
  const ran = useRef(false);

  useLayoutEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const container = containerRef.current;
    if (container === null) return;
    for (const control of findTypedControls(container)) {
      onValueTyped(control.name, control.value);
    }
  }, [containerRef, onValueTyped]);
}

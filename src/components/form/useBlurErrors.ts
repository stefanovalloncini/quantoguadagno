import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { afterPointerRelease, trackPointer } from "./pointer.ts";

export type ErrorMap<K extends string, E> = Readonly<Partial<Record<K, E>>>;

export interface BlurErrors<K extends string, E> {
  readonly shown: ErrorMap<K, E>;
  readonly onFocus: () => void;
  readonly onBlur: (field: K) => void;
  readonly touch: (fields: readonly K[]) => void;
}

function noFields<K extends string>(): ReadonlySet<K> {
  return new Set<K>();
}

export function useBlurErrors<K extends string, E>(current: ErrorMap<K, E>): BlurErrors<K, E> {
  const latest = useRef(current);
  const [touched, setTouched] = useState<ReadonlySet<K>>(noFields);

  useEffect(() => {
    latest.current = current;
  }, [current]);

  const onFocus = useCallback(() => {
    trackPointer();
  }, []);

  const onBlur = useCallback((field: K) => {
    afterPointerRelease(() => {
      const invalid = latest.current[field] !== undefined;
      setTouched((previous) => {
        if (previous.has(field) === invalid) return previous;
        const next = new Set(previous);
        if (invalid) next.add(field);
        else next.delete(field);
        return next;
      });
    });
  }, []);

  const touch = useCallback((fields: readonly K[]) => {
    setTouched((previous) => {
      const missing = fields.filter((field) => !previous.has(field));
      return missing.length === 0 ? previous : new Set([...previous, ...missing]);
    });
  }, []);

  const shown = useMemo(() => {
    const visible: Partial<Record<K, E>> = {};
    for (const field of touched) {
      const error = current[field];
      if (error !== undefined) visible[field] = error;
    }
    return visible;
  }, [touched, current]);

  return { shown, onFocus, onBlur, touch };
}

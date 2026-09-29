import { useCallback, useState, type Dispatch, type SetStateAction } from "react";

export interface ShownResult<S, R> {
  readonly result: R | null;
  readonly stale: boolean;
  readonly change: (next: (previous: S) => S) => void;
}

export function useShownResult<S, R>(
  current: R | null,
  setState: Dispatch<SetStateAction<S>>,
): ShownResult<S, R> {
  const [lastShown, setLastShown] = useState<R | null>(null);

  const change = useCallback(
    (next: (previous: S) => S) => {
      setLastShown((previous) => current ?? previous);
      setState(next);
    },
    [current, setState],
  );

  const result = current ?? lastShown;
  return { result, stale: current === null && result !== null, change };
}

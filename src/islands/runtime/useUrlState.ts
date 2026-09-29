import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { QuerySpec } from "@/queryParams.ts";
import { hasQueryValues, readQuery, writeQuery, type QueryValues } from "./query.ts";
import { signalRestored } from "./restoreSignal.ts";

export const URL_WRITE_DELAY_MS = 250;

export interface UrlStateConfig<S> {
  readonly params: QuerySpec;
  readonly initial: S;
  readonly fromQuery: (values: QueryValues, initial: S) => S;
  readonly toQuery: (state: S) => QueryValues;
  readonly writeDelayMs?: number;
}

export function rawQueryState(params: QuerySpec): UrlStateConfig<QueryValues> {
  return {
    params,
    initial: {},
    fromQuery: (values) => values,
    toQuery: (state) => state,
  };
}

function replaceQuery(query: string): void {
  const { pathname, hash } = window.location;
  const search = query === "" ? "" : `?${query}`;
  window.history.replaceState(window.history.state, "", `${pathname}${search}${hash}`);
}

export function useUrlState<S>(
  config: UrlStateConfig<S>,
): readonly [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState<S>(config.initial);
  const restored = useRef(false);
  const firstWriteSkipped = useRef(false);
  const lastWritten = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const values = readQuery(window.location.search, config.params);
    const next = hasQueryValues(values) ? config.fromQuery(values, config.initial) : config.initial;
    lastWritten.current = writeQuery(config.toQuery(next), config.params);
    if (next !== config.initial) setState(next);
    signalRestored();
  }, [config]);

  useEffect(() => {
    if (!firstWriteSkipped.current) {
      firstWriteSkipped.current = true;
      return undefined;
    }
    const query = writeQuery(config.toQuery(state), config.params);
    if (query === lastWritten.current) return undefined;
    const timer = window.setTimeout(() => {
      lastWritten.current = query;
      replaceQuery(query);
    }, config.writeDelayMs ?? URL_WRITE_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [config, state]);

  return [state, setState];
}

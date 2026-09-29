import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  decodeStored,
  readStored,
  subscribeStored,
  writeStored,
  type StoredCodec,
} from "./storage.ts";

export type StoredUpdate<T> = T | ((current: T) => T);

function emptyServerSnapshot(): null {
  return null;
}

function isUpdater<T>(update: StoredUpdate<T>): update is (current: T) => T {
  return typeof update === "function";
}

export function useStoredState<T>(
  codec: StoredCodec<T>,
): readonly [T, (update: StoredUpdate<T>) => void] {
  const { key } = codec;
  const subscribe = useCallback((listener: () => void) => subscribeStored(key, listener), [key]);
  const getSnapshot = useCallback(() => readStored(key), [key]);
  const raw = useSyncExternalStore(subscribe, getSnapshot, emptyServerSnapshot);
  const value = useMemo(() => decodeStored(codec, raw), [codec, raw]);
  const setValue = useCallback(
    (update: StoredUpdate<T>) => {
      const next = isUpdater(update) ? update(decodeStored(codec, readStored(key))) : update;
      writeStored(key, codec.encode(next));
    },
    [codec, key],
  );
  return [value, setValue];
}

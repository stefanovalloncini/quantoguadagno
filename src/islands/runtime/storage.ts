export interface StoredCodec<T> {
  readonly key: string;
  readonly fallback: T;
  readonly decode: (raw: string) => T;
  readonly encode: (value: T) => string | null;
}

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();
const unwritable = new Map<string, string | null>();
let watchingOtherTabs = false;

export function decodeStored<T>(codec: StoredCodec<T>, raw: string | null): T {
  if (raw === null) return codec.fallback;
  try {
    return codec.decode(raw);
  } catch {
    return codec.fallback;
  }
}

export function readStored(key: string): string | null {
  if (unwritable.has(key)) return unwritable.get(key) ?? null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
    unwritable.delete(key);
  } catch {
    unwritable.set(key, value);
  }
  notify(key);
}

function notify(key: string): void {
  for (const listener of [...(listeners.get(key) ?? [])]) listener();
}

function onStorage(event: StorageEvent): void {
  if (event.key === null) {
    for (const key of [...listeners.keys()]) notify(key);
    return;
  }
  notify(event.key);
}

export function subscribeStored(key: string, listener: Listener): () => void {
  const keyListeners = listeners.get(key) ?? new Set<Listener>();
  keyListeners.add(listener);
  listeners.set(key, keyListeners);
  if (!watchingOtherTabs) {
    window.addEventListener("storage", onStorage);
    watchingOtherTabs = true;
  }
  return () => {
    keyListeners.delete(listener);
    if (keyListeners.size === 0) listeners.delete(key);
    if (listeners.size === 0 && watchingOtherTabs) {
      window.removeEventListener("storage", onStorage);
      watchingOtherTabs = false;
    }
  };
}

import { Suspense, useSyncExternalStore, type ReactNode } from "react";

function subscribeNever(): () => void {
  return () => undefined;
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

export interface ClientSuspenseProps {
  readonly fallback: ReactNode;
  readonly children: ReactNode;
}

export function ClientSuspense({ fallback, children }: ClientSuspenseProps) {
  const hydrated = useHydrated();
  if (!hydrated) return fallback;
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

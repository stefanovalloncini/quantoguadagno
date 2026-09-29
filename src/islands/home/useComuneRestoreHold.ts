import { useLayoutEffect, useRef } from "react";
import { readQuery } from "@/islands/runtime/query.ts";
import { RESTORE_PENDING_ATTRIBUTE, signalRestored } from "@/islands/runtime/restoreSignal.ts";
import { EMPLOYEE_PARAMS } from "@/queryParams.ts";
import { queryComune } from "./url.ts";
import type { ComuneLookup } from "./useComune.ts";

function sharedLinkNamesComune(): boolean {
  if (typeof window === "undefined") return false;
  return queryComune(readQuery(window.location.search, EMPLOYEE_PARAMS).k) !== null;
}

export function useComuneRestoreHold(comune: string | null, lookup: ComuneLookup): void {
  const holding = useRef<boolean | null>(null);

  useLayoutEffect(() => {
    holding.current ??= sharedLinkNamesComune();
    if (!holding.current) return;
    if (comune === null || lookup.status === "loading") {
      document.documentElement.setAttribute(RESTORE_PENDING_ATTRIBUTE, "");
      return;
    }
    holding.current = false;
    signalRestored();
  }, [comune, lookup.status]);
}

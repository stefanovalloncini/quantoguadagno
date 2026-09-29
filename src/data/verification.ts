import type { SupportedYear } from "./registry.ts";
import type { IsoDate } from "./types.ts";
import { VERIFICATION } from "./verificationSnapshot.ts";

export function latestVerification(): IsoDate | null {
  return VERIFICATION.latest;
}

export function countUnverified(year: SupportedYear, prefixes: readonly string[]): number {
  const keys = VERIFICATION.unverifiedByYear[String(year)] ?? [];
  return keys.filter((key) => prefixes.some((prefix) => key.startsWith(prefix))).length;
}

export function isComuniDatasetVerified(): boolean {
  return VERIFICATION.comuniVerified;
}

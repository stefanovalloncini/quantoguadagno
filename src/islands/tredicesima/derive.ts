import type { TredicesimaResult } from "@/domain/index.ts";

export interface TredicesimaDerived {
  readonly showCombinedTotal: boolean;
}

export function deriveTredicesima(result: TredicesimaResult): TredicesimaDerived {
  return { showCombinedTotal: result.extraMonths > 1 };
}

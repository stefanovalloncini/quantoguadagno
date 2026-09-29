import type { AdjustedValue } from "@/domain/index.ts";
import type { AdjustedEntry } from "./derive.ts";

export interface RealRow extends AdjustedEntry {
  readonly adjusted: AdjustedValue;
}

export type PurchasingPower =
  | { readonly kind: "none" }
  | { readonly kind: "single"; readonly row: AdjustedEntry }
  | {
      readonly kind: "change";
      readonly first: RealRow;
      readonly last: RealRow;
      readonly realChange: number;
      readonly nominalChange: number;
    };

function hasReal(row: AdjustedEntry): row is RealRow {
  return row.adjusted !== null && row.adjusted.adjusted > 0;
}

export function purchasingPower(rows: readonly AdjustedEntry[]): PurchasingPower {
  const latest = rows.at(-1);
  if (latest === undefined) return { kind: "none" };
  const real = rows.filter(hasReal);
  const first = real[0];
  const last = real.at(-1);
  if (first === undefined || last === undefined || first.entry.year === last.entry.year) {
    return { kind: "single", row: latest };
  }
  return {
    kind: "change",
    first,
    last,
    realChange: last.adjusted.adjusted / first.adjusted.adjusted - 1,
    nominalChange:
      first.entry.grossAnnual > 0 ? last.entry.grossAnnual / first.entry.grossAnnual - 1 : 0,
  };
}

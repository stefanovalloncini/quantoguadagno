import { countUnverified, isComuniDatasetVerified, type RegionCode } from "@/data/index.ts";
import type { EmployeeValues } from "./state.ts";

const ALWAYS_USED = ["irpef.", "inps.employee.", "deductions."];

function prefixesFor(values: EmployeeValues): readonly string[] {
  const region: RegionCode = values.regionCode;
  return [
    ...ALWAYS_USED,
    `regions.${region}`,
    ...(values.fringeBenefits === null ? [] : ["fringe."]),
    ...(values.premioRisultato === null ? [] : ["pdr"]),
    ...(values.specialConditions?.madreLavoratrice === undefined ? [] : ["madreLavoratrice"]),
    ...(values.specialConditions?.regimeImpatriati === undefined ? [] : ["impatriati"]),
  ];
}

export function valuesToVerify(values: EmployeeValues): number {
  const params = countUnverified(values.taxYear, prefixesFor(values));
  const comune = values.comune !== null && !isComuniDatasetVerified() ? 1 : 0;
  return params + comune;
}

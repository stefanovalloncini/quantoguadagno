import {
  countUnverified,
  isComuniDatasetVerified,
  type Comune,
  type SupportedYear,
} from "@/data/index.ts";
import { ACTIVITY_COEFFICIENTS } from "@/data/forfettarioActivities.ts";
import type { Gestion } from "@/domain/inpsGestioni.ts";
import {
  calculateOrdinario,
  compareWithForfettario,
  type OrdinarioBreakdown,
  type OrdinarioInput,
  type RegimeComparison,
} from "@/domain/ordinario.ts";
import {
  municipalInput,
  municipalSource,
  selectedComune,
  type MunicipalSource,
} from "@/islands/home/municipal.ts";
import type { OrdinarioValues } from "./state.ts";

export interface OrdinarioResult {
  readonly values: OrdinarioValues;
  readonly comune: Comune | null;
  readonly municipal: MunicipalSource;
  readonly input: OrdinarioInput;
  readonly breakdown: OrdinarioBreakdown;
  readonly coefficient: number;
  readonly comparison: RegimeComparison;
}

export function ordinarioInput(
  values: OrdinarioValues,
  municipal: MunicipalSource,
): OrdinarioInput {
  return {
    revenue: values.revenue,
    costs: values.costs,
    taxYear: values.taxYear,
    regionCode: values.regionCode,
    municipalTaxRate: municipalInput(municipal),
    gestion: values.gestion,
    hasOtherPension: values.hasOtherPension,
    mesiAttivita: values.months,
    cassaManualAmount: values.cassaAmount,
  };
}

export function computeOrdinario(values: OrdinarioValues, comune: Comune | null): OrdinarioResult {
  const selected = selectedComune(values.comune, comune);
  const municipal = municipalSource(selected, values.municipalRate, values.taxYear);
  const input = ordinarioInput(values, municipal);
  const breakdown = calculateOrdinario(input);
  const coefficient = ACTIVITY_COEFFICIENTS[values.activity].coefficient;
  return {
    values,
    comune: selected,
    municipal,
    input,
    breakdown,
    coefficient,
    comparison: compareWithForfettario(input, breakdown, {
      coefficient,
      startup: values.startup,
    }),
  };
}

const TAX_PREFIXES = ["irpef.brackets", "irpef.selfEmployedDeduction"];
const MINIMUM_PREFIXES = [
  "inps.autonomi.minimale",
  "inps.autonomi.maternity",
  "inps.firstBand",
  "inps.massimale",
];

const GESTION_PREFIXES: Readonly<Record<Gestion, readonly string[]>> = {
  "gestione-separata": ["inps.gestioneSeparata.rates", "inps.massimale"],
  artigiani: ["inps.artigiani.", ...MINIMUM_PREFIXES],
  commercianti: ["inps.commercianti.", ...MINIMUM_PREFIXES],
  "cassa-professionale": [],
};

export interface TrustScope {
  readonly taxYear: SupportedYear;
  readonly gestion: Gestion;
  readonly regionCode: string;
  readonly withComune: boolean;
}

export function ordinarioValuesToVerify(scope: TrustScope): number {
  const prefixes = [
    ...TAX_PREFIXES,
    ...GESTION_PREFIXES[scope.gestion],
    `regions.${scope.regionCode}`,
  ];
  const comuni = scope.withComune && !isComuniDatasetVerified() ? 1 : 0;
  return countUnverified(scope.taxYear, prefixes) + comuni;
}

import {
  CCNL_IDS,
  CCNL_PRESETS,
  CCNL_TABLE,
  COMUNI_YEARS,
  comuniCount,
  FOI_BASE_YEAR,
  FOI_INDEX,
  LATEST_SUPPORTED_YEAR,
  REGION_CODES,
  REGION_INFO,
  REGIONS_LIST,
  SUPPORTED_YEARS,
  type CcnlId,
  type IsoDate,
  type ParamKey,
  type Source,
  type SupportedYear,
} from "@/data/index.ts";
import {
  DATASETS,
  daVerificare,
  listParameters,
  type Dataset,
  type ParameterListing,
} from "@/data/fonti.ts";
import { numberText, yearSpanText } from "@/islands/prose/phrases.ts";
import { describeParameter, parameterName, type Formatting, type RegionKey } from "./describe.ts";

export type CheckState =
  | { readonly kind: "verified"; readonly date: IsoDate }
  | { readonly kind: "retrieved"; readonly date: IsoDate }
  | { readonly kind: "missing" };

export type RowStatus = "todo" | "provisional" | undefined;

export interface SourceRow {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly years: string;
  readonly source: Source;
  readonly check: CheckState;
  readonly status: RowStatus;
}

export interface SourceGroup {
  readonly id: string;
  readonly label: string;
  readonly rows: readonly SourceRow[];
}

type GroupId =
  | "irpef"
  | "inpsEmployee"
  | "deductions"
  | "regional"
  | "benefits"
  | "special"
  | "employer"
  | "selfEmployed"
  | "naspi";

const REGION_KEYS: readonly RegionKey[] = REGIONS_LIST.map(
  (region) => `regions.${region.code}` as const,
);

export const PARAMETER_GROUPS: readonly {
  readonly id: GroupId;
  readonly keys: readonly ParamKey[];
}[] = [
  {
    id: "irpef",
    keys: [
      "irpef.brackets",
      "irpef.workDeduction",
      "irpef.selfEmployedDeduction",
      "irpef.taxWedgeCut",
      "irpef.trattamentoIntegrativo",
    ],
  },
  {
    id: "inpsEmployee",
    keys: [
      "inps.employee.rate",
      "inps.employee.rateAboveFirstBand",
      "inps.firstBand",
      "inps.aboveFirstBandSurcharge",
      "inps.massimale",
      "inps.employee.apprenticeRate",
      "inps.employee.publicRate",
      "inps.employee.publicRateAboveFirstBand",
      "inps.employee.cigsRate",
      "inps.employee.exemption2024",
    ],
  },
  {
    id: "deductions",
    keys: [
      "deductions.spouse",
      "deductions.children",
      "deductions.otherFamily",
      "deductions.dependentIncomeLimit",
      "deductions.expenses",
      "deductions.expensePhaseOut",
      "deductions.expenseCap",
      "deductions.expenseReduction",
      "deductions.pensionFund",
    ],
  },
  { id: "regional", keys: REGION_KEYS },
  {
    id: "benefits",
    keys: [
      "pdr",
      "fringe.welfare",
      "fringe.mealVouchers.electronic",
      "fringe.mealVouchers.paper",
      "fringe.healthInsurance",
      "fringe.companyCar.powertrain",
      "fringe.companyCar.co2",
      "fringe.companyCar.conventionalKm",
    ],
  },
  {
    id: "special",
    keys: ["madreLavoratrice", "madreLavoratrice.maxMonthlyExemption", "impatriati"],
  },
  { id: "employer", keys: ["employer.inps", "employer.otherCosts", "tfr"] },
  {
    id: "selfEmployed",
    keys: [
      "forfettario.limits",
      "forfettario.taxRates",
      "forfettario.coefficients",
      "forfettario.concurrentEmployeeIncomeLimit",
      "inps.autonomi.forfettarioReduction",
      "inps.autonomi.newRegistrantReduction",
      "inps.autonomi.minimale",
      "inps.artigiani.rate",
      "inps.artigiani.rateAboveFirstBand",
      "inps.commercianti.rate",
      "inps.commercianti.rateAboveFirstBand",
      "inps.autonomi.maternity",
      "inps.artigiani.minimumContribution",
      "inps.commercianti.minimumContribution",
      "inps.autonomi.massimaleAnte1996",
      "inps.gestioneSeparata.rates",
      "inps.gestioneSeparata.minimale",
    ],
  },
  { id: "naspi", keys: ["naspi.soglia", "naspi.massimale", "naspi.rules"] },
];

const LISTING = new Map<ParamKey, ParameterListing>(
  listParameters().map((listing) => [listing.key, listing]),
);

function listingFor(key: ParamKey): ParameterListing {
  const listing = LISTING.get(key);
  if (listing === undefined) throw new Error(`Parameter ${key} is not in the registry listing`);
  return listing;
}

function yearEntry(listing: ParameterListing, year: SupportedYear) {
  const entry = listing.years.find((candidate) => candidate.year === year);
  if (entry === undefined)
    throw new Error(`Parameter ${listing.key} has no value for ${String(year)}`);
  return entry;
}

function sameEntry(a: { from: IsoDate; source: Source }, b: { from: IsoDate; source: Source }) {
  return a.from === b.from && a.source.ref === b.source.ref;
}

function yearsSharingEntry(listing: ParameterListing, year: SupportedYear): readonly number[] {
  const chosen = yearEntry(listing, year);
  return listing.years.filter((entry) => sameEntry(entry, chosen)).map((entry) => entry.year);
}

export function checkOf(source: Source): CheckState {
  if (source.verified !== undefined) return { kind: "verified", date: source.verified };
  if (source.retrieved !== undefined) return { kind: "retrieved", date: source.retrieved };
  return { kind: "missing" };
}

function regionName(key: RegionKey): string {
  const code = REGION_CODES.find((candidate) => key === `regions.${candidate}`);
  if (code === undefined) throw new Error(`Unknown region key ${key}`);
  return REGION_INFO[code].name;
}

function parameterRows(key: ParamKey, year: SupportedYear, f: Formatting): readonly SourceRow[] {
  const listing = listingFor(key);
  const entry = yearEntry(listing, year);
  const years = yearSpanText(yearsSharingEntry(listing, year));
  const check = checkOf(entry.source);
  const status: RowStatus = check.kind === "verified" ? undefined : "todo";
  return describeParameter(key, entry.value, f, regionName).map((display, index) => ({
    id: `${key}-${String(index)}`,
    label: display.label,
    value: display.value,
    years,
    source: entry.source,
    check,
    status,
  }));
}

function groupLabel(id: GroupId, f: Formatting): string {
  return f.t(`sources.group.${id}`);
}

export function parameterTable(year: SupportedYear, f: Formatting): readonly SourceGroup[] {
  return PARAMETER_GROUPS.map((group) => ({
    id: group.id,
    label: groupLabel(group.id, f),
    rows: group.keys.flatMap((key) => parameterRows(key, year, f)),
  }));
}

export function keysThatDiffer(
  year: SupportedYear,
  comparedTo: SupportedYear,
): readonly ParamKey[] {
  return PARAMETER_GROUPS.flatMap((group) =>
    group.keys.filter((key) => {
      const listing = listingFor(key);
      return !sameEntry(yearEntry(listing, year), yearEntry(listing, comparedTo));
    }),
  );
}

export function changedParameterTable(
  year: SupportedYear,
  comparedTo: SupportedYear,
  f: Formatting,
): readonly SourceGroup[] {
  const changed = new Set(keysThatDiffer(year, comparedTo));
  return PARAMETER_GROUPS.map((group) => ({
    id: group.id,
    label: groupLabel(group.id, f),
    rows: group.keys
      .filter((key) => changed.has(key))
      .flatMap((key) => parameterRows(key, year, f)),
  })).filter((group) => group.rows.length > 0);
}

export interface ParameterCounts {
  readonly total: number;
  readonly verified: number;
  readonly toVerify: number;
}

export function parameterCounts(year: SupportedYear): ParameterCounts {
  const keys = PARAMETER_GROUPS.flatMap((group) => group.keys);
  const verified = keys.filter(
    (key) => yearEntry(listingFor(key), year).source.verified !== undefined,
  ).length;
  return { total: keys.length, verified, toVerify: keys.length - verified };
}

type DatasetKind =
  | { readonly kind: "foi" }
  | { readonly kind: "comuni" }
  | { readonly kind: "ccnl"; readonly id: CcnlId; readonly part: "preavviso" | "mensilita" };

const CCNL_DATASET_KEY = /^ccnl\.(.+)\.(preavviso|mensilita)$/;

function datasetKind(key: string): DatasetKind {
  if (key === "inflation.foi") return { kind: "foi" };
  if (key === "comuni.addizionaleComunale") return { kind: "comuni" };
  const match = CCNL_DATASET_KEY.exec(key);
  const id = CCNL_IDS.find((candidate) => candidate === match?.[1]);
  const part = match?.[2];
  if (id !== undefined && (part === "preavviso" || part === "mensilita")) {
    return { kind: "ccnl", id, part };
  }
  throw new Error(`Unknown dataset ${key}`);
}

function totalComuni(): number {
  return REGION_CODES.reduce((sum, code) => sum + comuniCount(code), 0);
}

function datasetYears(kind: DatasetKind): readonly number[] {
  if (kind.kind === "foi") return FOI_INDEX.map((point) => point.year);
  if (kind.kind === "comuni") return COMUNI_YEARS;
  return SUPPORTED_YEARS;
}

function datasetLabel(kind: DatasetKind, f: Formatting): string {
  if (kind.kind !== "ccnl") return f.t(`sources.dataset.${kind.kind}`);
  return f.t(`sources.dataset.ccnl.${kind.part}`, { contract: CCNL_TABLE[kind.id].label });
}

function datasetValue(kind: DatasetKind, f: Formatting): string {
  if (kind.kind === "foi") return f.t("sources.dataset.foi.value", { base: FOI_BASE_YEAR });
  if (kind.kind === "comuni") {
    return f.t("sources.dataset.comuni.value", { count: numberText(totalComuni(), f.locale, 0) });
  }
  if (kind.part === "preavviso") return f.t("sources.dataset.ccnl.preavviso.value");
  return f.t("sources.dataset.ccnl.mensilita.value", {
    count: CCNL_PRESETS[kind.id].paymentFrequency,
  });
}

function datasetStatus(kind: DatasetKind, check: CheckState): RowStatus {
  if (check.kind !== "verified") return "todo";
  const latest = FOI_INDEX[FOI_INDEX.length - 1];
  return kind.kind === "foi" && latest?.provisional === true ? "provisional" : undefined;
}

function datasetRow(dataset: Dataset, f: Formatting): SourceRow {
  const kind = datasetKind(dataset.key);
  const check = checkOf(dataset.source);
  return {
    id: dataset.key,
    label: datasetLabel(kind, f),
    value: datasetValue(kind, f),
    years: yearSpanText(datasetYears(kind)),
    source: dataset.source,
    check,
    status: datasetStatus(kind, check),
  };
}

export function datasetTable(f: Formatting): readonly SourceGroup[] {
  const rows = DATASETS.map((dataset) => datasetRow(dataset, f));
  const isContract = (row: SourceRow) => row.id.startsWith("ccnl.");
  return [
    { id: "data", label: f.t("sources.group.data"), rows: rows.filter((row) => !isContract(row)) },
    { id: "contracts", label: f.t("sources.group.contracts"), rows: rows.filter(isContract) },
  ];
}

export interface TodoEntry {
  readonly years: string;
  readonly coversLatestYear: boolean;
  readonly source: Source;
}

export interface TodoItem {
  readonly key: string;
  readonly name: string;
  readonly entries: readonly TodoEntry[];
}

function entryYears(key: ParamKey, from: IsoDate): readonly number[] {
  return listingFor(key)
    .years.filter((entry) => entry.from === from)
    .map((entry) => entry.year);
}

function derivationYears(key: ParamKey): readonly number[] {
  return listingFor(key).years.map((entry) => entry.year);
}

function isParamKey(key: string): key is ParamKey {
  return LISTING.has(key as ParamKey);
}

function itemName(key: string, f: Formatting): string {
  if (isParamKey(key)) {
    return key.startsWith("regions.")
      ? f.t("sources.name.regional", { region: regionName(key as RegionKey) })
      : parameterName(key, f);
  }
  return datasetLabel(datasetKind(key), f);
}

function tableOrder(): readonly string[] {
  return [...PARAMETER_GROUPS.flatMap((group) => group.keys), ...DATASETS.map((set) => set.key)];
}

export function todoItems(f: Formatting): readonly TodoItem[] {
  const entriesByKey = new Map<string, TodoEntry[]>();
  for (const item of daVerificare()) {
    let years: readonly number[];
    if (item.kind === "entry") years = entryYears(item.key, item.from);
    else if (item.kind === "derivation") years = derivationYears(item.key);
    else years = datasetYears(datasetKind(item.key));
    const list = entriesByKey.get(item.key) ?? [];
    list.push({
      years: yearSpanText(years),
      coversLatestYear: years.includes(LATEST_SUPPORTED_YEAR),
      source: item.source,
    });
    entriesByKey.set(item.key, list);
  }
  return tableOrder()
    .filter((key) => entriesByKey.has(key))
    .map((key) => ({ key, name: itemName(key, f), entries: entriesByKey.get(key) ?? [] }));
}

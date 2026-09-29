import type { CompanySize, ContractType, DependentsInput } from "@/domain/index.ts";
import { REGION_CODES, type PaymentFrequency, type RegionCode } from "@/data/index.ts";
import { SALARY_HISTORY_STORAGE_KEY } from "@/islands/runtime/storedKeys.ts";
import type { StoredCodec } from "@/islands/runtime/storage.ts";

export interface SalaryEntrySettings {
  readonly contractType: ContractType;
  readonly regionCode: RegionCode;
  readonly municipalTaxRate: number;
  readonly paymentFrequency: PaymentFrequency;
  readonly dependents?: DependentsInput;
  readonly companySize?: CompanySize;
}

export interface SalaryEntry {
  readonly id: string;
  readonly year: number;
  readonly grossAnnual: number;
  readonly note?: string;
  readonly createdAt: string;
  readonly settings: SalaryEntrySettings;
  readonly isMigrated?: boolean;
}

export interface NewEntryInput {
  readonly year: number;
  readonly grossAnnual: number;
  readonly settings?: SalaryEntrySettings;
  readonly note?: string;
}

const CONTRACT_TYPES: readonly ContractType[] = ["indeterminato", "determinato", "apprendistato"];
const COMPANY_SIZES: readonly CompanySize[] = ["small", "large"];
const PAYMENT_FREQUENCIES: readonly PaymentFrequency[] = [12, 13, 14, 15, 16];

export const DEFAULT_ENTRY_SETTINGS: SalaryEntrySettings = {
  contractType: "indeterminato",
  regionCode: "lombardia",
  municipalTaxRate: 0.008,
  paymentFrequency: 13,
};

export const LEGACY_ENTRY_SETTINGS: SalaryEntrySettings = {
  ...DEFAULT_ENTRY_SETTINGS,
  regionCode: "lazio",
};

export function isContractType(value: unknown): value is ContractType {
  return typeof value === "string" && (CONTRACT_TYPES as readonly string[]).includes(value);
}

export function isRegionCode(value: unknown): value is RegionCode {
  return typeof value === "string" && (REGION_CODES as readonly string[]).includes(value);
}

export function isPaymentFrequency(value: unknown): value is PaymentFrequency {
  return typeof value === "number" && (PAYMENT_FREQUENCIES as readonly number[]).includes(value);
}

export function isCompanySize(value: unknown): value is CompanySize {
  return typeof value === "string" && (COMPANY_SIZES as readonly string[]).includes(value);
}

function parseDependents(raw: unknown): DependentsInput | undefined {
  if (raw === null || typeof raw !== "object") return undefined;
  const obj = raw as Record<string, unknown>;
  const hasSpouse = obj.hasSpouse === true;
  const spouseIncomeRaw = obj.spouseIncome;
  const spouseIncome =
    typeof spouseIncomeRaw === "number" && Number.isFinite(spouseIncomeRaw) && spouseIncomeRaw >= 0
      ? spouseIncomeRaw
      : undefined;
  const childrenOver21 =
    typeof obj.childrenOver21 === "number" &&
    Number.isFinite(obj.childrenOver21) &&
    obj.childrenOver21 >= 0
      ? Math.floor(obj.childrenOver21)
      : 0;
  const otherDependents =
    typeof obj.otherDependents === "number" &&
    Number.isFinite(obj.otherDependents) &&
    obj.otherDependents >= 0
      ? Math.floor(obj.otherDependents)
      : 0;
  return {
    hasSpouse,
    ...(spouseIncome !== undefined ? { spouseIncome } : {}),
    childrenOver21,
    otherDependents,
  };
}

function parseSettings(raw: unknown, legacyContractType: unknown): SalaryEntrySettings {
  const obj = raw !== null && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const contractType = isContractType(obj.contractType)
    ? obj.contractType
    : isContractType(legacyContractType)
      ? legacyContractType
      : LEGACY_ENTRY_SETTINGS.contractType;

  const regionCode = isRegionCode(obj.regionCode)
    ? obj.regionCode
    : LEGACY_ENTRY_SETTINGS.regionCode;

  const municipalTaxRate =
    typeof obj.municipalTaxRate === "number" &&
    Number.isFinite(obj.municipalTaxRate) &&
    obj.municipalTaxRate >= 0 &&
    obj.municipalTaxRate <= 1
      ? obj.municipalTaxRate
      : LEGACY_ENTRY_SETTINGS.municipalTaxRate;

  const paymentFrequency = isPaymentFrequency(obj.paymentFrequency)
    ? obj.paymentFrequency
    : LEGACY_ENTRY_SETTINGS.paymentFrequency;

  const dependents = parseDependents(obj.dependents);
  const companySize = isCompanySize(obj.companySize) ? obj.companySize : undefined;

  return {
    contractType,
    regionCode,
    municipalTaxRate,
    paymentFrequency,
    ...(dependents ? { dependents } : {}),
    ...(companySize ? { companySize } : {}),
  };
}

export function parseSalaryEntry(raw: unknown): SalaryEntry | null {
  if (raw === null || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const id = typeof obj.id === "string" && obj.id.length > 0 ? obj.id : null;
  const year =
    typeof obj.year === "number" && Number.isFinite(obj.year) ? Math.floor(obj.year) : null;
  const gross =
    typeof obj.grossAnnual === "number" && Number.isFinite(obj.grossAnnual) && obj.grossAnnual >= 0
      ? Math.floor(obj.grossAnnual)
      : null;
  const createdAt =
    typeof obj.createdAt === "string" && obj.createdAt.length > 0 ? obj.createdAt : null;

  if (id === null || year === null || gross === null || createdAt === null) return null;
  if (year < 1900 || year > 2100) return null;

  const hasSettings = obj.settings !== undefined && obj.settings !== null;
  const settings = parseSettings(obj.settings, obj.contractType);

  return {
    id,
    year,
    grossAnnual: gross,
    createdAt,
    settings,
    ...(typeof obj.note === "string" && obj.note.length > 0 ? { note: obj.note } : {}),
    ...(hasSettings ? {} : { isMigrated: true as const }),
  };
}

export function parseSalaryEntries(raw: unknown): SalaryEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: SalaryEntry[] = [];
  for (const item of raw) {
    const parsed = parseSalaryEntry(item);
    if (parsed !== null) out.push(parsed);
  }
  return out;
}

export function sortEntriesByYear(entries: readonly SalaryEntry[]): SalaryEntry[] {
  return [...entries].sort((a, b) => a.year - b.year);
}

export function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildEntry(input: NewEntryInput, id: string, createdAt: string): SalaryEntry {
  return {
    id,
    year: input.year,
    grossAnnual: input.grossAnnual,
    createdAt,
    settings: input.settings ?? DEFAULT_ENTRY_SETTINGS,
    ...(input.note !== undefined && input.note.length > 0 ? { note: input.note } : {}),
  };
}

export const SALARY_HISTORY_CODEC: StoredCodec<readonly SalaryEntry[]> = {
  key: SALARY_HISTORY_STORAGE_KEY,
  fallback: [],
  decode: (raw) => parseSalaryEntries(JSON.parse(raw)),
  encode: (entries) => JSON.stringify(entries),
};

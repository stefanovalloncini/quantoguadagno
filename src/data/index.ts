export type {
  Bracket,
  Entries,
  Entry,
  IsoDate,
  ParamDefinition,
  PaymentFrequency,
  Source,
} from "./types.ts";

export {
  isSupportedYear,
  LATEST_SUPPORTED_YEAR,
  param,
  SUPPORTED_YEARS,
  yearlyKeys,
  yearStart,
  type ParamKey,
  type ParamValue,
  type SupportedYear,
  type TaxYear,
} from "./registry.ts";

export type { StoredKey, StoredValue } from "./stored.ts";
export type { DerivedKey, DerivedValue } from "./derived.ts";

export type {
  DetrazioneAggiuntivaConfig,
  SelfEmployedDeductionConfig,
  SommaAggiuntivaBracket,
  TaxWedgeCutConfig,
  TrattamentoIntegrativoConfig,
  WorkDeductionBonus,
  WorkDeductionConfig,
} from "./params/irpef.ts";
export type { InpsExemption2024Config, InpsExemptionBracket } from "./params/inps.ts";
export type { GestioneSeparataRates } from "./params/autonomi.ts";
export type {
  ChildrenDeductionConfig,
  DependentIncomeLimits,
  ExpenseCapBand,
  ExpenseHighIncomeCap,
  ExpenseHighIncomeReduction,
  ExpensePhaseOut,
  ExpenseRatesConfig,
  OtherFamilyDeductionConfig,
  SpouseDeductionConfig,
  SpouseDeductionIncrement,
} from "./params/deductions.ts";
export type {
  CompanyCarCo2Threshold,
  CompanyCarPowertrainRate,
  PowertrainType,
  WelfareThresholds,
} from "./params/fringeBenefits.ts";
export type { EmployerInpsRates, OtherEmployerCostsConfig, TfrConfig } from "./params/employer.ts";
export type {
  MadreLavoratriceRules,
  PdrSostitutivaConfig,
  RegimeImpatriatiConfig,
} from "./params/specialConditions.ts";
export type { ForfettarioLimits, ForfettarioTaxRates } from "./params/forfettario.ts";
export type { NaspiRules } from "./params/naspi.ts";

export { REGION_INFO, type RegionCode, type RegionInfo } from "./regionInfo.ts";
export type {
  RegionalFlatRate,
  RegionalTaxBracket,
  RegionalTaxDeduction,
  RegionalTaxRules,
} from "./params/regions.ts";
export { REGION_CODES, REGIONS, REGIONS_LIST, regionRules, type Region } from "./regions.ts";

export {
  COMUNI_SOURCE,
  COMUNI_YEARS,
  comunaleRuleFor,
  comuniCount,
  findComune,
  loadComuneNames,
  loadRegionComuni,
  type ComunaleBracket,
  type ComunaleRule,
  type ComunaleRuleForYear,
  type Comune,
  type ComuneName,
  type ComuneNames,
  type RegionComuni,
} from "./comuni.ts";

export {
  FOI_BASE_YEAR,
  FOI_INDEX,
  FOI_LATEST_YEAR,
  FOI_SOURCE,
  type InflationDataPoint,
} from "./inflation.ts";

export {
  CCNL_IDS,
  CCNL_PRESET_IDS,
  CCNL_PRESETS,
  CCNL_SOURCES,
  CCNL_TABLE,
  type CcnlDefinition,
  type CcnlId,
  type CcnlLivello,
  type CcnlNoticeEntry,
  type CcnlNoticeRow,
  type CcnlPreset,
  type CcnlSources,
  type SeniorityBand,
} from "./ccnl.ts";

export { countUnverified, isComuniDatasetVerified, latestVerification } from "./verification.ts";

import {
  isSupportedYear,
  param,
  yearStart,
  type Bracket,
  type ChildrenDeductionConfig,
  type CompanyCarCo2Threshold,
  type CompanyCarPowertrainRate,
  type DependentIncomeLimits,
  type EmployerInpsRates,
  type ExpenseHighIncomeCap,
  type ExpenseHighIncomeReduction,
  type ExpensePhaseOut,
  type ExpenseRatesConfig,
  type InpsExemption2024Config,
  type MadreLavoratriceRules,
  type NaspiRules,
  type OtherEmployerCostsConfig,
  type OtherFamilyDeductionConfig,
  type PdrSostitutivaConfig,
  type RegimeImpatriatiConfig,
  type SpouseDeductionConfig,
  type SupportedYear,
  type TaxWedgeCutConfig,
  type TaxYear,
  type TfrConfig,
  type TrattamentoIntegrativoConfig,
  type WelfareThresholds,
  type WorkDeductionConfig,
} from "@/data/index.ts";
import type { ForfettarioConfig, GestioneSeparataConfig } from "./forfettario.ts";

export interface InpsConfig {
  readonly standardRate: number;
  readonly aboveCeilingRate: number;
  readonly ceiling: number;
  readonly massimale: number;
  readonly apprenticeshipRate?: number;
  // Addizionale CIGS (Cassa Integrazione Guadagni Straordinaria) per aziende
  // industriali con più di 15 dipendenti. Art. 9 L. 407/1990.
  readonly largeCompanyAdditionalRate?: number;
  // Aliquota IVS dipendenti pubblici (Gestione Dipendenti Pubblici, ex-INPDAP).
  readonly publicEmployeeRate?: number;
  readonly publicEmployeeAboveCeilingRate?: number;
}

export interface DependentsDeductionConfig
  extends ChildrenDeductionConfig, OtherFamilyDeductionConfig, DependentIncomeLimits {
  readonly spouse: SpouseDeductionConfig;
}

export interface ExpenseDeductionsConfig extends ExpenseRatesConfig, ExpensePhaseOut {
  readonly maxPensionFund: number;
  readonly highIncomeCap?: ExpenseHighIncomeCap;
  readonly highIncomeReduction?: ExpenseHighIncomeReduction;
}

export interface EmployerInpsConfig extends EmployerInpsRates {
  readonly aboveCeilingRate?: number;
}

export interface FringeBenefitsConfig extends WelfareThresholds {
  readonly mealVouchersDailyThreshold: number;
  readonly mealVouchersPaperThreshold: number;
  readonly healthInsuranceThreshold: number;
  readonly companyCarCo2Thresholds: readonly CompanyCarCo2Threshold[];
  readonly companyCarPowertrainRates?: readonly CompanyCarPowertrainRate[];
  readonly defaultConventionalKm: number;
}

export interface MadreLavoratriceConfig extends MadreLavoratriceRules {
  readonly maxMonthlyExemption: number;
}

export interface YearlyTaxConfig {
  readonly year: TaxYear;
  readonly inps: InpsConfig;
  readonly irpefBrackets: readonly Bracket[];
  readonly workDeduction: WorkDeductionConfig;
  readonly trattamentoIntegrativo: TrattamentoIntegrativoConfig;
  readonly taxWedgeCut: TaxWedgeCutConfig | null;
  readonly inpsExemption2024: InpsExemption2024Config | null;
  readonly dependentsDeduction: DependentsDeductionConfig;
  readonly expenseDeductions: ExpenseDeductionsConfig;
  readonly employerInps: EmployerInpsConfig;
  readonly tfr: TfrConfig;
  readonly otherEmployerCosts: OtherEmployerCostsConfig;
  readonly fringeBenefits: FringeBenefitsConfig;
  readonly madreLavoratrice: MadreLavoratriceConfig;
  readonly regimeImpatriati: RegimeImpatriatiConfig;
  readonly pdrSostitutiva: PdrSostitutivaConfig;
  readonly forfettario: ForfettarioConfig;
  readonly gestioneSeparata: GestioneSeparataConfig;
}

export interface GestionSeparataAutonomiConfig {
  readonly fullRate: number;
  readonly reducedRate: number;
  readonly minimaleReddito: number;
  readonly massimale: number;
}

export interface GestionAutonomiConfig {
  readonly rate: number;
  readonly rateOver1stBand: number;
  readonly band1Ceiling: number;
  readonly minimaleReddito: number;
  readonly maternityYearly: number;
  /** Massimale for iscritti post-1996. */
  readonly massimale: number;
  /** Massimale for iscritti ante-1996 (pre-riforma Dini). */
  readonly massimaleAnte1996: number;
}

export interface AutonomiYear {
  readonly year: number;
  readonly gestionSeparata: GestionSeparataAutonomiConfig;
  readonly artigiani: GestionAutonomiConfig;
  readonly commercianti: GestionAutonomiConfig;
  readonly forfettarioDiscount: number;
  readonly newRegistrantDiscount: number;
  readonly concurrentEmployeeRalLimit: number;
}

export interface NaspiConfig extends NaspiRules {
  readonly year: number;
  readonly soglia: number;
  readonly massimale: number;
}

function assertSupportedYear(year: number): asserts year is SupportedYear {
  if (!isSupportedYear(year)) throw new RangeError(`Unsupported tax year: ${String(year)}`);
}

function memoizedByYear<T>(build: (year: SupportedYear) => T): (year: SupportedYear) => T {
  const cache = new Map<SupportedYear, T>();
  return (year) => {
    assertSupportedYear(year);
    const cached = cache.get(year);
    if (cached !== undefined) return cached;
    const built = build(year);
    cache.set(year, built);
    return built;
  };
}

function buildAutonomiConfig(year: SupportedYear): AutonomiYear {
  const at = yearStart(year);
  const massimale = param("inps.massimale", at);
  const shared = {
    band1Ceiling: param("inps.firstBand", at),
    minimaleReddito: param("inps.autonomi.minimale", at),
    maternityYearly: param("inps.autonomi.maternity", at),
    massimale,
    massimaleAnte1996: param("inps.autonomi.massimaleAnte1996", at),
  };
  return {
    year,
    gestionSeparata: {
      ...param("inps.gestioneSeparata.rates", at),
      minimaleReddito: param("inps.gestioneSeparata.minimale", at),
      massimale,
    },
    artigiani: {
      rate: param("inps.artigiani.rate", at),
      rateOver1stBand: param("inps.artigiani.rateAboveFirstBand", at),
      ...shared,
    },
    commercianti: {
      rate: param("inps.commercianti.rate", at),
      rateOver1stBand: param("inps.commercianti.rateAboveFirstBand", at),
      ...shared,
    },
    forfettarioDiscount: param("inps.autonomi.forfettarioReduction", at),
    newRegistrantDiscount: param("inps.autonomi.newRegistrantReduction", at),
    concurrentEmployeeRalLimit: param("forfettario.concurrentEmployeeIncomeLimit", at),
  };
}

export const getAutonomiConfig = memoizedByYear(buildAutonomiConfig);

function buildExpenseDeductions(year: SupportedYear): ExpenseDeductionsConfig {
  const at = yearStart(year);
  const highIncomeCap = param("deductions.expenseCap", at);
  const highIncomeReduction = param("deductions.expenseReduction", at);
  return {
    ...param("deductions.expenses", at),
    maxPensionFund: param("deductions.pensionFund", at),
    ...param("deductions.expensePhaseOut", at),
    ...(highIncomeCap === null ? {} : { highIncomeCap }),
    ...(highIncomeReduction === null ? {} : { highIncomeReduction }),
  };
}

function buildFringeBenefits(year: SupportedYear): FringeBenefitsConfig {
  const at = yearStart(year);
  const companyCarPowertrainRates = param("fringe.companyCar.powertrain", at);
  return {
    mealVouchersDailyThreshold: param("fringe.mealVouchers.electronic", at),
    mealVouchersPaperThreshold: param("fringe.mealVouchers.paper", at),
    healthInsuranceThreshold: param("fringe.healthInsurance", at),
    ...param("fringe.welfare", at),
    companyCarCo2Thresholds: param("fringe.companyCar.co2", at),
    ...(companyCarPowertrainRates === null ? {} : { companyCarPowertrainRates }),
    defaultConventionalKm: param("fringe.companyCar.conventionalKm", at),
  };
}

function buildTaxConfig(year: SupportedYear): YearlyTaxConfig {
  const at = yearStart(year);
  const employerInps = param("employer.inps", at);
  return {
    year,
    inps: {
      standardRate: param("inps.employee.rate", at),
      aboveCeilingRate: param("inps.employee.rateAboveFirstBand", at),
      ceiling: param("inps.firstBand", at),
      massimale: param("inps.massimale", at),
      apprenticeshipRate: param("inps.employee.apprenticeRate", at),
      largeCompanyAdditionalRate: param("inps.employee.cigsRate", at),
      publicEmployeeRate: param("inps.employee.publicRate", at),
      publicEmployeeAboveCeilingRate: param("inps.employee.publicRateAboveFirstBand", at),
    },
    irpefBrackets: param("irpef.brackets", at),
    workDeduction: param("irpef.workDeduction", at),
    trattamentoIntegrativo: param("irpef.trattamentoIntegrativo", at),
    taxWedgeCut: param("irpef.taxWedgeCut", at),
    inpsExemption2024: param("inps.employee.exemption2024", at),
    dependentsDeduction: {
      spouse: param("deductions.spouse", at),
      ...param("deductions.children", at),
      ...param("deductions.otherFamily", at),
      ...param("deductions.dependentIncomeLimit", at),
    },
    expenseDeductions: buildExpenseDeductions(year),
    employerInps: { ...employerInps, aboveCeilingRate: employerInps.rate },
    tfr: param("tfr", at),
    otherEmployerCosts: param("employer.otherCosts", at),
    fringeBenefits: buildFringeBenefits(year),
    madreLavoratrice: {
      ...param("madreLavoratrice", at),
      maxMonthlyExemption: param("madreLavoratrice.maxMonthlyExemption", at),
    },
    regimeImpatriati: param("impatriati", at),
    pdrSostitutiva: param("pdr", at),
    forfettario: { ...param("forfettario.taxRates", at), ...param("forfettario.limits", at) },
    gestioneSeparata: getAutonomiConfig(year).gestionSeparata,
  };
}

export const getTaxConfig = memoizedByYear(buildTaxConfig);

function buildNaspiConfig(year: SupportedYear): NaspiConfig {
  const at = yearStart(year);
  return {
    ...param("naspi.rules", at),
    year,
    soglia: param("naspi.soglia", at),
    massimale: param("naspi.massimale", at),
  };
}

export const getNaspiConfig = memoizedByYear(buildNaspiConfig);

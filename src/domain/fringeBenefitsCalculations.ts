import type { FringeBenefitsConfig } from "./taxConfig.ts";
import type {
  FringeBenefitsInput,
  FringeBenefitsBreakdown,
  CompanyCarInput,
  MealVouchersInput,
  HealthInsuranceInput,
  WelfareInput,
  CO2EmissionCategory,
  FringePowertrainType,
} from "./fringeBenefitsTypes.ts";

const WORKING_DAYS_PER_MONTH = 22;
const MONTHS_PER_YEAR = 12;

export function calculateCompanyCarBenefit(
  companyCar: CompanyCarInput | undefined,
  cfg: FringeBenefitsConfig,
): {
  readonly grossValue: number;
  readonly taxableValue: number;
  readonly co2Category?: CO2EmissionCategory;
  readonly powertrainCategory?: FringePowertrainType;
  readonly taxablePercentage?: number;
} {
  if (!companyCar) return { grossValue: 0, taxableValue: 0 };

  if (companyCar.mode === "simple") {
    const value = companyCar.annualBenefitValue ?? 0;
    return { grossValue: value, taxableValue: value };
  }

  const aciCostPerKm = companyCar.aciCostPerKm ?? 0;
  const conventionalKm = companyCar.conventionalKm ?? cfg.defaultConventionalKm;
  const grossValue = aciCostPerKm * conventionalKm;

  if (cfg.companyCarPowertrainRates && companyCar.powertrainType) {
    const match = cfg.companyCarPowertrainRates.find(
      (r) => r.powertrainType === companyCar.powertrainType,
    );
    if (match) {
      return {
        grossValue,
        taxableValue: grossValue * match.taxablePercentage,
        powertrainCategory: match.powertrainType,
        taxablePercentage: match.taxablePercentage,
      };
    }
  }

  const co2Emissions = companyCar.co2Emissions ?? 0;
  const { category, taxablePercentage } = getCO2Category(co2Emissions, cfg);
  return {
    grossValue,
    taxableValue: grossValue * taxablePercentage,
    co2Category: category,
    taxablePercentage,
  };
}

function getCO2Category(
  co2Emissions: number,
  cfg: FringeBenefitsConfig,
): { category: CO2EmissionCategory; taxablePercentage: number } {
  const [t0, t1, t2, t3] = cfg.companyCarCo2Thresholds;

  if (t0 && co2Emissions <= (t0.maxCO2 ?? 60)) {
    return { category: "electric", taxablePercentage: t0.taxablePercentage };
  }
  if (t1 && co2Emissions <= (t1.maxCO2 ?? 160)) {
    return { category: "low", taxablePercentage: t1.taxablePercentage };
  }
  if (t2 && co2Emissions <= (t2.maxCO2 ?? 190)) {
    return { category: "medium", taxablePercentage: t2.taxablePercentage };
  }
  return { category: "high", taxablePercentage: t3?.taxablePercentage ?? 0.5 };
}

export function calculateMealVouchersBenefit(
  mealVouchers: MealVouchersInput | undefined,
  cfg: FringeBenefitsConfig,
): {
  readonly annualValue: number;
  readonly taxFreeThreshold: number;
  readonly taxableValue: number;
} {
  const annualWorkingDays =
    (mealVouchers?.workingDaysPerMonth ?? WORKING_DAYS_PER_MONTH) * MONTHS_PER_YEAR;
  const dailyThreshold =
    mealVouchers?.type === "paper"
      ? cfg.mealVouchersPaperThreshold
      : cfg.mealVouchersDailyThreshold;
  const taxFreeThreshold = dailyThreshold * annualWorkingDays;

  if (!mealVouchers) {
    return { annualValue: 0, taxFreeThreshold, taxableValue: 0 };
  }

  const annualValue = mealVouchers.dailyValue * annualWorkingDays;
  const dailyExcess = Math.max(0, mealVouchers.dailyValue - dailyThreshold);
  const taxableValue = dailyExcess * annualWorkingDays;

  return { annualValue, taxFreeThreshold, taxableValue };
}

export function calculateHealthInsuranceBenefit(
  healthInsurance: HealthInsuranceInput | undefined,
  cfg: FringeBenefitsConfig,
): {
  readonly annualValue: number;
  readonly taxFreeThreshold: number;
  readonly taxableValue: number;
} {
  const threshold = cfg.healthInsuranceThreshold;
  if (!healthInsurance) {
    return { annualValue: 0, taxFreeThreshold: threshold, taxableValue: 0 };
  }
  const annualValue = healthInsurance.annualPremium;
  return {
    annualValue,
    taxFreeThreshold: threshold,
    taxableValue: Math.max(0, annualValue - threshold),
  };
}

export function calculateWelfareBenefit(
  welfare: WelfareInput | undefined,
  cfg: FringeBenefitsConfig,
): {
  readonly annualValue: number;
  readonly taxFreeThreshold: number;
  readonly taxableValue: number;
} {
  const threshold = welfare?.hasDependentChildren
    ? cfg.welfareThresholdWithChildren
    : cfg.welfareThresholdGeneral;

  if (!welfare) {
    return { annualValue: 0, taxFreeThreshold: threshold, taxableValue: 0 };
  }

  const annualValue = welfare.annualAmount;
  return {
    annualValue,
    taxFreeThreshold: threshold,
    taxableValue: annualValue > threshold ? annualValue : 0,
  };
}

export function calculateFringeBenefits(
  fringeBenefits: FringeBenefitsInput | undefined,
  cfg: FringeBenefitsConfig,
): FringeBenefitsBreakdown {
  const companyCar = calculateCompanyCarBenefit(fringeBenefits?.companyCar, cfg);
  const mealVouchers = calculateMealVouchersBenefit(fringeBenefits?.mealVouchers, cfg);
  const healthInsurance = calculateHealthInsuranceBenefit(fringeBenefits?.healthInsurance, cfg);
  const welfare = calculateWelfareBenefit(fringeBenefits?.welfare, cfg);

  const totalGrossBenefit =
    companyCar.grossValue +
    mealVouchers.annualValue +
    healthInsurance.annualValue +
    welfare.annualValue;

  const taxableAmount =
    companyCar.taxableValue +
    mealVouchers.taxableValue +
    healthInsurance.taxableValue +
    welfare.taxableValue;

  return {
    totalGrossBenefit,
    taxFreeAmount: totalGrossBenefit - taxableAmount,
    taxableAmount,
    companyCar,
    mealVouchers,
    healthInsurance,
    welfare,
  };
}

export function hasFringeBenefits(fringeBenefits: FringeBenefitsInput | undefined): boolean {
  if (!fringeBenefits) return false;
  return !!(
    fringeBenefits.companyCar ??
    fringeBenefits.mealVouchers ??
    fringeBenefits.healthInsurance ??
    fringeBenefits.welfare
  );
}

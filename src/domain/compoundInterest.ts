import { round } from "./_math.ts";

export type CompoundingFrequency = "annually" | "monthly" | "daily";
export type ContributionFrequency = "monthly" | "yearly" | "none";

export interface CompoundInterestInput {
  readonly principal: number;
  readonly annualRate: number;
  readonly years: number;
  readonly contribution: number;
  readonly contributionFrequency: ContributionFrequency;
  readonly compoundingFrequency: CompoundingFrequency;
  readonly inflationRate: number;
}

export interface CompoundInterestYear {
  readonly year: number;
  readonly nominalBalance: number;
  readonly realBalance: number;
  readonly contributedSoFar: number;
  readonly interestSoFar: number;
}

export interface CompoundInterestBreakdown {
  readonly finalNominal: number;
  readonly finalReal: number;
  readonly totalContributions: number;
  readonly totalInterest: number;
  readonly schedule: readonly CompoundInterestYear[];
}

const FREQ_PERIODS: Record<CompoundingFrequency, number> = {
  annually: 1,
  monthly: 12,
  daily: 365,
};

const CONTRIB_PER_YEAR: Record<ContributionFrequency, number> = {
  monthly: 12,
  yearly: 1,
  none: 0,
};

export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestBreakdown {
  const principal = Math.max(0, input.principal);
  const annualRate = Math.max(0, input.annualRate);
  const years = Math.max(0, Math.floor(input.years));
  const contribution = Math.max(0, input.contribution);
  const inflation = Math.max(0, input.inflationRate);

  const periodsPerYear = FREQ_PERIODS[input.compoundingFrequency];
  const periodRate = annualRate / periodsPerYear;
  const contributionsPerYear = CONTRIB_PER_YEAR[input.contributionFrequency];
  const annualContribution = contribution * contributionsPerYear;
  const contributionPerPeriod = annualContribution / periodsPerYear;

  const schedule: CompoundInterestYear[] = [
    {
      year: 0,
      nominalBalance: round(principal),
      realBalance: round(principal),
      contributedSoFar: 0,
      interestSoFar: 0,
    },
  ];

  let balance = principal;
  let contributedSoFar = 0;

  for (let y = 1; y <= years; y += 1) {
    for (let p = 0; p < periodsPerYear; p += 1) {
      balance = balance * (1 + periodRate) + contributionPerPeriod;
      contributedSoFar += contributionPerPeriod;
    }
    const interestSoFar = balance - principal - contributedSoFar;
    const realBalance = balance / Math.pow(1 + inflation, y);
    schedule.push({
      year: y,
      nominalBalance: round(balance),
      realBalance: round(realBalance),
      contributedSoFar: round(contributedSoFar),
      interestSoFar: round(interestSoFar),
    });
  }

  return {
    finalNominal: round(balance),
    finalReal: round(balance / Math.pow(1 + inflation, years)),
    totalContributions: round(contributedSoFar),
    totalInterest: round(balance - principal - contributedSoFar),
    schedule,
  };
}

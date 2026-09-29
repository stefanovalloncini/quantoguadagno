export interface ApprenticeshipInput {
  readonly targetGrossAnnual: number;
  readonly years: number;
  readonly progression: readonly number[];
}

export interface ApprenticeshipYear {
  readonly year: number;
  readonly percentageOfTarget: number;
  readonly grossAnnual: number;
}

export interface ApprenticeshipBreakdown {
  readonly targetGrossAnnual: number;
  readonly years: number;
  readonly schedule: readonly ApprenticeshipYear[];
}

import { clamp, round } from "./_math.ts";

export const DEFAULT_APPRENTICESHIP_PROGRESSION: readonly number[] = [0.85, 0.9, 0.95, 1, 1];

export function calculateApprenticeship(input: ApprenticeshipInput): ApprenticeshipBreakdown {
  const target = Math.max(0, input.targetGrossAnnual);
  const years = clamp(Math.floor(input.years), 1, 5);

  const schedule: ApprenticeshipYear[] = [];
  for (let i = 0; i < years; i += 1) {
    const pct = input.progression[i] ?? input.progression[input.progression.length - 1] ?? 1;
    schedule.push({
      year: i + 1,
      percentageOfTarget: pct,
      grossAnnual: round(target * pct),
    });
  }

  return {
    targetGrossAnnual: round(target),
    years,
    schedule,
  };
}

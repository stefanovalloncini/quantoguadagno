import { COMUNI_SOURCE } from "./comuni.ts";
import { latestVerification, listParameters } from "./fonti.ts";
import { SUPPORTED_YEARS, type ParamKey } from "./registry.ts";
import type { IsoDate } from "./types.ts";

export interface VerificationSnapshot {
  readonly latest: IsoDate | null;
  readonly unverifiedByYear: Readonly<Record<string, readonly ParamKey[]>>;
  readonly comuniVerified: boolean;
}

function takeSnapshot(): VerificationSnapshot {
  const parameters = listParameters();
  const unverifiedByYear = Object.fromEntries(
    SUPPORTED_YEARS.map((year) => [
      String(year),
      parameters
        .filter(
          (parameter) =>
            parameter.years.find((entry) => entry.year === year)?.source.verified === undefined,
        )
        .map((parameter) => parameter.key),
    ]),
  );
  return {
    latest: latestVerification(),
    unverifiedByYear,
    comuniVerified: COMUNI_SOURCE.verified !== undefined,
  };
}

export const VERIFICATION: VerificationSnapshot = takeSnapshot();

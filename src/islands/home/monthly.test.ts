import { describe, expect, it } from "vitest";
import { monthlyShares } from "./monthly.ts";

function cents(values: readonly number[]): number {
  return Math.round(values.reduce((sum, value) => sum + value, 0) * 100);
}

describe("monthlyShares", () => {
  it("rounds each line to the cent and keeps the total equal to the rounded monthly figure", () => {
    const shares = monthlyShares([-3_216.5, -5_042.04, -454.98, -254.27], 13, 2_002.48 - 2_692.31);
    expect(shares).toEqual([-247.42, -387.85, -35, -19.56]);
    expect(cents(shares)).toBe(Math.round((2_002.48 - 2_692.31) * 100));
  });

  it("moves the rounding difference onto the lines that drifted most, one cent at a time", () => {
    const shares = monthlyShares([-100, -100, -100], 3, -100);
    expect(cents(shares)).toBe(-10_000);
    expect(shares.every((share) => Math.abs(share + 33.33) <= 0.011)).toBe(true);
  });

  it("works with credits that add to the net", () => {
    const shares = monthlyShares([-1_838, -1_366.7, -234.46, 0, 871.78], 13, 1_340.97 - 1_538.46);
    expect(cents(shares)).toBe(Math.round((1_340.97 - 1_538.46) * 100));
  });
});

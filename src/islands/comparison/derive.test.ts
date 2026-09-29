import { describe, expect, it } from "vitest";
import { computeOffer } from "./compute.ts";
import { comparisonRows, verdict } from "./derive.ts";
import { checkComparison, comparisonDefaults, setOffer } from "./state.ts";

function offers(grossA: string, countA: 13 | 14, grossB: string, countB: 13 | 14) {
  let state = comparisonDefaults("it");
  state = setOffer(state, "a", "gross", grossA);
  state = setOffer(state, "a", "paymentFrequency", countA);
  state = setOffer(state, "b", "gross", grossB);
  state = setOffer(state, "b", "paymentFrequency", countB);
  const { offers: values } = checkComparison(state, "it");
  const a = computeOffer(values.a, null);
  const b = computeOffer(values.b, null);
  if (a === null || b === null) throw new Error("expected valid offers");
  return { a, b };
}

describe("verdict", () => {
  it("names B when its year pays more, even with smaller payslips", () => {
    expect(verdict(offers("35.000", 13, "38.000", 14))).toEqual({
      winner: "b",
      netAnnualDelta: 1_206.66,
      netAnnualGap: 1_206.66,
      averageMonthlyGap: 100.56,
      grossGap: 3_000,
      taxesGap: -1_793.34,
      keptShare: 1_206.66 / 3_000,
      sharedNet: 26_635.54,
      exactTie: false,
    });
  });

  it("names A with a positive gap when A pays more", () => {
    const result = verdict(offers("36.000", 13, "35.000", 14));
    expect(result.winner).toBe("a");
    expect(result.netAnnualDelta).toBe(-420.26);
    expect(result.netAnnualGap).toBe(420.26);
    expect(result.averageMonthlyGap).toBe(35.02);
    expect(result.keptShare).toBeCloseTo(0.4203, 4);
  });

  it("calls a tie when the offers differ by less than 1 € a month", () => {
    const exact = verdict(offers("35.000", 13, "35.000", 14));
    expect(exact).toMatchObject({ winner: "equal", exactTie: true, sharedNet: 26_032.21 });
    const near = verdict(offers("35.000", 13, "35.010", 13));
    expect(near.winner).toBe("equal");
    expect(near.exactTie).toBe(false);
    expect(near.keptShare).toBeNull();
  });
});

describe("comparisonRows", () => {
  it("lists the lines of the board, each summing to the net", () => {
    const rows = comparisonRows(offers("35.000", 13, "38.000", 14));
    expect(rows.map((row) => [row.key, row.a, row.b, row.delta])).toEqual([
      ["gross", 35_000, 38_000, 3_000],
      ["inps", -3_216.5, -3_492.2, -275.7],
      ["irpef", -5_042.04, -6_491.04, -1_449],
      ["regional", -454.98, -501.83, -46.85],
      ["municipal", -254.27, -276.06, -21.79],
      ["netAnnual", 26_032.21, 27_238.87, 1_206.66],
      ["netMonthly", 2_002.48, 1_945.63, -56.85],
      ["average", 2_169.35, 2_269.91, 100.56],
    ]);
  });

  it("adds the credits when either offer receives them", () => {
    const rows = comparisonRows(offers("12.000", 13, "18.000", 13));
    const credits = rows.find((row) => row.key === "credits");
    expect(credits?.kind).toBe("credited");
    for (const side of ["a", "b"] as const) {
      const sum = rows
        .filter((row) => row.kind !== "total" && !["netMonthly", "average"].includes(row.key))
        .reduce((total, row) => total + row[side], 0);
      const net = rows.find((row) => row.key === "netAnnual")?.[side] ?? 0;
      expect(sum).toBeCloseTo(net, 2);
    }
  });
});

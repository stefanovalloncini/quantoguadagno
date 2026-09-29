import { describe, expect, it } from "vitest";
import { computeNaspi } from "./compute.ts";
import {
  estimateNaspiNet,
  firstYearGross,
  netSchedule,
  roundedToTen,
  taxesOn,
  type NaspiTaxContext,
} from "./netEstimate.ts";
import { NASPI_DEFAULTS } from "./state.ts";

const MILANO_2026: NaspiTaxContext = {
  year: 2026,
  region: "lombardia",
  municipal: { rate: 0.8, exemption: 23_000 },
};

const BOARD = computeNaspi(
  { ...NASPI_DEFAULTS, grossPay4Years: "60000", weeksContribution4Years: 104, age: 34, year: 2026 },
  "it",
);

describe("NASpI net estimate", () => {
  it("matches the approved board: 12 months, no other income, Milano", () => {
    const gross = firstYearGross(BOARD.schedule);
    expect(gross).toBe(15_169.22);
    const estimate = estimateNaspiNet(gross, 0, MILANO_2026);
    expect(estimate.withNaspi.irpefGross).toBe(3_488.92);
    expect(estimate.withNaspi.workDeduction).toBe(3_084.51);
    expect(estimate.irpef).toBe(404.41);
    expect(estimate.regional).toBe(187.17);
    expect(estimate.municipal).toBe(0);
    expect(estimate.taxes).toBe(591.58);
    expect(estimate.net).toBe(14_577.64);
  });

  it("spreads the same share over every month and keeps the first year summing", () => {
    const gross = firstYearGross(BOARD.schedule);
    const schedule = netSchedule(BOARD.schedule, estimateNaspiNet(gross, 0, MILANO_2026));
    expect(schedule.rows[0]?.net).toBe(1_300.58);
    expect(schedule.rows[11]?.net).toBe(1_050.85);
    expect(schedule.netTotal).toBe(14_577.64);
    expect(schedule.grossTotal).toBe(15_169.22);
    expect(schedule.rows[6]?.change).toBeCloseTo(-0.0591, 4);
    expect(roundedToTen(schedule.rows[0]?.net ?? 0)).toBe(1_300);
  });

  it("charges nothing when the deduction covers the whole IRPEF", () => {
    const taxes = taxesOn(6_000, MILANO_2026);
    expect(taxes.irpefNet).toBe(0);
    expect(taxes.regional).toBe(0);
    expect(taxes.total).toBe(0);
  });

  it("taxes the NASpI at the margin of the other income of the year", () => {
    const alone = estimateNaspiNet(15_000, 0, MILANO_2026);
    const withSalary = estimateNaspiNet(15_000, 20_000, MILANO_2026);
    expect(withSalary.taxes).toBeGreaterThan(alone.taxes);
    expect(withSalary.municipal).toBeGreaterThan(0);
  });
});

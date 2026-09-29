import { describe, it, expect } from "vitest";
import { round, clamp, linearPhaseOut, sumOfCents } from "./_math.ts";

describe("round", () => {
  it("rounds to 2 decimals by default", () => {
    expect(round(3.14159)).toBe(3.14);
  });

  it("respects the decimals argument", () => {
    expect(round(3.14159, 3)).toBe(3.142);
    expect(round(3.14159, 0)).toBe(3);
  });

  it("rounds halves up", () => {
    expect(round(2.5, 0)).toBe(3);
  });

  it("leaves whole numbers untouched", () => {
    expect(round(10)).toBe(10);
  });
});

describe("clamp", () => {
  it("returns the value when inside the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps below the minimum", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });

  it("clamps above the maximum", () => {
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it("treats the bounds as inclusive", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe("linearPhaseOut", () => {
  it("is 1 at or below the start", () => {
    expect(linearPhaseOut(5000, 10_000, 20_000)).toBe(1);
    expect(linearPhaseOut(10_000, 10_000, 20_000)).toBe(1);
  });

  it("is 0 at or above the end", () => {
    expect(linearPhaseOut(20_000, 10_000, 20_000)).toBe(0);
    expect(linearPhaseOut(25_000, 10_000, 20_000)).toBe(0);
  });

  it("interpolates linearly in between", () => {
    expect(linearPhaseOut(15_000, 10_000, 20_000)).toBe(0.5);
    expect(linearPhaseOut(12_000, 10_000, 20_000)).toBeCloseTo(0.8, 10);
  });

  it("is 0 for a degenerate window when value is above the start", () => {
    expect(linearPhaseOut(15_000, 10_000, 10_000)).toBe(0);
  });
});

describe("sumOfCents", () => {
  it("adds the amounts as they are shown, rounded to the cent", () => {
    expect(sumOfCents([0.105, 0.105, 0.105])).toBe(0.33);
    expect(sumOfCents([1_264.235, 1_264.235])).toBe(2_528.48);
    expect(sumOfCents([])).toBe(0);
  });
});

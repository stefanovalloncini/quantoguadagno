import { describe, expect, it } from "vitest";
import { employeeDefaults } from "@/islands/home/state.ts";
import { employeeUrlState } from "@/islands/home/url.ts";
import { payslipStateFromSearch, payslipUrlState } from "./url.ts";

const DEFAULTS = employeeDefaults("it");

describe("payslipStateFromSearch", () => {
  it("returns the defaults when the link carries no parameters", () => {
    expect(payslipStateFromSearch("", "it")).toEqual(DEFAULTS);
  });

  it("overrides the gross when l is present and keeps the rest", () => {
    const state = payslipStateFromSearch("?l=40000", "it");
    expect(state.gross).toBe("40.000");
    expect(state.year).toBe(DEFAULTS.year);
  });

  it("decodes the region and the comunale rate", () => {
    const state = payslipStateFromSearch("?r=lazio&c=0.9", "it");
    expect(state.region).toBe("lazio");
    expect(state.municipalRate).toBe("0,9");
  });

  it("accepts the long alias keys", () => {
    expect(payslipStateFromSearch("?lordo=45000", "it").gross).toBe("45.000");
  });

  it("falls back to the defaults for malformed values", () => {
    const state = payslipStateFromSearch("?l=abc&r=narnia", "it");
    expect(state.gross).toBe(DEFAULTS.gross);
    expect(state.region).toBe(DEFAULTS.region);
  });

  it("reads the comune and the mensilità the employee calculator writes", () => {
    expect(payslipStateFromSearch("?k=F205&m=15", "en")).toMatchObject({
      comune: "F205",
      paymentFrequency: 15,
      gross: "30,000",
    });
  });

  it("restores through the employee calculator's own config", () => {
    expect(payslipUrlState("it")).toBe(employeeUrlState("it"));
  });
});

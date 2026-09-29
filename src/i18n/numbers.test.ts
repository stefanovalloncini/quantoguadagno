import { describe, it, expect } from "vitest";
import {
  formatAmountInput,
  formatMoney,
  formatNumber,
  formatPercent,
  formatDate,
  parseDecimal,
  parseMoneyInput,
} from "./numbers.ts";

const NBSP = String.fromCharCode(0xa0);
const MINUS = String.fromCharCode(0x2212);

describe("formatMoney", () => {
  it("formats Italian amounts with grouping, a comma decimal and a no-break space before the euro sign", () => {
    expect(formatMoney(1234.5, "it")).toBe(`1.234,50${NBSP}€`);
  });

  it("formats English amounts with the euro sign first and no separating space", () => {
    expect(formatMoney(1234.5, "en")).toBe("€1,234.50");
  });

  it("always shows two decimals unless the integer option is passed", () => {
    expect(formatMoney(1000, "it")).toBe(`1.000,00${NBSP}€`);
    expect(formatMoney(1000, "it", { integer: true })).toBe(`1.000${NBSP}€`);
    expect(formatMoney(1000, "en", { integer: true })).toBe("€1,000");
  });

  it("formats zero", () => {
    expect(formatMoney(0, "it")).toBe(`0,00${NBSP}€`);
    expect(formatMoney(0, "en")).toBe("€0.00");
  });

  it("formats negative amounts with a typographic minus before the amount", () => {
    expect(formatMoney(-1234.5, "it")).toBe(`${MINUS}1.234,50${NBSP}€`);
    expect(formatMoney(-1234.5, "en")).toBe(`${MINUS}€1,234.50`);
  });

  it("shows a plus sign when asked, and no sign on an amount that rounds to zero", () => {
    expect(formatMoney(420.26, "it", { sign: "always" })).toBe(`+420,26${NBSP}€`);
    expect(formatMoney(-75.67, "it", { sign: "always" })).toBe(`${MINUS}75,67${NBSP}€`);
    expect(formatMoney(0.004, "it", { sign: "always" })).toBe(`0,00${NBSP}€`);
    expect(formatMoney(-0.004, "en")).toBe("€0.00");
  });
});

describe("formatAmountInput", () => {
  it("shows whole euros without decimals and any cents with two decimals", () => {
    expect(formatAmountInput(35000, "it")).toBe("35.000");
    expect(formatAmountInput(932.5, "it")).toBe("932,50");
    expect(formatAmountInput(1200.456, "en")).toBe("1,200.46");
    expect(formatAmountInput(35500, "en")).toBe("35,500");
  });
});

describe("formatNumber", () => {
  it("always groups thousands", () => {
    expect(formatNumber(1500, "it")).toBe("1.500");
    expect(formatNumber(1500, "en")).toBe("1,500");
  });

  it("does not show decimals for a whole number by default", () => {
    expect(formatNumber(45000, "it")).toBe("45.000");
  });

  it("respects an explicit fraction digit count", () => {
    expect(formatNumber(3.14159, "it", 2)).toBe("3,14");
    expect(formatNumber(3.1, "it", 2)).toBe("3,10");
  });
});

describe("formatPercent", () => {
  it("defaults to a whole-number percent with no space before the sign", () => {
    expect(formatPercent(0.5, "it")).toBe("50%");
    expect(formatPercent(0.5, "en")).toBe("50%");
  });

  it("honours an explicit fraction digit count", () => {
    expect(formatPercent(0.123, "en", 1)).toBe("12.3%");
    expect(formatPercent(0.032, "it", 1)).toBe("3,2%");
  });

  it("keeps the minus sign for a negative percent", () => {
    expect(formatPercent(-0.07, "it", 1)).toBe("-7,0%");
  });

  it("formats zero without a sign", () => {
    expect(formatPercent(0, "en", 1)).toBe("0.0%");
  });
});

describe("formatDate", () => {
  it("formats in UTC regardless of the day boundary", () => {
    const date = new Date(Date.UTC(2026, 0, 1, 0, 0));
    expect(formatDate(date, "it", "long")).toBe("01 gennaio 2026");
    expect(formatDate(date, "en", "long")).toBe("01 January 2026");
  });

  it("formats the long style with a full month name", () => {
    const date = new Date(Date.UTC(2026, 2, 15));
    expect(formatDate(date, "it", "long")).toBe("15 marzo 2026");
    expect(formatDate(date, "en", "long")).toBe("15 March 2026");
  });

  it("formats the short style as day/month/year for both locales", () => {
    const date = new Date(Date.UTC(2026, 2, 15));
    expect(formatDate(date, "it", "short")).toBe("15/03/2026");
    expect(formatDate(date, "en", "short")).toBe("15/03/2026");
  });

  it("defaults to the long style when none is given", () => {
    const date = new Date(Date.UTC(2026, 2, 15));
    expect(formatDate(date, "it")).toBe("15 marzo 2026");
  });
});

describe("parseDecimal", () => {
  it("parses Italian thousands-grouped integers", () => {
    expect(parseDecimal("35.000", "it")).toBe(35000);
  });

  it("parses Italian amounts with both grouping and a decimal comma", () => {
    expect(parseDecimal("35.000,50", "it")).toBe(35000.5);
  });

  it("parses a plain digit string identically in both locales", () => {
    expect(parseDecimal("35000", "it")).toBe(35000);
    expect(parseDecimal("35000", "en")).toBe(35000);
  });

  it("parses English amounts with comma grouping and a decimal point", () => {
    expect(parseDecimal("35,000.50", "en")).toBe(35000.5);
  });

  it("tolerates surrounding and internal spaces", () => {
    expect(parseDecimal("  35.000,50  ", "it")).toBe(35000.5);
    expect(parseDecimal("35 000,50", "it")).toBe(35000.5);
  });

  it("tolerates a leading or trailing euro sign", () => {
    expect(parseDecimal("€ 2.000", "it")).toBe(2000);
    expect(parseDecimal("35.000,50 €", "it")).toBe(35000.5);
    expect(parseDecimal("35.000,50€", "it")).toBe(35000.5);
  });

  it("tolerates a narrow no-break space before the euro sign", () => {
    const narrowNbsp = String.fromCharCode(0x202f);
    expect(parseDecimal(`35.000,50${narrowNbsp}€`, "it")).toBe(35000.5);
  });

  it("parses a signed amount", () => {
    expect(parseDecimal("-35.000,50", "it")).toBe(-35000.5);
    expect(parseDecimal("+35000", "en")).toBe(35000);
  });

  it("returns null for garbage input", () => {
    expect(parseDecimal("abc", "it")).toBeNull();
    expect(parseDecimal("", "it")).toBeNull();
    expect(parseDecimal("   ", "it")).toBeNull();
    expect(parseDecimal("€", "it")).toBeNull();
  });

  it("returns null when the fractional part is not purely numeric", () => {
    expect(parseDecimal("12,34,56.78,90", "en")).toBeNull();
  });
});

describe("parseMoneyInput", () => {
  it("parses everything parseDecimal parses", () => {
    expect(parseMoneyInput("35.000,50 €", "it")).toBe(35000.5);
    expect(parseMoneyInput("35,000.50", "en")).toBe(35000.5);
  });

  it("reads a k or mila suffix as thousands", () => {
    expect(parseMoneyInput("35k", "it")).toBe(35000);
    expect(parseMoneyInput("35 K", "en")).toBe(35000);
    expect(parseMoneyInput("35mila", "it")).toBe(35000);
    expect(parseMoneyInput("35 mila", "it")).toBe(35000);
  });

  it("reads one or two digits after either separator as a fraction of a thousand", () => {
    expect(parseMoneyInput("35,5k", "it")).toBe(35500);
    expect(parseMoneyInput("35.5k", "it")).toBe(35500);
    expect(parseMoneyInput("32,75k", "it")).toBe(32750);
  });

  it("tolerates the euro sign around a suffixed amount", () => {
    expect(parseMoneyInput("€ 35k", "it")).toBe(35000);
    expect(parseMoneyInput("35k €", "it")).toBe(35000);
  });

  it("returns null when nothing numeric precedes the suffix", () => {
    expect(parseMoneyInput("k", "it")).toBeNull();
    expect(parseMoneyInput("trentacinquemila", "it")).toBeNull();
    expect(parseMoneyInput("abc", "it")).toBeNull();
  });
});

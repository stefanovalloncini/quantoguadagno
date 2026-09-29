import { describe, expect, it } from "vitest";
import {
  checkNumber,
  moneyText,
  parseNumberText,
  percentText,
  plainNumberText,
  rateFromPercent,
  type NumberRule,
} from "./fields.ts";

const MONEY: NumberRule = { kind: "money", min: 0, max: 100_000 };
const RAL: NumberRule = {
  kind: "money",
  min: 1,
  max: 1_000_000,
  messages: {
    required: "field.error.ral.required",
    invalid: "field.error.ral.invalid",
    range: "field.error.ral.range",
  },
};

describe("parseNumberText", () => {
  it.each([
    ["35000", 35_000],
    ["35.000", 35_000],
    ["35 000", 35_000],
    ["35.000,00 €", 35_000],
    ["35k", 35_000],
    ["35K", 35_000],
    ["35,5k", 35_500],
    ["35mila", 35_000],
  ])("reads the Italian money input %s", (raw, expected) => {
    expect(parseNumberText(raw, "money", "it")).toBe(expected);
  });

  it.each([
    ["35,000", 35_000],
    ["35k", 35_000],
    ["35.5k", 35_500],
    ["€35,000.50", 35_000.5],
  ])("reads the English money input %s", (raw, expected) => {
    expect(parseNumberText(raw, "money", "en")).toBe(expected);
  });

  it("reads percentages with or without the sign", () => {
    expect(parseNumberText("0,8", "percent", "it")).toBe(0.8);
    expect(parseNumberText("0,8 %", "percent", "it")).toBe(0.8);
    expect(parseNumberText("9.49%", "percent", "en")).toBe(9.49);
  });

  it("accepts only whole numbers as integers", () => {
    expect(parseNumberText("2", "integer", "it")).toBe(2);
    expect(parseNumberText("15.000", "integer", "it")).toBe(15_000);
    expect(parseNumberText("2,5", "integer", "it")).toBeNull();
  });

  it("rejects what cannot be read without guessing", () => {
    expect(parseNumberText("abc", "money", "it")).toBeNull();
    expect(parseNumberText("35kk", "money", "it")).toBeNull();
    expect(parseNumberText("3,5,00", "money", "it")).toBeNull();
  });
});

describe("checkNumber", () => {
  it("treats an empty optional field as zero", () => {
    expect(checkNumber("", MONEY, "it")).toEqual({ ok: true, value: 0 });
    expect(checkNumber("   ", MONEY, "it")).toEqual({ ok: true, value: 0 });
  });

  it("asks for a required field with its own message", () => {
    expect(checkNumber("", RAL, "it")).toEqual({
      ok: false,
      error: { key: "field.error.ral.required" },
    });
  });

  it("accepts 35k in a required money field", () => {
    expect(checkNumber("35k", RAL, "it")).toEqual({ ok: true, value: 35_000 });
    expect(checkNumber("35k", RAL, "en")).toEqual({ ok: true, value: 35_000 });
  });

  it("uses the generic message of the kind when the field has none", () => {
    expect(checkNumber("abc", MONEY, "it")).toEqual({
      ok: false,
      error: { key: "field.error.money" },
    });
    expect(checkNumber("2,5", { kind: "integer", min: 0, max: 10 }, "it")).toEqual({
      ok: false,
      error: { key: "field.error.integer" },
    });
  });

  it("names the accepted range", () => {
    expect(checkNumber("200.000", MONEY, "it")).toEqual({
      ok: false,
      error: { key: "field.error.moneyRange", values: { min: 0, max: 100_000 } },
    });
    expect(checkNumber("-5", MONEY, "it")).toEqual({
      ok: false,
      error: { key: "field.error.moneyRange", values: { min: 0, max: 100_000 } },
    });
    expect(checkNumber("0", RAL, "it")).toEqual({
      ok: false,
      error: { key: "field.error.ral.range", values: { min: 1, max: 1_000_000 } },
    });
  });

  it("puts an empty field under a minimum above zero out of range", () => {
    expect(checkNumber("", { kind: "integer", min: 1, max: 26 }, "it")).toEqual({
      ok: false,
      error: { key: "field.error.integerRange", values: { min: 1, max: 26 } },
    });
  });
});

describe("text for values that did not come from the keyboard", () => {
  it("groups money and whole numbers the way the locale does", () => {
    expect(moneyText(30_000, "it")).toBe("30.000");
    expect(moneyText(30_000, "en")).toBe("30,000");
    expect(moneyText(1_234.5, "it")).toBe("1.234,5");
  });

  it("writes percentages with the locale's decimal separator and no grouping", () => {
    expect(percentText(0.008, "it")).toBe("0,8");
    expect(percentText(0.008, "en")).toBe("0.8");
    expect(percentText(0.0919, "it")).toBe("9,19");
    expect(percentText(0.008345, "it")).toBe("0,8345");
  });

  it("round-trips through the parser in both locales", () => {
    for (const locale of ["it", "en"] as const) {
      expect(parseNumberText(moneyText(35_000, locale), "money", locale)).toBe(35_000);
      expect(parseNumberText(percentText(0.0949, locale), "percent", locale)).toBe(9.49);
      expect(parseNumberText(plainNumberText(15_000, locale), "integer", locale)).toBe(15_000);
    }
  });

  it("keeps six decimals when turning a percentage into a rate, like the live links", () => {
    expect(rateFromPercent(0.8)).toBe(0.008);
    expect(rateFromPercent(0.83456)).toBe(0.008346);
  });
});

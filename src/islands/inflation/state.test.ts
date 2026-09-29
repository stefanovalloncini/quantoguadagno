import { describe, expect, it } from "vitest";
import { FOI_LATEST_YEAR } from "@/data/index.ts";
import {
  adoptField,
  DEFAULT_STATE,
  isFoiYear,
  updateAmount,
  updateFromYear,
  updateToYear,
  validate,
} from "./state.ts";

describe("DEFAULT_STATE", () => {
  it("matches the old tool's defaults", () => {
    expect(DEFAULT_STATE).toEqual({ amount: 1000, fromYear: 2015, toYear: FOI_LATEST_YEAR });
  });
});

describe("isFoiYear", () => {
  it("accepts years covered by the FOI series", () => {
    expect(isFoiYear(2015)).toBe(true);
    expect(isFoiYear(FOI_LATEST_YEAR)).toBe(true);
  });

  it("rejects years outside the series", () => {
    expect(isFoiYear(1999)).toBe(false);
    expect(isFoiYear(FOI_LATEST_YEAR + 1)).toBe(false);
  });
});

describe("pure updaters", () => {
  it("only change the targeted field", () => {
    expect(updateAmount(DEFAULT_STATE, 5000)).toEqual({ ...DEFAULT_STATE, amount: 5000 });
    expect(updateFromYear(DEFAULT_STATE, 2020)).toEqual({ ...DEFAULT_STATE, fromYear: 2020 });
    expect(updateToYear(DEFAULT_STATE, 2024)).toEqual({ ...DEFAULT_STATE, toYear: 2024 });
  });
});

describe("validate", () => {
  it("returns no errors for the defaults", () => {
    expect(validate(DEFAULT_STATE)).toEqual({});
  });

  it("flags an amount outside 0..10,000,000", () => {
    expect(validate({ ...DEFAULT_STATE, amount: -1 })).toHaveProperty("amount");
    expect(validate({ ...DEFAULT_STATE, amount: 10_000_001 })).toHaveProperty("amount");
  });

  it("flags a fromYear or toYear outside the FOI series", () => {
    expect(validate({ ...DEFAULT_STATE, fromYear: 1900 })).toHaveProperty("fromYear");
    expect(validate({ ...DEFAULT_STATE, toYear: 1900 })).toHaveProperty("toYear");
  });

  it("allows toYear before fromYear, same as the old tool", () => {
    expect(validate({ ...DEFAULT_STATE, fromYear: 2020, toYear: 2015 })).toEqual({});
  });
});

describe("adoptField", () => {
  it("parses the amount as a money field", () => {
    expect(adoptField(DEFAULT_STATE, "amount", "35k", "it").amount).toBe(35_000);
  });

  it("keeps the previous amount when unparseable", () => {
    expect(adoptField(DEFAULT_STATE, "amount", "abc", "it")).toEqual(DEFAULT_STATE);
  });

  it("parses fromYear and toYear as plain integers", () => {
    expect(adoptField(DEFAULT_STATE, "fromYear", "2018", "it").fromYear).toBe(2018);
    expect(adoptField(DEFAULT_STATE, "toYear", "2022", "it").toYear).toBe(2022);
  });

  it("ignores an unknown field", () => {
    expect(adoptField(DEFAULT_STATE, "bogus", "1", "it")).toEqual(DEFAULT_STATE);
  });
});

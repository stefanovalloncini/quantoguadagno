import { describe, expect, it } from "vitest";
import { EMPLOYEE_PARAMS } from "@/queryParams.ts";
import { hasQueryValues, readQuery, writeQuery } from "./query.ts";

describe("readQuery", () => {
  it("reads short names and falls back to the legacy long ones", () => {
    expect(readQuery("?lordo=35000&anno=2025&r=lazio", EMPLOYEE_PARAMS)).toEqual({
      l: "35000",
      y: "2025",
      r: "lazio",
    });
  });

  it("prefers the short name when both are present", () => {
    expect(readQuery("?lordo=1&l=2", EMPLOYEE_PARAMS)).toEqual({ l: "2" });
  });

  it("ignores names the route does not own", () => {
    expect(readQuery("?fbclid=abc&utm_source=x&zz=1", EMPLOYEE_PARAMS)).toEqual({});
  });

  it("keeps empty values so the page can decide what they mean", () => {
    expect(readQuery("?l=", EMPLOYEE_PARAMS)).toEqual({ l: "" });
  });
});

describe("writeQuery", () => {
  it("writes short names in table order and drops unknown or unset values", () => {
    expect(
      writeQuery({ y: "2025", zz: "1", l: "40000", lordo: "1", r: undefined }, EMPLOYEE_PARAMS),
    ).toBe("l=40000&y=2025");
  });

  it("returns an empty string when there is nothing to share", () => {
    expect(writeQuery({}, EMPLOYEE_PARAMS)).toBe("");
  });
});

describe("hasQueryValues", () => {
  it("tells a restore apart from an empty query", () => {
    expect(hasQueryValues({})).toBe(false);
    expect(hasQueryValues({ l: undefined })).toBe(false);
    expect(hasQueryValues({ l: "1" })).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import {
  isCcnlId,
  parseDates,
  PREAVVISO_DEFAULTS,
  updateCcnlId,
  updateHireDate,
  updateLivelloId,
  updateResignationDate,
  validatePreavviso,
} from "./state.ts";

describe("PREAVVISO_DEFAULTS", () => {
  it("matches the OLD tool defaults (Commercio, 2020-01-01 to 2026-05-18)", () => {
    expect(PREAVVISO_DEFAULTS).toEqual({
      ccnlId: "commercio",
      livelloId: "quadro-1",
      hireDate: "2020-01-01",
      resignationDate: "2026-05-18",
    });
  });
});

describe("isCcnlId", () => {
  it("accepts the four known CCNLs and rejects anything else", () => {
    expect(isCcnlId("commercio")).toBe(true);
    expect(isCcnlId("logistica")).toBe(true);
    expect(isCcnlId("nope")).toBe(false);
  });
});

describe("updateCcnlId", () => {
  it("resets the livello to the new CCNL's first level, like the OLD tool's setCcnl", () => {
    const next = updateCcnlId(PREAVVISO_DEFAULTS, "logistica");
    expect(next.ccnlId).toBe("logistica");
    expect(next.livelloId).toBe("quadri-1");
  });
});

describe("updateLivelloId, updateHireDate, updateResignationDate", () => {
  it("each only changes its own field", () => {
    expect(updateLivelloId(PREAVVISO_DEFAULTS, "2-3")).toEqual({
      ...PREAVVISO_DEFAULTS,
      livelloId: "2-3",
    });
    expect(updateHireDate(PREAVVISO_DEFAULTS, "2019-01-01")).toEqual({
      ...PREAVVISO_DEFAULTS,
      hireDate: "2019-01-01",
    });
    expect(updateResignationDate(PREAVVISO_DEFAULTS, "2027-01-01")).toEqual({
      ...PREAVVISO_DEFAULTS,
      resignationDate: "2027-01-01",
    });
  });
});

describe("parseDates", () => {
  it("parses two valid ordered dates", () => {
    const dates = parseDates(PREAVVISO_DEFAULTS);
    expect(dates?.hire.toISOString().slice(0, 10)).toBe("2020-01-01");
    expect(dates?.resignation.toISOString().slice(0, 10)).toBe("2026-05-18");
  });

  it("returns null when the resignation date is not after the hire date", () => {
    expect(parseDates(updateResignationDate(PREAVVISO_DEFAULTS, "2020-01-01"))).toBeNull();
    expect(parseDates(updateResignationDate(PREAVVISO_DEFAULTS, "2010-01-01"))).toBeNull();
  });

  it("returns null for an unparseable date", () => {
    expect(parseDates(updateHireDate(PREAVVISO_DEFAULTS, "not-a-date"))).toBeNull();
  });
});

describe("validatePreavviso", () => {
  it("has no errors for the defaults", () => {
    expect(validatePreavviso(PREAVVISO_DEFAULTS)).toEqual({});
  });

  it("flags resignation preceding hire on the resignationDate field, reusing the ported key", () => {
    const state = updateResignationDate(PREAVVISO_DEFAULTS, "2010-01-01");
    expect(validatePreavviso(state).resignationDate).toBe("preavviso.form.error.invalidDates");
  });

  it("flags an unknown ccnlId", () => {
    const state = {
      ...PREAVVISO_DEFAULTS,
      ccnlId: "nope" as (typeof PREAVVISO_DEFAULTS)["ccnlId"],
    };
    expect(validatePreavviso(state).ccnlId).toBe("preavviso.form.ccnl.error");
  });

  it("flags a livelloId that does not belong to the selected CCNL", () => {
    const state = updateLivelloId(PREAVVISO_DEFAULTS, "operai");
    expect(validatePreavviso(state).livelloId).toBe("preavviso.form.livello.error");
  });
});

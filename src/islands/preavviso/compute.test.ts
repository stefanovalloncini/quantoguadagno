import { describe, expect, it } from "vitest";
import { CCNL_TABLE } from "@/data/index.ts";
import { calculatePreavviso } from "@/domain/index.ts";
import { computePreavviso } from "./compute.ts";
import {
  PREAVVISO_DEFAULTS,
  updateCcnlId,
  updateHireDate,
  updateLivelloId,
  updateResignationDate,
} from "./state.ts";

describe("computePreavviso", () => {
  it("matches calling the engine directly for the defaults", () => {
    expect(computePreavviso(PREAVVISO_DEFAULTS)).toEqual(
      calculatePreavviso({
        ccnl: CCNL_TABLE.commercio,
        livelloId: "quadro-1",
        hireDate: new Date("2020-01-01"),
        resignationDate: new Date("2026-05-18"),
      }),
    );
  });

  it("recomputes for a different CCNL and livello", () => {
    const state = updateLivelloId(updateCcnlId(PREAVVISO_DEFAULTS, "logistica"), "operai");
    const result = computePreavviso(state);
    expect(result?.workingDays).toBe(true);
  });

  it("returns null when the resignation date precedes the hire date", () => {
    const state = updateResignationDate(PREAVVISO_DEFAULTS, "2010-01-01");
    expect(computePreavviso(state)).toBeNull();
  });

  it("returns null for an unparseable date instead of throwing", () => {
    const state = updateHireDate(PREAVVISO_DEFAULTS, "not-a-date");
    expect(computePreavviso(state)).toBeNull();
  });

  it("returns null for an unknown ccnlId instead of throwing", () => {
    const state = {
      ...PREAVVISO_DEFAULTS,
      ccnlId: "nope" as (typeof PREAVVISO_DEFAULTS)["ccnlId"],
    };
    expect(computePreavviso(state)).toBeNull();
  });

  it("falls back to the CCNL's first livello instead of throwing on an unknown livelloId", () => {
    const state = updateLivelloId(PREAVVISO_DEFAULTS, "nope");
    expect(computePreavviso(state)).toEqual(
      calculatePreavviso({
        ccnl: CCNL_TABLE.commercio,
        livelloId: "quadro-1",
        hireDate: new Date("2020-01-01"),
        resignationDate: new Date("2026-05-18"),
      }),
    );
  });
});

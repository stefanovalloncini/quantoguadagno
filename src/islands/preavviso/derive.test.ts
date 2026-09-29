import { describe, expect, it } from "vitest";
import { CCNL_TABLE } from "@/data/index.ts";
import { calculatePreavviso } from "@/domain/index.ts";
import {
  derivePreavviso,
  noticeDaysNoteKey,
  noticeTableFor,
  seniorityBandMessageKey,
} from "./derive.ts";
import { PREAVVISO_DEFAULTS, updateCcnlId } from "./state.ts";

describe("noticeTableFor", () => {
  it("lists every livello of the CCNL with its notice days by band", () => {
    const table = noticeTableFor(CCNL_TABLE.commercio);
    expect(table).toHaveLength(4);
    const level23 = table.find((row) => row.livelloId === "2-3");
    expect(level23?.notice).toEqual([
      { band: "lt-5y", days: 20 },
      { band: "5-10y", days: 30 },
      { band: "gt-10y", days: 45 },
    ]);
    expect(level23?.workingDays).toBe(false);
  });

  it("flags the working-days livello for logistica operai", () => {
    const table = noticeTableFor(CCNL_TABLE.logistica);
    const operai = table.find((row) => row.livelloId === "operai");
    expect(operai?.workingDays).toBe(true);
  });
});

describe("seniorityBandMessageKey", () => {
  it("maps every band to its message key", () => {
    expect(seniorityBandMessageKey("lt-5y")).toBe("preavviso.result.band.lt-5y");
    expect(seniorityBandMessageKey("gt-3y")).toBe("preavviso.result.band.gt-3y");
  });
});

describe("noticeDaysNoteKey", () => {
  it("picks the working-days or calendar-days note", () => {
    expect(noticeDaysNoteKey(true)).toBe("preavviso.result.workingDays.note");
    expect(noticeDaysNoteKey(false)).toBe("preavviso.result.calendarDays.note");
  });
});

describe("derivePreavviso", () => {
  it("builds the notice table for the current CCNL and reads the band off the result", () => {
    const result = calculatePreavviso({
      ccnl: CCNL_TABLE.commercio,
      livelloId: "quadro-1",
      hireDate: new Date("2020-01-01"),
      resignationDate: new Date("2026-05-18"),
    });
    const derived = derivePreavviso(PREAVVISO_DEFAULTS, result);
    expect(derived.noticeTable).toEqual(noticeTableFor(CCNL_TABLE.commercio));
    expect(derived.bandMessageKey).toBe(seniorityBandMessageKey(result.band));
    expect(derived.daysNoteKey).toBe(noticeDaysNoteKey(result.workingDays));
  });

  it("still returns a notice table when there is no result yet", () => {
    const derived = derivePreavviso(PREAVVISO_DEFAULTS, null);
    expect(derived.noticeTable.length).toBeGreaterThan(0);
    expect(derived.bandMessageKey).toBeNull();
    expect(derived.daysNoteKey).toBeNull();
  });

  it("switches the notice table when the CCNL changes", () => {
    const state = updateCcnlId(PREAVVISO_DEFAULTS, "cooperative-sociali");
    const derived = derivePreavviso(state, null);
    expect(derived.noticeTable).toEqual(noticeTableFor(CCNL_TABLE["cooperative-sociali"]));
  });
});

import { describe, expect, it } from "vitest";
import { calculatePreavviso } from "./preavviso.ts";
import { CCNL_TABLE } from "@/data/index.ts";

const commercio = CCNL_TABLE.commercio;
const logistica = CCNL_TABLE.logistica;
const cooperative = CCNL_TABLE["cooperative-sociali"];

describe("seniority bands", () => {
  it("classifies < 5 years (Commercio)", () => {
    const r = calculatePreavviso({
      ccnl: commercio,
      livelloId: "2-3",
      hireDate: new Date("2023-01-01"),
      resignationDate: new Date("2026-05-18"),
    });
    expect(r.band).toBe("lt-5y");
    expect(r.noticeDays).toBe(20);
  });

  it("classifies 5–10 years (Commercio)", () => {
    const r = calculatePreavviso({
      ccnl: commercio,
      livelloId: "2-3",
      hireDate: new Date("2019-01-01"),
      resignationDate: new Date("2026-01-01"),
    });
    expect(r.band).toBe("5-10y");
    expect(r.noticeDays).toBe(30);
  });

  it("classifies > 10 years (Commercio)", () => {
    const r = calculatePreavviso({
      ccnl: commercio,
      livelloId: "quadro-1",
      hireDate: new Date("2010-01-01"),
      resignationDate: new Date("2026-01-01"),
    });
    expect(r.band).toBe("gt-10y");
    expect(r.noticeDays).toBe(90);
  });

  it("classifies ≤ 3 years for cooperative-sociali", () => {
    const r = calculatePreavviso({
      ccnl: cooperative,
      livelloId: "e2-f2",
      hireDate: new Date("2024-01-01"),
      resignationDate: new Date("2026-05-18"),
    });
    expect(r.band).toBe("lte-3y");
    expect(r.noticeDays).toBe(90);
  });

  it("classifies > 3 years for cooperative-sociali", () => {
    const r = calculatePreavviso({
      ccnl: cooperative,
      livelloId: "e2-f2",
      hireDate: new Date("2019-01-01"),
      resignationDate: new Date("2026-05-18"),
    });
    expect(r.band).toBe("gt-3y");
    expect(r.noticeDays).toBe(120);
  });
});

describe("exit date", () => {
  it("adds calendar days for non-working-days livello", () => {
    const r = calculatePreavviso({
      ccnl: commercio,
      livelloId: "6-7",
      hireDate: new Date("2024-01-01"),
      resignationDate: new Date("2026-05-01"),
    });
    expect(r.exitDate.toISOString().slice(0, 10)).toBe("2026-05-11");
  });

  it("uses working days for logistica operai", () => {
    const r = calculatePreavviso({
      ccnl: logistica,
      livelloId: "operai",
      hireDate: new Date("2024-01-01"),
      resignationDate: new Date("2026-05-04"),
    });
    expect(r.exitDate.toISOString().slice(0, 10)).toBe("2026-05-12");
    expect(r.workingDays).toBe(true);
  });

  it("skips weekends when adding working days", () => {
    const r = calculatePreavviso({
      ccnl: logistica,
      livelloId: "operai",
      hireDate: new Date("2024-01-01"),
      resignationDate: new Date("2026-05-08"),
    });
    expect(r.exitDate.toISOString().slice(0, 10)).toBe("2026-05-18");
  });
});

describe("error handling", () => {
  it("throws on unknown livello", () => {
    expect(() =>
      calculatePreavviso({
        ccnl: commercio,
        livelloId: "nope",
        hireDate: new Date("2024-01-01"),
        resignationDate: new Date("2026-01-01"),
      }),
    ).toThrow(/Unknown livello/);
  });
});

import { describe, expect, it } from "vitest";
import { param, SUPPORTED_YEARS, yearStart, type SupportedYear } from "@/data/index.ts";
import { STORED_PARAMS } from "@/data/stored.ts";
import { getAutonomiConfig, getNaspiConfig, getTaxConfig } from "./taxConfig.ts";

describe("configurazione annuale costruita dal registro", () => {
  it("i parametri cambiano solo il 1° gennaio, quindi la configurazione dell'anno li vede tutti", () => {
    for (const [key, definition] of Object.entries(STORED_PARAMS)) {
      for (const entry of definition.entries) expect(`${key}@${entry.from}`).toMatch(/-01-01$/);
    }
  });

  it.each(SUPPORTED_YEARS)("%i: legge i valori del registro al 1° gennaio", (year) => {
    const at = yearStart(year);
    const cfg = getTaxConfig(year);
    expect(cfg.year).toBe(year);
    expect(cfg.inps.ceiling).toBe(param("inps.firstBand", at));
    expect(cfg.inps.aboveCeilingRate).toBe(param("inps.employee.rateAboveFirstBand", at));
    expect(cfg.irpefBrackets).toBe(param("irpef.brackets", at));
    expect(cfg.workDeduction.midBracketBonus).toEqual({ above: 25_000, upTo: 35_000, amount: 65 });
    expect(cfg.employerInps.aboveCeilingRate).toBe(cfg.employerInps.rate);
    expect(getAutonomiConfig(year).artigiani.massimaleAnte1996).toBe(
      param("inps.autonomi.massimaleAnte1996", at),
    );
    expect(getNaspiConfig(year).soglia).toBe(param("naspi.soglia", at));
  });

  it("costruisce ogni anno una volta sola", () => {
    expect(getTaxConfig(2026)).toBe(getTaxConfig(2026));
    expect(getAutonomiConfig(2025)).toBe(getAutonomiConfig(2025));
  });

  it("rifiuta un anno che il registro non copre", () => {
    expect(() => getTaxConfig(2023 as SupportedYear)).toThrow(RangeError);
    expect(() => getNaspiConfig(2027 as SupportedYear)).toThrow(RangeError);
  });
});

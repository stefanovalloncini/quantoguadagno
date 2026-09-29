import { describe, expect, it } from "vitest";
import { REGION_CODES } from "./regions.ts";
import {
  isSupportedYear,
  LATEST_SUPPORTED_YEAR,
  param,
  SUPPORTED_YEARS,
  yearlyKeys,
  yearStart,
} from "./registry.ts";
import { STORED_PARAMS, type StoredKey } from "./stored.ts";
import type { IsoDate } from "./types.ts";

const STORED_KEYS = Object.keys(STORED_PARAMS) as StoredKey[];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("param: il valore in vigore a una data", () => {
  it("sceglie la voce in vigore alla data richiesta", () => {
    const rates = (date: IsoDate) => param("irpef.brackets", date).map((bracket) => bracket.rate);
    expect(rates("2024-01-01")).toEqual([0.23, 0.35, 0.43]);
    expect(rates("2025-12-31")).toEqual([0.23, 0.35, 0.43]);
    expect(rates("2026-01-01")).toEqual([0.23, 0.33, 0.43]);
    expect(rates("2026-07-15")).toEqual([0.23, 0.33, 0.43]);
  });

  it("un valore resta in vigore finché non ne arriva uno nuovo", () => {
    expect(param("fringe.mealVouchers.electronic", "2024-06-30")).toBe(8);
    expect(param("fringe.mealVouchers.electronic", "2025-12-31")).toBe(8);
    expect(param("fringe.mealVouchers.electronic", "2026-01-01")).toBe(10);
    expect(param("fringe.mealVouchers.electronic", "2031-01-01")).toBe(10);
  });

  it("una misura temporanea smette di valere: l'esonero contributivo solo nel 2024", () => {
    expect(param("inps.employee.exemption2024", "2024-12-31")).not.toBeNull();
    expect(param("inps.employee.exemption2024", "2025-01-01")).toBeNull();
  });

  it("una misura può arrivare dopo il primo anno: il taglio del cuneo dal 2025", () => {
    expect(param("irpef.taxWedgeCut", "2024-12-31")).toBeNull();
    expect(param("irpef.taxWedgeCut", "2025-01-01")?.detrazioneAggiuntiva.maxDeduction).toBe(1000);
  });

  it("i valori rivalutati cambiano ogni 1° gennaio", () => {
    expect(param("inps.massimale", "2024-12-31")).toBe(119_650);
    expect(param("inps.massimale", "2025-01-01")).toBe(120_607);
    expect(param("inps.massimale", "2026-01-01")).toBe(122_295);
  });

  it("i valori derivati si risolvono alla stessa data dei loro dati", () => {
    expect(param("inps.autonomi.massimaleAnte1996", "2024-12-31")).toBe(91_680);
    expect(param("inps.autonomi.massimaleAnte1996", "2025-01-01")).toBe(92_413);
  });

  it("prima della prima voce non c'è un valore: errore", () => {
    expect(() => param("inps.massimale", "2023-12-31")).toThrow(RangeError);
    expect(() => param("inps.autonomi.massimaleAnte1996", "2023-12-31")).toThrow(RangeError);
  });

  it("accetta solo date AAAA-MM-GG", () => {
    expect(() => param("inps.massimale", "2024-1-1")).toThrow(RangeError);
  });
});

describe("registro: forma delle voci", () => {
  it.each(STORED_KEYS)("%s: date AAAA-MM-GG in ordine strettamente crescente", (key) => {
    const dates = STORED_PARAMS[key].entries.map((entry) => entry.from);
    for (const date of dates) expect(date).toMatch(ISO_DATE);
    dates.slice(1).forEach((date, i) => {
      expect(date > (dates[i] ?? "")).toBe(true);
    });
  });

  it.each(STORED_KEYS)("%s: ogni voce cita una fonte", (key) => {
    for (const { source } of STORED_PARAMS[key].entries) {
      expect(source.ref.trim()).not.toBe("");
      if (source.url !== undefined) expect(source.url).toMatch(/^https?:\/\/\S+$/);
      for (const date of [source.published, source.verified, source.retrieved]) {
        if (date !== undefined) expect(date).toMatch(ISO_DATE);
      }
    }
  });

  it("ogni regione ha la sua addizionale nel registro", () => {
    for (const code of REGION_CODES) expect(STORED_KEYS).toContain(`regions.${code}`);
  });
});

describe("anni supportati", () => {
  it("sono ricavati dalle voci dei parametri rivalutati ogni anno", () => {
    const years = new Set<number>();
    for (const key of yearlyKeys()) {
      for (const { from } of STORED_PARAMS[key].entries) {
        if (from.endsWith("-01-01")) years.add(Number(from.slice(0, 4)));
      }
    }
    expect(SUPPORTED_YEARS).toEqual([...years].sort((a, b) => a - b));
  });

  it("oggi vanno dal 2024 al 2026", () => {
    expect(SUPPORTED_YEARS).toEqual([2024, 2025, 2026]);
    expect(LATEST_SUPPORTED_YEAR).toBe(2026);
    expect(isSupportedYear(2025)).toBe(true);
    expect(isSupportedYear(2023)).toBe(false);
    expect(isSupportedYear(2027)).toBe(false);
  });

  it("sono rivalutati ogni anno prima fascia, massimale, minimale, NASpI e addizionali regionali", () => {
    expect([...yearlyKeys()].sort()).toEqual(
      [
        "inps.firstBand",
        "inps.massimale",
        "inps.autonomi.minimale",
        "naspi.soglia",
        "naspi.massimale",
        ...REGION_CODES.map((code) => `regions.${code}`),
      ].sort(),
    );
  });

  it.each(yearlyKeys())("%s: una voce dal 1° gennaio di ogni anno supportato", (key) => {
    const starts = STORED_PARAMS[key].entries.map((entry) => entry.from);
    for (const year of SUPPORTED_YEARS) expect(starts).toContain(yearStart(year));
  });
});

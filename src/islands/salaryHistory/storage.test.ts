import { describe, expect, it } from "vitest";
import { decodeStored } from "@/islands/runtime/storage.ts";
import {
  buildEntry,
  DEFAULT_ENTRY_SETTINGS,
  LEGACY_ENTRY_SETTINGS,
  makeId,
  parseSalaryEntries,
  parseSalaryEntry,
  SALARY_HISTORY_CODEC,
  sortEntriesByYear,
  type SalaryEntry,
} from "./storage.ts";

const VALID = {
  id: "abc",
  year: 2024,
  grossAnnual: 30_000,
  createdAt: "2024-06-01T00:00:00Z",
  settings: {
    contractType: "indeterminato",
    regionCode: "lazio",
    municipalTaxRate: 0.008,
    paymentFrequency: 13,
  },
} as const;

const OLD_SHAPE_VALID = {
  id: "abc",
  year: 2024,
  grossAnnual: 30_000,
  createdAt: "2024-06-01T00:00:00Z",
};

describe("SALARY_HISTORY_CODEC key", () => {
  it("uses the key the live site already wrote entries under", () => {
    expect(SALARY_HISTORY_CODEC.key).toBe("qg.salary-history.v1");
  });
});

describe("parseSalaryEntry", () => {
  it("accepts a new-shape entry with a settings block", () => {
    const entry = parseSalaryEntry(VALID);
    expect(entry?.settings.regionCode).toBe("lazio");
    expect(entry?.settings.contractType).toBe("indeterminato");
    expect(entry?.settings.paymentFrequency).toBe(13);
    expect(entry?.settings.municipalTaxRate).toBeCloseTo(0.008);
    expect(entry?.isMigrated).toBeUndefined();
  });

  it("migrates an old-shape entry with the settings the live site assumed and flags it", () => {
    const entry = parseSalaryEntry(OLD_SHAPE_VALID);
    expect(entry).not.toBeNull();
    expect(entry?.settings).toEqual(LEGACY_ENTRY_SETTINGS);
    expect(entry?.settings.regionCode).toBe("lazio");
    expect(entry?.isMigrated).toBe(true);
  });

  it("starts new entries in Lombardia, like every other tool", () => {
    expect(DEFAULT_ENTRY_SETTINGS.regionCode).toBe("lombardia");
  });

  it("migration preserves a legacy top-level contractType", () => {
    const entry = parseSalaryEntry({ ...OLD_SHAPE_VALID, contractType: "apprendistato" });
    expect(entry?.settings.contractType).toBe("apprendistato");
    expect(entry?.isMigrated).toBe(true);
  });

  it("migration drops an unknown legacy contractType", () => {
    const entry = parseSalaryEntry({ ...OLD_SHAPE_VALID, contractType: "freelance" });
    expect(entry?.settings.contractType).toBe("indeterminato");
  });

  it("preserves optional settings when present", () => {
    const dependents = {
      hasSpouse: true,
      spouseIncome: 0,
      childrenOver21: 1,
      otherDependents: 0,
    };
    const entry = parseSalaryEntry({
      ...VALID,
      settings: { ...VALID.settings, dependents, companySize: "large" },
    });
    expect(entry?.settings.dependents).toEqual(dependents);
    expect(entry?.settings.companySize).toBe("large");
  });

  it("drops unknown values inside settings silently, falling back to defaults", () => {
    const entry = parseSalaryEntry({
      ...VALID,
      settings: { ...VALID.settings, regionCode: "atlantis", companySize: "tiny" },
    });
    expect(entry?.settings.regionCode).toBe("lazio");
    expect(entry?.settings.companySize).toBeUndefined();
  });

  it("drops empty notes", () => {
    const entry = parseSalaryEntry({ ...VALID, note: "" });
    expect(entry?.note).toBeUndefined();
  });

  it("rejects missing id, year, gross or createdAt", () => {
    expect(parseSalaryEntry({ ...VALID, id: undefined })).toBeNull();
    expect(parseSalaryEntry({ ...VALID, year: undefined })).toBeNull();
    expect(parseSalaryEntry({ ...VALID, grossAnnual: undefined })).toBeNull();
    expect(parseSalaryEntry({ ...VALID, createdAt: undefined })).toBeNull();
  });

  it("rejects unreasonable years", () => {
    expect(parseSalaryEntry({ ...VALID, year: 1700 })).toBeNull();
    expect(parseSalaryEntry({ ...VALID, year: 2200 })).toBeNull();
  });

  it("rejects negative gross", () => {
    expect(parseSalaryEntry({ ...VALID, grossAnnual: -1 })).toBeNull();
  });

  it("rejects non-object input", () => {
    expect(parseSalaryEntry(null)).toBeNull();
    expect(parseSalaryEntry(42)).toBeNull();
    expect(parseSalaryEntry("hi")).toBeNull();
  });
});

describe("parseSalaryEntries", () => {
  it("returns an empty array for non-array input", () => {
    expect(parseSalaryEntries(null)).toEqual([]);
    expect(parseSalaryEntries({})).toEqual([]);
  });

  it("drops invalid items and keeps the valid ones", () => {
    const result = parseSalaryEntries([VALID, "garbage", { ...VALID, id: "" }]);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("abc");
  });
});

describe("sortEntriesByYear", () => {
  it("sorts ascending by year without mutating the input", () => {
    const input: SalaryEntry[] = [
      { ...VALID, id: "a", year: 2024 },
      { ...VALID, id: "b", year: 2020 },
      { ...VALID, id: "c", year: 2022 },
    ];
    const sorted = sortEntriesByYear(input);
    expect(sorted.map((e) => e.year)).toEqual([2020, 2022, 2024]);
    expect(input.map((e) => e.year)).toEqual([2024, 2020, 2022]);
  });
});

describe("makeId", () => {
  it("returns a non-empty unique string", () => {
    expect(makeId().length).toBeGreaterThan(0);
    expect(makeId()).not.toBe(makeId());
  });
});

describe("buildEntry", () => {
  it("builds an entry from a new-entry draft, dropping an empty note", () => {
    const entry = buildEntry(
      { year: 2024, grossAnnual: 30_000, settings: DEFAULT_ENTRY_SETTINGS, note: "" },
      "id-1",
      "2024-06-01T00:00:00.000Z",
    );
    expect(entry).toEqual({
      id: "id-1",
      year: 2024,
      grossAnnual: 30_000,
      createdAt: "2024-06-01T00:00:00.000Z",
      settings: DEFAULT_ENTRY_SETTINGS,
    });
  });

  it("keeps a non-empty note and falls back to the default settings", () => {
    const entry = buildEntry({ year: 2024, grossAnnual: 30_000, note: "raise" }, "id-2", "now");
    expect(entry.note).toBe("raise");
    expect(entry.settings).toEqual(DEFAULT_ENTRY_SETTINGS);
  });
});

describe("the codec, exactly as the live site reads and writes it", () => {
  it("round-trips saved entries through encode/decode", () => {
    const entries = [
      { ...VALID, id: "e-2023", year: 2023, grossAnnual: 25_000 },
      { ...VALID, id: "e-2024", year: 2024, grossAnnual: 30_000 },
    ];
    const raw = SALARY_HISTORY_CODEC.encode(entries);
    expect(decodeStored(SALARY_HISTORY_CODEC, raw)).toEqual(entries);
  });

  it("drops entries that fail validation, keeping the valid ones", () => {
    const raw = JSON.stringify([
      { ...VALID, id: "e-2024" },
      { garbage: true },
      42,
      null,
      { id: "", year: 2024, grossAnnual: 1, createdAt: "x", settings: DEFAULT_ENTRY_SETTINGS },
    ]);
    const decoded = SALARY_HISTORY_CODEC.decode(raw);
    expect(decoded).toHaveLength(1);
    expect(decoded[0]?.id).toBe("e-2024");
  });

  it("falls back to an empty array for the fallback value", () => {
    expect(SALARY_HISTORY_CODEC.fallback).toEqual([]);
  });

  it("falls back to an empty array when the stored value is not valid JSON, via decodeStored", () => {
    expect(decodeStored(SALARY_HISTORY_CODEC, "{not json")).toEqual([]);
  });
});

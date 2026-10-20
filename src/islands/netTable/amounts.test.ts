import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/locales.ts";
import {
  COMMON_AMOUNTS,
  NET_TABLE_AMOUNTS,
  amountOfSlug,
  neighboursOf,
  netTableSlug,
} from "./amounts.ts";

describe("amounts of the net table", () => {
  it("go from 12.000 to 60.000 by 1.000, to 100.000 by 5.000, then 120.000 and 150.000", () => {
    expect(NET_TABLE_AMOUNTS).toHaveLength(59);
    expect(NET_TABLE_AMOUNTS.slice(0, 3)).toEqual([12_000, 13_000, 14_000]);
    expect(NET_TABLE_AMOUNTS.slice(47, 51)).toEqual([59_000, 60_000, 65_000, 70_000]);
    expect(NET_TABLE_AMOUNTS.slice(-4)).toEqual([95_000, 100_000, 120_000, 150_000]);
  });

  it("are whole euros, sorted and unique", () => {
    for (const amount of NET_TABLE_AMOUNTS) expect(Number.isInteger(amount)).toBe(true);
    expect([...NET_TABLE_AMOUNTS].sort((a, b) => a - b)).toEqual(NET_TABLE_AMOUNTS);
    expect(new Set(NET_TABLE_AMOUNTS).size).toBe(NET_TABLE_AMOUNTS.length);
  });

  it("include the twelve amounts the home page lists", () => {
    expect(COMMON_AMOUNTS).toHaveLength(12);
    for (const amount of COMMON_AMOUNTS) expect(NET_TABLE_AMOUNTS).toContain(amount);
  });
});

describe("slugs", () => {
  it("name the amount in whole euros", () => {
    expect(netTableSlug(30_000, "it")).toBe("30000-euro-lordi");
    expect(netTableSlug(30_000, "en")).toBe("30000-euro-gross");
  });

  it.each(LOCALES)("round-trip for every amount in %s", (locale) => {
    for (const amount of NET_TABLE_AMOUNTS) {
      expect(amountOfSlug(netTableSlug(amount, locale), locale)).toBe(amount);
    }
  });

  it("refuse amounts without a page and slugs of the other language", () => {
    expect(amountOfSlug("30500-euro-lordi", "it")).toBeNull();
    expect(amountOfSlug("030000-euro-lordi", "it")).toBeNull();
    expect(amountOfSlug("30000-euro-gross", "it")).toBeNull();
    expect(amountOfSlug("30000-euro-lordi", "en")).toBeNull();
    expect(amountOfSlug("-euro-lordi", "it")).toBeNull();
  });
});

describe("previous and next amounts", () => {
  it("stop at the two ends of the table", () => {
    expect(neighboursOf(12_000)).toEqual({ previous: null, next: 13_000 });
    expect(neighboursOf(150_000)).toEqual({ previous: 120_000, next: null });
    expect(neighboursOf(60_000)).toEqual({ previous: 59_000, next: 65_000 });
  });

  it("link every amount to its neighbours both ways", () => {
    for (const amount of NET_TABLE_AMOUNTS) {
      const { previous, next } = neighboursOf(amount);
      if (previous !== null) expect(neighboursOf(previous).next).toBe(amount);
      if (next !== null) expect(neighboursOf(next).previous).toBe(amount);
    }
  });

  it("refuse an amount without a page", () => {
    expect(() => neighboursOf(30_500)).toThrow();
  });
});

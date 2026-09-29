import { describe, expect, it } from "vitest";
import { COMUNI_SOURCE } from "@/data/comuni.ts";
import { latestVerification as computedLatestVerification, listParameters } from "@/data/fonti.ts";
import { SUPPORTED_YEARS } from "@/data/registry.ts";
import { STORED_PARAMS } from "@/data/stored.ts";
import * as storedValues from "@/data/storedValues.ts";
import {
  countUnverified,
  isComuniDatasetVerified,
  latestVerification,
} from "@/data/verification.ts";
import * as verificationSnapshot from "@/data/verificationSnapshot.ts";
import { serializeExport, snapshotSource } from "./clientSnapshots.ts";

describe("serializeExport", () => {
  it("writes plain data as a module constant", () => {
    expect(serializeExport("VALUES", { rate: 0.23, max: null, list: [1, 2] })).toBe(
      'export const VALUES = {"rate":0.23,"max":null,"list":[1,2]};',
    );
  });

  it("refuses functions and values JSON would change", () => {
    expect(() => serializeExport("compute", () => 1)).toThrow(/function/);
    expect(() => serializeExport("LIMIT", { max: Number.POSITIVE_INFINITY })).toThrow(/round trip/);
    expect(() => serializeExport("MISSING", { value: undefined })).toThrow(/round trip/);
  });
});

describe("the client snapshots of the registry", () => {
  it("serialize without loss", () => {
    expect(() => snapshotSource(storedValues)).not.toThrow();
    expect(() => snapshotSource(verificationSnapshot)).not.toThrow();
  });

  it("keep every value and date of the registry and drop its provenance", () => {
    for (const [key, definition] of Object.entries(STORED_PARAMS)) {
      const timeline = storedValues.STORED_VALUES[key as keyof typeof STORED_PARAMS];
      expect(timeline.revaluedYearly).toBe(definition.revaluedYearly);
      expect(timeline.entries).toEqual(
        definition.entries.map((entry) => ({ from: entry.from, value: entry.value })),
      );
    }
    expect(snapshotSource(storedValues)).not.toMatch(/"source"|https?:/);
  });

  it("answer the trust questions exactly like the full provenance", () => {
    const parameters = listParameters();
    for (const year of SUPPORTED_YEARS) {
      for (const prefixes of [["irpef."], ["inps.employee.", "deductions."], ["regions.lazio"]]) {
        const expected = parameters.filter(
          (parameter) =>
            prefixes.some((prefix) => parameter.key.startsWith(prefix)) &&
            parameter.years.find((entry) => entry.year === year)?.source.verified === undefined,
        ).length;
        expect(countUnverified(year, prefixes)).toBe(expected);
      }
    }
    expect(latestVerification()).toBe(computedLatestVerification());
    expect(isComuniDatasetVerified()).toBe(COMUNI_SOURCE.verified !== undefined);
  });
});

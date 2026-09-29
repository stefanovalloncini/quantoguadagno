import { describe, it, expect } from "vitest";
import { extractPlaceholderNames } from "../format.ts";
import { NAMESPACES, getMessages } from "./index.ts";

describe.each(NAMESPACES)("catalog namespace %s", (namespace) => {
  const itCatalog = getMessages("it", [namespace]);
  const enCatalog = getMessages("en", [namespace]);
  const entries = Object.entries(itCatalog);

  it("is not empty", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it("exposes the same keys in both locales", () => {
    expect(Object.keys(enCatalog).sort()).toEqual(Object.keys(itCatalog).sort());
  });

  it("parses every message in both locales", () => {
    const failures: string[] = [];
    for (const [key, itValue] of entries) {
      try {
        extractPlaceholderNames(itValue);
      } catch (error) {
        failures.push(`it/${key}: ${String(error)}`);
      }
      const enValue = enCatalog[key];
      if (enValue === undefined) continue;
      try {
        extractPlaceholderNames(enValue);
      } catch (error) {
        failures.push(`en/${key}: ${String(error)}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("uses typographic apostrophes in both locales", () => {
    const straight = /\p{L}'[\p{L}\p{N}]/u;
    const offenders = [
      ...entries.filter(([, value]) => straight.test(value)).map(([key]) => `it/${key}`),
      ...Object.entries(enCatalog)
        .filter(([, value]) => straight.test(value))
        .map(([key]) => `en/${key}`),
    ];
    expect(offenders).toEqual([]);
  });

  it("uses the same placeholder names in en as in it", () => {
    const mismatched: string[] = [];
    for (const [key, itValue] of entries) {
      const enValue = enCatalog[key];
      if (enValue === undefined) {
        mismatched.push(`${key}: missing in en`);
        continue;
      }
      const itNames = extractPlaceholderNames(itValue).join(",");
      const enNames = extractPlaceholderNames(enValue).join(",");
      if (itNames !== enNames) {
        mismatched.push(`${key}: it=[${itNames}] en=[${enNames}]`);
      }
    }
    expect(mismatched).toEqual([]);
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CONTRAST_PAIRS,
  MINIMUM_CONTRAST,
  PALETTE,
  THEMES,
  TOKEN_NAMES,
  contrastOf,
  contrastRatio,
  type Theme,
  type TokenName,
} from "./palette.ts";

const tokensCss = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");

function declaredValues(block: string): Partial<Record<TokenName, string>> {
  const values: Partial<Record<TokenName, string>> = {};
  for (const name of TOKEN_NAMES) {
    const match = new RegExp(`--${name}:\\s*(#[0-9a-f]{6});`, "i").exec(block);
    if (match?.[1]) values[name] = match[1].toLowerCase();
  }
  return values;
}

function blockAfter(selector: string): string {
  const start = tokensCss.indexOf(selector);
  if (start === -1) throw new Error(`Missing selector ${selector}`);
  return tokensCss.slice(start, tokensCss.indexOf("}", start));
}

const CSS_BLOCKS: Readonly<Record<Theme, readonly string[]>> = {
  light: [':root,\n[data-theme="light"] {'],
  dark: [':root:not([data-theme="light"]) {', '[data-theme="dark"] {'],
};

describe("palette", () => {
  it.each(THEMES)("matches every %s value declared in tokens.css", (theme) => {
    for (const selector of CSS_BLOCKS[theme]) {
      expect(declaredValues(blockAfter(selector))).toEqual(PALETTE[theme]);
    }
  });

  it("computes WCAG contrast ratios", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    expect(contrastRatio("#5c5c5c", "#ffffff")).toBeCloseTo(6.69, 2);
  });

  it.each(THEMES)("keeps every %s pair above its minimum", (theme) => {
    const failures = CONTRAST_PAIRS.filter(
      (pair) => contrastOf(pair, theme) < MINIMUM_CONTRAST[pair.use],
    ).map(
      (pair) => `${pair.foreground} on ${pair.background}: ${contrastOf(pair, theme).toFixed(2)}`,
    );
    expect(failures).toEqual([]);
  });

  it.each(THEMES)("keeps the %s focus ring at 3:1 against the page", (theme) => {
    expect(contrastRatio(PALETTE[theme].blu, PALETTE[theme].carta)).toBeGreaterThanOrEqual(3);
  });
});

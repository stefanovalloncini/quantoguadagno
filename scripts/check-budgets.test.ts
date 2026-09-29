import { describe, expect, it } from "vitest";
import {
  brotliSizeOf,
  extractAstroIslandUrls,
  extractModuleScriptSrcs,
  extractPageKind,
  extractPageBudgetBytes,
  extractRendererUrls,
  findViolations,
  isFollowableStaticImport,
  parseStaticImportSpecifiers,
  resolveEntryUrls,
  summarizePages,
  sumBytes,
  unionOf,
} from "./check-budgets.mjs";

describe("extractPageKind", () => {
  it("defaults to text when the attribute is missing", () => {
    expect(extractPageKind('<html lang="it"><body></body></html>')).toBe("text");
  });

  it("reads calculator from data-page-kind", () => {
    expect(extractPageKind('<html data-page-kind="calculator"></html>')).toBe("calculator");
  });

  it("reads print from data-page-kind", () => {
    expect(extractPageKind('<html data-page-kind="print"></html>')).toBe("print");
  });

  it("falls back to text for an unknown value", () => {
    expect(extractPageKind('<html data-page-kind="other"></html>')).toBe("text");
  });
});

describe("extractModuleScriptSrcs", () => {
  it("collects module script sources regardless of attribute order", () => {
    const html = `
      <script src="/_astro/a.js" type="module"></script>
      <script type="module" src="/_astro/b.js"></script>
      <script src="/_astro/c.js"></script>
    `;
    expect(extractModuleScriptSrcs(html)).toEqual(["/_astro/a.js", "/_astro/b.js"]);
  });
});

describe("extractAstroIslandUrls", () => {
  it("collects component-url and renderer-url", () => {
    const html =
      '<astro-island component-url="/_astro/Island.js" renderer-url="/_astro/client.js"></astro-island>';
    expect(extractAstroIslandUrls(html)).toEqual(["/_astro/Island.js", "/_astro/client.js"]);
  });
});

describe("resolveEntryUrls", () => {
  it("dedupes across scripts and islands", () => {
    const html = `
      <script type="module" src="/_astro/shared.js"></script>
      <astro-island component-url="/_astro/Island.js" renderer-url="/_astro/shared.js"></astro-island>
    `;
    expect(resolveEntryUrls(html)).toEqual(["/_astro/shared.js", "/_astro/Island.js"]);
  });
});

describe("isFollowableStaticImport", () => {
  it("accepts static and reexport-star imports", () => {
    expect(isFollowableStaticImport({ type: "static", typeOnly: false })).toBe(true);
    expect(isFollowableStaticImport({ type: "reexport-star", typeOnly: false })).toBe(true);
  });

  it("rejects dynamic and type-only imports", () => {
    expect(isFollowableStaticImport({ type: "dynamic", typeOnly: false })).toBe(false);
    expect(isFollowableStaticImport({ type: "static", typeOnly: true })).toBe(false);
  });
});

describe("parseStaticImportSpecifiers", () => {
  it("follows static imports and skips dynamic ones", async () => {
    const code = `
      import a from "./a.js";
      export * from "./b.js";
      const c = await import("./c.js");
    `;
    expect(await parseStaticImportSpecifiers(code)).toEqual(["./a.js", "./b.js"]);
  });
});

describe("brotliSizeOf", () => {
  it("compresses a repetitive buffer smaller than its input", () => {
    const buffer = Buffer.from("a".repeat(1000));
    const size = brotliSizeOf(buffer);
    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThan(buffer.length);
  });
});

describe("sumBytes", () => {
  it("sums known files and ignores missing ones", () => {
    const fileBytes = new Map([
      ["a", 10],
      ["b", 20],
    ]);
    expect(sumBytes(["a", "b", "missing"], fileBytes)).toBe(30);
  });
});

describe("extractRendererUrls", () => {
  it("collects each renderer once, ignoring component urls", () => {
    const html = `
      <astro-island component-url="/_astro/A.js" renderer-url="/_astro/client.js"></astro-island>
      <astro-island component-url="/_astro/B.js" renderer-url="/_astro/client.js"></astro-island>
    `;
    expect(extractRendererUrls(html)).toEqual(["/_astro/client.js"]);
  });

  it("returns nothing for a page without islands", () => {
    expect(extractRendererUrls("<main></main>")).toEqual([]);
  });
});

describe("unionOf", () => {
  it("merges the renderer files of every page", () => {
    expect(unionOf([new Set(["client.js", "react.js"]), new Set(["client.js"])])).toEqual(
      new Set(["client.js", "react.js"]),
    );
  });
});

describe("summarizePages and findViolations", () => {
  it("flags a text page that loads JS", () => {
    const pageFiles = new Map([["/text", new Set(["x.js"])]]);
    const pageKind = new Map([["/text", "text"]]);
    const fileBytes = new Map([["x.js", 10]]);
    const summaries = summarizePages(pageFiles, pageKind, fileBytes, new Set());
    expect(findViolations(summaries, 25 * 1024)).toEqual([
      "/text: text page loads 10 bytes of JS (budget 0)",
    ]);
  });

  it("flags a calculator page only on the bytes outside the React renderer", () => {
    const pageFiles = new Map([["/calc", new Set(["renderer.js", "specific.js"])]]);
    const pageKind = new Map([["/calc", "calculator"]]);
    const fileBytes = new Map([
      ["renderer.js", 100 * 1024],
      ["specific.js", 30 * 1024],
    ]);
    const summaries = summarizePages(pageFiles, pageKind, fileBytes, new Set(["renderer.js"]));
    expect(findViolations(summaries, 25 * 1024)).toEqual([
      "/calc: page JS without the React renderer is 30720 bytes (budget 25600)",
    ]);
  });

  it("holds a print page to the per-page budget, not the text budget", () => {
    const pageFiles = new Map([["/print", new Set(["renderer.js", "print.js"])]]);
    const pageKind = new Map([["/print", "print"]]);
    const fileBytes = new Map([
      ["renderer.js", 100 * 1024],
      ["print.js", 30 * 1024],
    ]);
    const summaries = summarizePages(pageFiles, pageKind, fileBytes, new Set(["renderer.js"]));
    expect(findViolations(summaries, 25 * 1024)).toEqual([
      "/print: page JS without the React renderer is 30720 bytes (budget 25600)",
    ]);
    fileBytes.set("print.js", 10 * 1024);
    const withinBudget = summarizePages(pageFiles, pageKind, fileBytes, new Set(["renderer.js"]));
    expect(findViolations(withinBudget, 25 * 1024)).toEqual([]);
  });

  it("passes a calculator page within budget", () => {
    const pageFiles = new Map([["/calc", new Set(["renderer.js", "specific.js"])]]);
    const pageKind = new Map([["/calc", "calculator"]]);
    const fileBytes = new Map([
      ["renderer.js", 100 * 1024],
      ["specific.js", 10 * 1024],
    ]);
    const summaries = summarizePages(pageFiles, pageKind, fileBytes, new Set(["renderer.js"]));
    expect(findViolations(summaries, 25 * 1024)).toEqual([]);
  });
});

describe("per-page budget override", () => {
  it("reads data-page-budget in kilobytes from the html tag", () => {
    expect(extractPageBudgetBytes('<html lang="it" data-page-budget="40">')).toBe(40 * 1024);
    expect(extractPageBudgetBytes('<html lang="it">')).toBeUndefined();
    expect(extractPageBudgetBytes('<html data-page-budget="zero">')).toBeUndefined();
  });

  it("applies the page's own budget instead of the default", () => {
    const pageFiles = new Map([
      ["index.html", new Set(["home.js"])],
      ["naspi.html", new Set(["naspi.js"])],
    ]);
    const pageKind = new Map([
      ["index.html", "calculator"],
      ["naspi.html", "calculator"],
    ]);
    const fileBytes = new Map([
      ["home.js", 30 * 1024],
      ["naspi.js", 30 * 1024],
    ]);
    const pageBudget = new Map([["index.html", 40 * 1024]]);
    const summaries = summarizePages(pageFiles, pageKind, fileBytes, new Set(), pageBudget);
    expect(findViolations(summaries, 25 * 1024)).toEqual([
      `naspi.html: page JS without the React renderer is ${String(30 * 1024)} bytes (budget ${String(25 * 1024)})`,
    ]);
  });
});

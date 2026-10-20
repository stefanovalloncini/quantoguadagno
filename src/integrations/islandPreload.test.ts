import { describe, expect, it } from "vitest";
import {
  islandEntryUrls,
  moduleClosure,
  resolveSpecifier,
  withModulePreloads,
} from "./islandPreload.ts";

describe("island preload", () => {
  it("reads the renderer and component of every island once", () => {
    const html =
      '<astro-island uid="a" component-url="/_astro/A.js" renderer-url="/_astro/client.js"></astro-island>' +
      '<astro-island uid="b" component-url="/_astro/B.js" renderer-url="/_astro/client.js"></astro-island>';
    expect(islandEntryUrls(html)).toEqual(["/_astro/client.js", "/_astro/A.js", "/_astro/B.js"]);
  });

  it("finds nothing on a page without islands", () => {
    expect(islandEntryUrls("<main><h1>Glossario</h1></main>")).toEqual([]);
  });

  it("resolves relative and absolute specifiers and ignores bare ones", () => {
    expect(resolveSpecifier("/_astro/A.js", "./b.js")).toBe("/_astro/b.js");
    expect(resolveSpecifier("/_astro/A.js", "../c.js")).toBe("/c.js");
    expect(resolveSpecifier("/_astro/A.js", "/_astro/d.js")).toBe("/_astro/d.js");
    expect(resolveSpecifier("/_astro/A.js", "react")).toBeUndefined();
  });

  it("walks the static graph once per module, entries first", () => {
    const graph: Record<string, readonly string[]> = {
      "/a.js": ["/b.js", "/c.js"],
      "/b.js": ["/c.js"],
      "/c.js": ["/a.js"],
    };
    expect(moduleClosure(["/a.js"], (url) => graph[url] ?? [])).toEqual([
      "/a.js",
      "/b.js",
      "/c.js",
    ]);
  });

  it("adds the links at the end of the head", () => {
    const html = '<head><link rel="stylesheet" href="/s.css"></head><body></body>';
    expect(withModulePreloads(html, ["/a.js", "/b.js"])).toBe(
      '<head><link rel="stylesheet" href="/s.css"><link rel="modulepreload" href="/a.js">' +
        '<link rel="modulepreload" href="/b.js"></head><body></body>',
    );
  });

  it("leaves a page alone when there is nothing to preload", () => {
    const html = "<head></head><body></body>";
    expect(withModulePreloads(html, [])).toBe(html);
  });
});

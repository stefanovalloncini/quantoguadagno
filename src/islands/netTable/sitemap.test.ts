import type { APIContext } from "astro";
import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/locales.ts";
import { GET } from "@/pages/sitemap.xml.ts";
import { ROUTES, absoluteUrl, isIndexable } from "@/routes.ts";
import { NET_TABLE_AMOUNTS, netTablePaths } from "./amounts.ts";

const response = await GET({} as APIContext);
const xml = await response.text();
const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

describe("sitemap of the site", () => {
  it("lists every indexable route and every amount page once per language", () => {
    const pages = ROUTES.filter(isIndexable).length + NET_TABLE_AMOUNTS.length;
    expect(locations).toHaveLength(pages * LOCALES.length);
    expect(new Set(locations).size).toBe(locations.length);
  });

  it("gives each amount page its own alternates", () => {
    for (const gross of NET_TABLE_AMOUNTS) {
      const paths = netTablePaths(gross);
      for (const locale of LOCALES) expect(locations).toContain(absoluteUrl(paths[locale]));
      expect(xml).toContain(
        `<xhtml:link rel="alternate" hreflang="en" href="${absoluteUrl(paths.en)}"/>`,
      );
    }
  });
});

import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/locales.ts";
import { ROUTES, isIndexable } from "@/routes.ts";
import { buildSitemap } from "@/seo/sitemap.ts";

const xml = buildSitemap(ROUTES);
const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1] ?? "");
const locations = entries.map((entry) => /<loc>([^<]+)<\/loc>/.exec(entry)?.[1]);

describe("sitemap", () => {
  it("declares the sitemap and xhtml namespaces", () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset')).toBe(true);
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml.trimEnd().endsWith("</urlset>")).toBe(true);
  });

  it("lists every indexable route once per locale", () => {
    const expected = ROUTES.filter(isIndexable).length * LOCALES.length;
    expect(entries).toHaveLength(expected);
    expect(new Set(locations).size).toBe(expected);
  });

  it("leaves out the noindex print page", () => {
    expect(xml).not.toContain("stampa-busta-paga");
    expect(xml).not.toContain("print-payslip");
  });

  it("uses absolute URLs without trailing slashes except for the root", () => {
    for (const location of locations) {
      expect(location).toMatch(/^https:\/\/quantoguadagno\.com\//);
      if (location !== "https://quantoguadagno.com/") expect(location).not.toMatch(/\/$/);
    }
  });

  it("gives every entry its alternates in both locales plus x-default", () => {
    const tfr = entries.find((entry) =>
      entry.includes("<loc>https://quantoguadagno.com/tfr</loc>"),
    );
    expect(tfr).toBeDefined();
    expect(tfr).toContain(
      '<xhtml:link rel="alternate" hreflang="it" href="https://quantoguadagno.com/tfr"/>',
    );
    expect(tfr).toContain(
      '<xhtml:link rel="alternate" hreflang="en" href="https://quantoguadagno.com/en/tfr-severance-pay"/>',
    );
    expect(tfr).toContain(
      '<xhtml:link rel="alternate" hreflang="x-default" href="https://quantoguadagno.com/tfr"/>',
    );
    for (const entry of entries) {
      expect(entry.match(/<xhtml:link /g)).toHaveLength(LOCALES.length + 1);
    }
  });
});

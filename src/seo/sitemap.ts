import { LOCALES, type Locale } from "../i18n/locales.ts";
import { absoluteUrl, alternatesForPaths, isIndexable, type Route } from "../routes.ts";

export type LocalizedPaths = Readonly<Record<Locale, string>>;

const XML_ESCAPES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char);
}

function urlEntry(paths: LocalizedPaths, location: string): string {
  const links = alternatesForPaths(paths).map(
    (alternate) =>
      `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeXml(alternate.href)}"/>`,
  );
  return [`  <url>`, `    <loc>${escapeXml(location)}</loc>`, ...links, `  </url>`].join("\n");
}

/** Every indexable route, then the pages outside the route table, once per locale. */
export function buildSitemap(
  routes: readonly Route[],
  pages: readonly LocalizedPaths[] = [],
): string {
  const entries = [...routes.filter(isIndexable).map((route) => route.path), ...pages].flatMap(
    (paths) => LOCALES.map((locale) => urlEntry(paths, absoluteUrl(paths[locale]))),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...entries,
    `</urlset>`,
    ``,
  ].join("\n");
}

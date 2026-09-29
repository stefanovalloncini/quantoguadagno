import { LOCALES } from "../i18n/locales.ts";
import { absoluteUrl, alternatesFor, isIndexable, type Route } from "../routes.ts";

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

function urlEntry(route: Route, location: string): string {
  const links = alternatesFor(route).map(
    (alternate) =>
      `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeXml(alternate.href)}"/>`,
  );
  return [`  <url>`, `    <loc>${escapeXml(location)}</loc>`, ...links, `  </url>`].join("\n");
}

export function buildSitemap(routes: readonly Route[]): string {
  const entries = routes
    .filter(isIndexable)
    .flatMap((route) => LOCALES.map((locale) => urlEntry(route, absoluteUrl(route.path[locale]))));
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...entries,
    `</urlset>`,
    ``,
  ].join("\n");
}

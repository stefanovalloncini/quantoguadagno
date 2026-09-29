export function parseSitemapXml(xml) {
  const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  return urlBlocks.map((block) => {
    const locMatch = /<loc>([^<]*)<\/loc>/.exec(block);
    const alternates = Array.from(
      block.matchAll(/<xhtml:link\s+rel="alternate"\s+hreflang="([^"]*)"\s+href="([^"]*)"\s*\/>/g),
    ).map((match) => ({ hreflang: unescapeXml(match[1]), href: unescapeXml(match[2]) }));
    return { loc: unescapeXml(locMatch ? locMatch[1] : ""), alternates };
  });
}

function unescapeXml(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

export function parseRedirectsFile(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [from, to, status] = line.split(/\s+/);
      return { from, to, status: Number(status) };
    });
}

export function isDynamicRedirectFrom(from) {
  return from.includes("*") || from.includes(":");
}

export function redirectFromToRegex(from) {
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = escaped.replace(/\\\*/g, ".*").replace(/:[A-Za-z0-9_]+/g, "[^/]+");
  return new RegExp(`^${pattern}$`);
}

export function redirectRuleMatchesPath(rule, pathname) {
  return redirectFromToRegex(rule.from).test(pathname);
}

export function samplePathForRedirectFrom(from) {
  return from.replace(/\*$/, "esempio-smoke-test").replace(/:[A-Za-z0-9_]+/g, "esempio-smoke-test");
}

export function localeForPathname(pathname) {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "it";
}

export function pathnameOf(url) {
  return new URL(url).pathname;
}

export function joinUrl(base, pathname) {
  return new URL(pathname, base).toString();
}

export function normalizeBase(base) {
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

export function extractHtmlLang(html) {
  const match = /<html\b[^>]*\blang="([^"]*)"/i.exec(html);
  return match ? match[1] : undefined;
}

export function extractCanonicalHref(html) {
  const match = /<link\s+rel="canonical"\s+href="([^"]*)"/i.exec(html);
  return match ? match[1] : undefined;
}

export function extractAlternateLinks(html) {
  return Array.from(
    html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]*)"\s+href="([^"]*)"\s*\/?>/gi),
  ).map((match) => ({ hreflang: match[1], href: match[2] }));
}

export function countCspMetaTags(html) {
  const matches = html.match(/<meta\s+http-equiv="content-security-policy"/gi);
  return matches ? matches.length : 0;
}

export function extractRobotsMetaContent(html) {
  const match = /<meta\s+name="robots"\s+content="([^"]*)"/i.exec(html);
  return match ? match[1] : undefined;
}

export function isNoindexHtml(html) {
  const content = extractRobotsMetaContent(html);
  return content !== undefined && content.includes("noindex");
}

export function diffAlternates(expected, actual) {
  const mismatches = [];
  for (const expectedAlternate of expected) {
    const actualAlternate = actual.find((entry) => entry.hreflang === expectedAlternate.hreflang);
    if (!actualAlternate) {
      mismatches.push(`missing hreflang="${expectedAlternate.hreflang}"`);
    } else if (actualAlternate.href !== expectedAlternate.href) {
      mismatches.push(
        `hreflang="${expectedAlternate.hreflang}" href is "${actualAlternate.href}", expected "${expectedAlternate.href}"`,
      );
    }
  }
  if (actual.length !== expected.length) {
    mismatches.push(
      `expected ${String(expected.length)} alternate tags, found ${String(actual.length)}`,
    );
  }
  return mismatches;
}

export function isSitemapEntryConsistent(entry) {
  const hreflangs = entry.alternates.map((alternate) => alternate.hreflang).sort();
  const expectedHreflangs = ["en", "it", "x-default"];
  if (JSON.stringify(hreflangs) !== JSON.stringify(expectedHreflangs)) return false;
  const itAlternate = entry.alternates.find((alternate) => alternate.hreflang === "it");
  const xDefaultAlternate = entry.alternates.find(
    (alternate) => alternate.hreflang === "x-default",
  );
  if (!itAlternate || !xDefaultAlternate) return false;
  if (itAlternate.href !== xDefaultAlternate.href) return false;
  return entry.alternates.some((alternate) => alternate.href === entry.loc);
}

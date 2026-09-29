import { describe, expect, it } from "vitest";
import {
  countCspMetaTags,
  diffAlternates,
  extractAlternateLinks,
  extractCanonicalHref,
  extractHtmlLang,
  extractRobotsMetaContent,
  isDynamicRedirectFrom,
  isNoindexHtml,
  isSitemapEntryConsistent,
  joinUrl,
  localeForPathname,
  normalizeBase,
  parseRedirectsFile,
  parseSitemapXml,
  pathnameOf,
  redirectRuleMatchesPath,
  samplePathForRedirectFrom,
} from "./smoke-lib.mjs";

describe("parseSitemapXml", () => {
  it("parses url entries with their alternates", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://quantoguadagno.com/</loc>
    <xhtml:link rel="alternate" hreflang="it" href="https://quantoguadagno.com/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://quantoguadagno.com/en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://quantoguadagno.com/"/>
  </url>
</urlset>`;
    expect(parseSitemapXml(xml)).toEqual([
      {
        loc: "https://quantoguadagno.com/",
        alternates: [
          { hreflang: "it", href: "https://quantoguadagno.com/" },
          { hreflang: "en", href: "https://quantoguadagno.com/en" },
          { hreflang: "x-default", href: "https://quantoguadagno.com/" },
        ],
      },
    ]);
  });
});

describe("parseRedirectsFile", () => {
  it("parses one rule per line", () => {
    const text = "/calcola-stipendio / 301\n/fonti-dati/* /fonti 301\n";
    expect(parseRedirectsFile(text)).toEqual([
      { from: "/calcola-stipendio", to: "/", status: 301 },
      { from: "/fonti-dati/*", to: "/fonti", status: 301 },
    ]);
  });

  it("ignores blank lines", () => {
    expect(parseRedirectsFile("\n/a /b 302\n\n")).toEqual([{ from: "/a", to: "/b", status: 302 }]);
  });
});

describe("isDynamicRedirectFrom", () => {
  it("flags splat and param rules", () => {
    expect(isDynamicRedirectFrom("/fonti-dati/*")).toBe(true);
    expect(isDynamicRedirectFrom("/blog/:slug")).toBe(true);
    expect(isDynamicRedirectFrom("/fonti-dati")).toBe(false);
  });
});

describe("redirectRuleMatchesPath", () => {
  it("matches a splat rule against a concrete path", () => {
    expect(
      redirectRuleMatchesPath({ from: "/sistema-fiscale/*" }, "/sistema-fiscale/toscana"),
    ).toBe(true);
    expect(redirectRuleMatchesPath({ from: "/sistema-fiscale/*" }, "/altro")).toBe(false);
  });

  it("matches an exact rule only against that exact path", () => {
    expect(redirectRuleMatchesPath({ from: "/fonti-dati" }, "/fonti-dati")).toBe(true);
    expect(redirectRuleMatchesPath({ from: "/fonti-dati" }, "/fonti-dati/x")).toBe(false);
  });
});

describe("samplePathForRedirectFrom", () => {
  it("substitutes a splat with a concrete segment", () => {
    expect(samplePathForRedirectFrom("/sistema-fiscale/*")).toBe(
      "/sistema-fiscale/esempio-smoke-test",
    );
  });
});

describe("localeForPathname", () => {
  it("treats /en and /en/* as english", () => {
    expect(localeForPathname("/en")).toBe("en");
    expect(localeForPathname("/en/glossary")).toBe("en");
  });

  it("treats everything else as italian", () => {
    expect(localeForPathname("/")).toBe("it");
    expect(localeForPathname("/glossario")).toBe("it");
  });
});

describe("pathnameOf", () => {
  it("extracts the pathname from an absolute url", () => {
    expect(pathnameOf("https://quantoguadagno.com/fonti")).toBe("/fonti");
  });
});

describe("joinUrl", () => {
  it("joins a base and a pathname", () => {
    expect(joinUrl("http://localhost:8788", "/fonti")).toBe("http://localhost:8788/fonti");
  });

  it("keeps the trailing slash for the root path", () => {
    expect(joinUrl("http://localhost:8788", "/")).toBe("http://localhost:8788/");
  });
});

describe("normalizeBase", () => {
  it("strips a trailing slash", () => {
    expect(normalizeBase("http://localhost:8788/")).toBe("http://localhost:8788");
  });

  it("leaves a base without a trailing slash unchanged", () => {
    expect(normalizeBase("http://localhost:8788")).toBe("http://localhost:8788");
  });
});

describe("extractHtmlLang", () => {
  it("reads the lang attribute", () => {
    expect(extractHtmlLang('<html lang="en" dir="ltr">')).toBe("en");
  });
});

describe("extractCanonicalHref", () => {
  it("reads the canonical link href", () => {
    expect(extractCanonicalHref('<link rel="canonical" href="https://x.test/a">')).toBe(
      "https://x.test/a",
    );
  });
});

describe("extractAlternateLinks", () => {
  it("reads every alternate link", () => {
    const html =
      '<link rel="alternate" hreflang="it" href="https://x.test/"><link rel="alternate" hreflang="en" href="https://x.test/en">';
    expect(extractAlternateLinks(html)).toEqual([
      { hreflang: "it", href: "https://x.test/" },
      { hreflang: "en", href: "https://x.test/en" },
    ]);
  });
});

describe("countCspMetaTags", () => {
  it("counts the CSP meta tag once", () => {
    const html = '<meta http-equiv="content-security-policy" content="script-src \'self\'">';
    expect(countCspMetaTags(html)).toBe(1);
  });

  it("returns 0 when absent", () => {
    expect(countCspMetaTags('<meta charset="utf-8">')).toBe(0);
  });
});

describe("extractRobotsMetaContent and isNoindexHtml", () => {
  it("reads the robots meta content", () => {
    expect(extractRobotsMetaContent('<meta name="robots" content="noindex">')).toBe("noindex");
  });

  it("flags noindex pages", () => {
    expect(isNoindexHtml('<meta name="robots" content="noindex">')).toBe(true);
    expect(isNoindexHtml('<meta charset="utf-8">')).toBe(false);
  });
});

describe("diffAlternates", () => {
  it("reports no mismatches when equal", () => {
    const alternates = [{ hreflang: "it", href: "http://x/" }];
    expect(diffAlternates(alternates, alternates)).toEqual([]);
  });

  it("reports a missing hreflang", () => {
    expect(diffAlternates([{ hreflang: "en", href: "http://x/en" }], [])).toEqual([
      'missing hreflang="en"',
      "expected 1 alternate tags, found 0",
    ]);
  });

  it("reports a mismatched href", () => {
    const expected = [{ hreflang: "it", href: "http://x/" }];
    const actual = [{ hreflang: "it", href: "http://x/wrong" }];
    expect(diffAlternates(expected, actual)).toEqual([
      'hreflang="it" href is "http://x/wrong", expected "http://x/"',
    ]);
  });
});

describe("isSitemapEntryConsistent", () => {
  const validEntry = {
    loc: "https://quantoguadagno.com/",
    alternates: [
      { hreflang: "it", href: "https://quantoguadagno.com/" },
      { hreflang: "en", href: "https://quantoguadagno.com/en" },
      { hreflang: "x-default", href: "https://quantoguadagno.com/" },
    ],
  };

  it("accepts a well-formed entry", () => {
    expect(isSitemapEntryConsistent(validEntry)).toBe(true);
  });

  it("rejects an entry missing a hreflang", () => {
    expect(
      isSitemapEntryConsistent({ ...validEntry, alternates: validEntry.alternates.slice(0, 2) }),
    ).toBe(false);
  });

  it("rejects an entry whose x-default does not match the italian href", () => {
    const broken = {
      ...validEntry,
      alternates: [
        ...validEntry.alternates.slice(0, 2),
        { hreflang: "x-default", href: "https://quantoguadagno.com/en" },
      ],
    };
    expect(isSitemapEntryConsistent(broken)).toBe(false);
  });

  it("rejects an entry whose loc is not one of its own alternates", () => {
    expect(
      isSitemapEntryConsistent({ ...validEntry, loc: "https://quantoguadagno.com/other" }),
    ).toBe(false);
  });
});

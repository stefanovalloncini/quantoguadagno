import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  countCspMetaTags,
  diffAlternates,
  extractAlternateLinks,
  extractCanonicalHref,
  extractHtmlLang,
  isDynamicRedirectFrom,
  isNoindexHtml,
  isSitemapEntryConsistent,
  joinUrl,
  localeForPathname,
  normalizeBase,
  parseRedirectsFile,
  parseSitemapXml,
  pathnameOf,
  samplePathForRedirectFrom,
} from "./smoke-lib.mjs";

const DIST_DIR = fileURLToPath(new URL("../dist", import.meta.url));
const SITE_ORIGIN = "https://quantoguadagno.com";
const PRINT_ROUTE = { it: "/stampa-busta-paga", en: "/en/print-payslip" };
const SECURITY_HEADERS = {
  "content-security-policy": "frame-ancestors 'none'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

function parseArgs(argv) {
  const index = argv.indexOf("--base");
  if (index === -1 || argv[index + 1] === undefined) {
    throw new Error("usage: node scripts/smoke.mjs --base <url>");
  }
  return { base: normalizeBase(argv[index + 1]) };
}

const results = [];

function record(group, name, ok, detail) {
  results.push({ group, name, ok, detail });
}

async function fetchManual(url) {
  return fetch(url, { redirect: "manual" });
}

async function checkPage(base, entry) {
  const pathname = pathnameOf(entry.loc);
  const url = joinUrl(base, pathname);
  const response = await fetch(url);
  const group = "pages";
  if (response.status !== 200) {
    record(group, pathname, false, `status ${String(response.status)}`);
    return;
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    record(group, pathname, false, `content-type "${contentType}"`);
    return;
  }
  const html = await response.text();
  const problems = [];

  const cspCount = countCspMetaTags(html);
  if (cspCount !== 1) problems.push(`expected 1 CSP meta tag, found ${String(cspCount)}`);

  const canonical = extractCanonicalHref(html);
  if (canonical !== entry.loc) {
    problems.push(`canonical is "${String(canonical)}", expected "${entry.loc}"`);
  }

  const locale = localeForPathname(pathname);
  const lang = extractHtmlLang(html);
  if (lang !== locale) problems.push(`html lang is "${String(lang)}", expected "${locale}"`);

  record(group, pathname, problems.length === 0, problems.join("; "));

  const alternateMismatches = diffAlternates(entry.alternates, extractAlternateLinks(html));
  record("hreflang", pathname, alternateMismatches.length === 0, alternateMismatches.join("; "));
}

async function checkPrintRoute(base, locale, pathname) {
  const url = joinUrl(base, pathname);
  const response = await fetch(url);
  if (response.status !== 200) {
    record("print", pathname, false, `status ${String(response.status)}`);
    return;
  }
  const html = await response.text();
  const problems = [];
  if (!isNoindexHtml(html)) problems.push(`missing noindex robots meta`);
  const lang = extractHtmlLang(html);
  if (lang !== locale) problems.push(`html lang is "${String(lang)}", expected "${locale}"`);
  record("print", pathname, problems.length === 0, problems.join("; "));
}

async function checkNotFound(base, prefix, locale) {
  const pathname =
    prefix === "" ? "/questo-percorso-non-esiste-xyz" : `${prefix}/this-path-does-not-exist-xyz`;
  const url = joinUrl(base, pathname);
  const response = await fetch(url);
  const problems = [];
  if (response.status !== 404) problems.push(`status ${String(response.status)}, expected 404`);
  const html = await response.text();
  const lang = extractHtmlLang(html);
  if (lang !== locale) problems.push(`404 page lang is "${String(lang)}", expected "${locale}"`);
  if (!isNoindexHtml(html)) problems.push(`404 page missing noindex robots meta`);
  record("404", pathname, problems.length === 0, problems.join("; "));
}

async function checkTrailingSlashDrop(base, pathname) {
  const url = joinUrl(base, `${pathname}/`);
  const response = await fetchManual(url);
  const problems = [];
  if (response.status < 300 || response.status >= 400) {
    problems.push(`status ${String(response.status)}, expected a redirect`);
  }
  const location = response.headers.get("location");
  const locationPathname = location ? pathnameOf(new URL(location, base).toString()) : undefined;
  if (locationPathname !== pathname) {
    problems.push(`Location is "${String(location)}", expected path "${pathname}"`);
  }
  record("trailing-slash", `${pathname}/`, problems.length === 0, problems.join("; "));
}

async function checkLegacyRedirect(base, rule) {
  const isDynamic = isDynamicRedirectFrom(rule.from);
  const fromPath = isDynamic ? samplePathForRedirectFrom(rule.from) : rule.from;
  const url = joinUrl(base, fromPath);
  const response = await fetchManual(url);
  const problems = [];
  if (response.status !== rule.status) {
    problems.push(`status ${String(response.status)}, expected ${String(rule.status)}`);
  }
  const location = response.headers.get("location");
  const locationPathname = location ? pathnameOf(new URL(location, base).toString()) : undefined;
  if (locationPathname !== rule.to) {
    problems.push(`Location is "${String(location)}", expected path "${rule.to}"`);
  }
  record("redirects", `${fromPath} -> ${rule.to}`, problems.length === 0, problems.join("; "));
}

async function checkLegacyRedirectQueryString(base, rule) {
  const url = joinUrl(base, `${rule.from}?lordo=35000`);
  const response = await fetchManual(url);
  const problems = [];
  if (response.status !== rule.status) {
    problems.push(`status ${String(response.status)}, expected ${String(rule.status)}`);
  }
  const location = response.headers.get("location");
  const expectedLocation = new URL(rule.to, base);
  expectedLocation.search = "?lordo=35000";
  const actualLocation = location ? new URL(location, base) : undefined;
  if (
    !actualLocation ||
    actualLocation.pathname !== expectedLocation.pathname ||
    actualLocation.search !== "?lordo=35000"
  ) {
    problems.push(
      `Location is "${String(location)}", expected query string preserved to "${expectedLocation.pathname}?lordo=35000"`,
    );
  }
  record("redirects-query", `${rule.from}?lordo=35000`, problems.length === 0, problems.join("; "));
}

async function checkAssetCacheHeaders(base) {
  const astroFiles = readdirSync(`${DIST_DIR}/_astro`).filter((name) => name.endsWith(".js"));
  const sample = astroFiles[0];
  if (!sample) {
    record("headers", "_astro/*", false, "no built asset found to sample");
    return;
  }
  const response = await fetch(joinUrl(base, `/_astro/${sample}`));
  const cacheControl = response.headers.get("cache-control");
  const expected = "public, max-age=31536000, immutable";
  record(
    "headers",
    `/_astro/${sample}`,
    cacheControl === expected,
    `cache-control "${String(cacheControl)}"`,
  );
}

async function checkServiceWorker(base) {
  const response = await fetch(joinUrl(base, "/sw.js"));
  const cacheControl = response.headers.get("cache-control");
  const body = await response.text();
  const problems = [];
  if (cacheControl !== "no-cache")
    problems.push(`cache-control "${String(cacheControl)}", expected "no-cache"`);
  if (!body.includes("unregister(")) problems.push("body does not call unregister()");
  if (!body.includes("caches.delete")) problems.push("body does not clear caches");
  record("headers", "/sw.js", problems.length === 0, problems.join("; "));
}

async function checkSecurityHeaders(base) {
  const response = await fetch(joinUrl(base, "/"));
  const problems = [];
  for (const [name, expected] of Object.entries(SECURITY_HEADERS)) {
    const actual = response.headers.get(name);
    if (actual !== expected)
      problems.push(`${name} is "${String(actual)}", expected "${expected}"`);
  }
  record("headers", "/ security headers", problems.length === 0, problems.join("; "));
}

async function checkSitemapAndRobots(base, localSitemap, localRobots) {
  const sitemapResponse = await fetch(joinUrl(base, "/sitemap.xml"));
  const remoteSitemap = await sitemapResponse.text();
  const remoteEntries = parseSitemapXml(remoteSitemap);
  const localEntries = parseSitemapXml(localSitemap);
  const problems = [];
  if (sitemapResponse.headers.get("content-type")?.includes("xml") !== true) {
    problems.push(
      `sitemap content-type is "${String(sitemapResponse.headers.get("content-type"))}"`,
    );
  }
  if (remoteEntries.length !== localEntries.length) {
    problems.push(
      `sitemap has ${String(remoteEntries.length)} entries, expected ${String(localEntries.length)}`,
    );
  }
  const remoteLocs = new Set(remoteEntries.map((entry) => entry.loc));
  const localLocs = new Set(localEntries.map((entry) => entry.loc));
  if (remoteLocs.size !== localLocs.size || [...localLocs].some((loc) => !remoteLocs.has(loc))) {
    problems.push("sitemap locs differ from local build output");
  }
  for (const entry of remoteEntries) {
    if (!isSitemapEntryConsistent(entry))
      problems.push(`sitemap entry "${entry.loc}" is inconsistent`);
  }
  record("sitemap", "/sitemap.xml", problems.length === 0, problems.join("; "));

  const robotsResponse = await fetch(joinUrl(base, "/robots.txt"));
  const remoteRobots = await robotsResponse.text();
  const robotsProblems = [];
  if (!remoteRobots.includes("Allow: /")) robotsProblems.push('missing "Allow: /"');
  if (!remoteRobots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)) {
    robotsProblems.push(`missing "Sitemap: ${SITE_ORIGIN}/sitemap.xml"`);
  }
  if (remoteRobots.trim() !== localRobots.trim())
    robotsProblems.push("robots.txt differs from local build output");
  record("robots", "/robots.txt", robotsProblems.length === 0, robotsProblems.join("; "));
}

async function main() {
  const { base } = parseArgs(process.argv.slice(2));
  const localSitemap = readFileSync(`${DIST_DIR}/sitemap.xml`, "utf8");
  const localRedirects = readFileSync(`${DIST_DIR}/_redirects`, "utf8");
  const localRobots = readFileSync(`${DIST_DIR}/robots.txt`, "utf8");
  const sitemapEntries = parseSitemapXml(localSitemap);
  const redirectRules = parseRedirectsFile(localRedirects);

  for (const entry of sitemapEntries) {
    await checkPage(base, entry);
  }

  await checkPrintRoute(base, "it", PRINT_ROUTE.it);
  await checkPrintRoute(base, "en", PRINT_ROUTE.en);

  await checkNotFound(base, "", "it");
  await checkNotFound(base, "/en", "en");

  const trailingSlashSample = sitemapEntries
    .map((entry) => pathnameOf(entry.loc))
    .find((pathname) => pathname !== "/" && pathname !== "/en");
  if (trailingSlashSample) await checkTrailingSlashDrop(base, trailingSlashSample);

  const nonDynamicRules = redirectRules.filter((rule) => !isDynamicRedirectFrom(rule.from));
  for (const rule of nonDynamicRules) {
    await checkLegacyRedirect(base, rule);
  }
  const dynamicRules = redirectRules.filter((rule) => isDynamicRedirectFrom(rule.from));
  for (const rule of dynamicRules) {
    await checkLegacyRedirect(base, rule);
  }
  if (nonDynamicRules[0]) await checkLegacyRedirectQueryString(base, nonDynamicRules[0]);

  await checkAssetCacheHeaders(base);
  await checkServiceWorker(base);
  await checkSecurityHeaders(base);
  await checkSitemapAndRobots(base, localSitemap, localRobots);

  printReport();
}

function printReport() {
  const groups = new Map();
  for (const result of results) {
    if (!groups.has(result.group)) groups.set(result.group, []);
    groups.get(result.group).push(result);
  }
  let failures = 0;
  for (const [group, entries] of groups) {
    console.log(`\n${group}`);
    for (const entry of entries) {
      const mark = entry.ok ? "PASS" : "FAIL";
      if (!entry.ok) failures += 1;
      console.log(`  ${mark}  ${entry.name}${entry.detail ? ` (${entry.detail})` : ""}`);
    }
  }
  console.log(`\n${String(results.length - failures)}/${String(results.length)} checks passed`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

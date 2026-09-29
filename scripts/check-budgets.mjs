import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, constants as zlibConstants } from "node:zlib";
import { init, parse } from "es-module-lexer";

const DIST_DIR = process.argv[2]
  ? resolve(process.argv[2])
  : fileURLToPath(new URL("../dist", import.meta.url));
const CALCULATOR_PAGE_BUDGET_BYTES = 25 * 1024;
const KB = 1024;

export function extractPageKind(html) {
  const htmlTag = /<html\b([^>]*)>/i.exec(html);
  const kind = htmlTag ? readAttr(htmlTag[0], "data-page-kind") : undefined;
  return kind === "calculator" || kind === "print" ? kind : "text";
}

export function extractPageBudgetBytes(html) {
  const htmlTag = /<html\b([^>]*)>/i.exec(html);
  const kilobytes = Number(htmlTag ? readAttr(htmlTag[0], "data-page-budget") : undefined);
  return Number.isFinite(kilobytes) && kilobytes > 0 ? kilobytes * KB : undefined;
}

function findTags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) ?? [];
}

function readAttr(tag, attrName) {
  const match = new RegExp(`\\b${attrName}\\s*=\\s*["']([^"']*)["']`, "i").exec(tag);
  return match ? match[1] : undefined;
}

export function extractModuleScriptSrcs(html) {
  return findTags(html, "script")
    .filter((tag) => readAttr(tag, "type") === "module")
    .map((tag) => readAttr(tag, "src"))
    .filter((src) => Boolean(src));
}

export function extractAstroIslandUrls(html) {
  const urls = [];
  for (const tag of findTags(html, "astro-island")) {
    for (const attrName of ["component-url", "renderer-url"]) {
      const value = readAttr(tag, attrName);
      if (value) urls.push(value);
    }
  }
  return urls;
}

export function resolveEntryUrls(html) {
  return Array.from(new Set([...extractModuleScriptSrcs(html), ...extractAstroIslandUrls(html)]));
}

export function isFollowableStaticImport(importRecord) {
  const isStatic = importRecord.type === "static" || importRecord.type === "reexport-star";
  return isStatic && !importRecord.typeOnly;
}

export async function parseStaticImportSpecifiers(code) {
  await init();
  const [imports] = parse(code);
  return imports.filter(isFollowableStaticImport).map((importRecord) => importRecord.specifier);
}

export function brotliSizeOf(buffer) {
  const compressed = brotliCompressSync(buffer, {
    params: {
      [zlibConstants.BROTLI_PARAM_QUALITY]: zlibConstants.BROTLI_MAX_QUALITY,
    },
  });
  return compressed.length;
}

export function sumBytes(files, fileBytes) {
  let total = 0;
  for (const file of files) total += fileBytes.get(file) ?? 0;
  return total;
}

export function extractRendererUrls(html) {
  return Array.from(
    new Set(
      findTags(html, "astro-island")
        .map((tag) => readAttr(tag, "renderer-url"))
        .filter((url) => Boolean(url)),
    ),
  );
}

export function unionOf(fileSets) {
  const union = new Set();
  for (const files of fileSets) {
    for (const file of files) union.add(file);
  }
  return union;
}

export function summarizePages(
  pageFiles,
  pageKind,
  fileBytes,
  runtimeFiles,
  pageBudget = new Map(),
) {
  return [...pageFiles.entries()].map(([route, files]) => {
    const kind = pageKind.get(route) ?? "text";
    const specificFiles = [...files].filter((file) => !runtimeFiles.has(file));
    return {
      route,
      kind,
      budgetBytes: pageBudget.get(route),
      totalBytes: sumBytes(files, fileBytes),
      specificBytes: sumBytes(specificFiles, fileBytes),
    };
  });
}

export function findViolations(summaries, calculatorPageBudgetBytes) {
  const violations = [];
  for (const summary of summaries) {
    if (summary.kind === "text" && summary.totalBytes > 0) {
      violations.push(
        `${summary.route}: text page loads ${summary.totalBytes} bytes of JS (budget 0)`,
      );
    }
    const budgetBytes = summary.budgetBytes ?? calculatorPageBudgetBytes;
    if (summary.kind !== "text" && summary.specificBytes > budgetBytes) {
      violations.push(
        `${summary.route}: page JS without the React renderer is ${summary.specificBytes} bytes (budget ${budgetBytes})`,
      );
    }
  }
  return violations;
}

function walkHtmlFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      results.push(fullPath);
    }
  }
  return results;
}

function urlToDistPath(url, distDir) {
  const cleanUrl = url.split("#")[0].split("?")[0];
  return join(distDir, cleanUrl.replace(/^\//, ""));
}

async function collectFiles(entryPaths, distDir) {
  const visited = new Set();
  const queue = [...entryPaths];
  while (queue.length > 0) {
    const filePath = queue.shift();
    if (visited.has(filePath) || !existsSync(filePath)) continue;
    visited.add(filePath);
    const code = readFileSync(filePath, "utf8");
    for (const specifier of await parseStaticImportSpecifiers(code)) {
      if (!specifier.startsWith(".") && !specifier.startsWith("/")) continue;
      queue.push(
        specifier.startsWith("/") ? join(distDir, specifier) : join(dirname(filePath), specifier),
      );
    }
  }
  return visited;
}

async function main() {
  if (!existsSync(DIST_DIR)) {
    console.error(`dist directory not found at ${DIST_DIR}; run the build first.`);
    process.exitCode = 1;
    return;
  }

  const pageKind = new Map();
  const pageBudget = new Map();
  const pageFiles = new Map();
  const rendererFileSets = [];
  const fileBytes = new Map();

  for (const htmlPath of walkHtmlFiles(DIST_DIR)) {
    const route = relative(DIST_DIR, htmlPath);
    const html = readFileSync(htmlPath, "utf8");
    const entryPaths = resolveEntryUrls(html).map((url) => urlToDistPath(url, DIST_DIR));
    const files = await collectFiles(entryPaths, DIST_DIR);
    const rendererPaths = extractRendererUrls(html).map((url) => urlToDistPath(url, DIST_DIR));
    rendererFileSets.push(await collectFiles(rendererPaths, DIST_DIR));

    pageKind.set(route, extractPageKind(html));
    const budgetBytes = extractPageBudgetBytes(html);
    if (budgetBytes !== undefined) pageBudget.set(route, budgetBytes);
    pageFiles.set(route, files);
    for (const file of files) {
      if (!fileBytes.has(file)) fileBytes.set(file, brotliSizeOf(readFileSync(file)));
    }
  }

  const runtimeFiles = unionOf(rendererFileSets);
  const summaries = summarizePages(pageFiles, pageKind, fileBytes, runtimeFiles, pageBudget);
  const violations = findViolations(summaries, CALCULATOR_PAGE_BUDGET_BYTES);

  if (runtimeFiles.size > 0) {
    const runtimeBytes = sumBytes(runtimeFiles, fileBytes);
    console.log(
      `React renderer runtime, not counted per page: ${(runtimeBytes / KB).toFixed(1)} KB br across ${runtimeFiles.size} file(s)\n`,
    );
  }

  const kilobytes = (bytes) => (bytes / KB).toFixed(1);
  console.table(
    summaries.map((summary) => ({
      page: summary.route,
      kind: summary.kind,
      "page KB br": kilobytes(summary.specificBytes),
      "budget KB":
        summary.kind === "text"
          ? "0"
          : kilobytes(summary.budgetBytes ?? CALCULATOR_PAGE_BUDGET_BYTES),
      "total KB br": kilobytes(summary.totalBytes),
    })),
  );

  if (violations.length > 0) {
    console.error("\nBudget violations:");
    for (const violation of violations) console.error(`  ${violation}`);
    process.exitCode = 1;
  }
}

await main();

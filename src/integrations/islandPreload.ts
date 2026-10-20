import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, posix, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { init, parse } from "es-module-lexer";

const ISLAND_TAG = /<astro-island\b[^>]*>/gi;
const URL_ATTRIBUTES = ["renderer-url", "component-url"] as const;

export function islandEntryUrls(html: string): readonly string[] {
  const urls = new Set<string>();
  for (const tag of html.match(ISLAND_TAG) ?? []) {
    for (const name of URL_ATTRIBUTES) {
      const value = new RegExp(`\\b${name}="([^"]+)"`).exec(tag)?.[1];
      if (value !== undefined) urls.add(value);
    }
  }
  return [...urls];
}

export function resolveSpecifier(importer: string, specifier: string): string | undefined {
  if (specifier.startsWith("/")) return specifier;
  if (!specifier.startsWith(".")) return undefined;
  return posix.normalize(posix.join(posix.dirname(importer), specifier));
}

export function moduleClosure(
  entries: readonly string[],
  importsOf: (url: string) => readonly string[],
): readonly string[] {
  const seen = new Set<string>();
  const queue = [...entries];
  for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
    if (seen.has(url)) continue;
    seen.add(url);
    queue.push(...importsOf(url));
  }
  return [...seen];
}

export function withModulePreloads(html: string, urls: readonly string[]): string {
  if (urls.length === 0 || !html.includes("</head>")) return html;
  const links = urls.map((url) => `<link rel="modulepreload" href="${url}">`).join("");
  return html.replace("</head>", `${links}</head>`);
}

async function filesUnder(dir: string, extension: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => join(entry.parentPath, entry.name));
}

function urlOf(root: string, file: string): string {
  return `/${relative(root, file).split(sep).join("/")}`;
}

// An island fetches its modules only after the browser has parsed the island's closing tag and
// then one import level at a time. Preloading the whole static graph from the head lets the
// downloads start with the stylesheet.
export function islandPreload(): AstroIntegration {
  return {
    name: "quantoguadagno:island-preload",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        await init();
        const root = fileURLToPath(dir);
        const staticImports = new Map<string, readonly string[]>();
        for (const file of await filesUnder(root, ".js")) {
          const url = urlOf(root, file);
          const [imports] = parse(await readFile(file, "utf8"));
          staticImports.set(
            url,
            imports
              .flatMap((record) =>
                (record.type === "static" || record.type === "reexport-star") && !record.typeOnly
                  ? [resolveSpecifier(url, record.specifier)]
                  : [],
              )
              .filter((resolved): resolved is string => resolved !== undefined),
          );
        }
        let pages = 0;
        for (const file of await filesUnder(root, ".html")) {
          const html = await readFile(file, "utf8");
          const entries = islandEntryUrls(html);
          if (entries.length === 0) continue;
          const urls = moduleClosure(entries, (url) => staticImports.get(url) ?? []);
          await writeFile(file, withModulePreloads(html, urls));
          pages += 1;
        }
        logger.info(`modulepreload links added to ${String(pages)} pages`);
      },
    },
  };
}

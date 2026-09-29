import { writeFile } from "node:fs/promises";
import type { AstroIntegration } from "astro";
import { ROUTES } from "../routes.ts";
import { buildRedirects, redirectRules } from "../seo/redirects.ts";

export function legacyRedirects(): AstroIntegration {
  return {
    name: "quantoguadagno:legacy-redirects",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        await writeFile(new URL("_redirects", dir), buildRedirects(ROUTES));
        logger.info(`_redirects written with ${String(redirectRules(ROUTES).length)} rules`);
      },
    },
  };
}

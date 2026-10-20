# quantoguadagno

quantoguadagno.com is an Italian salary calculator: gross-to-net pay, INPS contributions,
regional and municipal surcharges, a gross-to-net table with a page for each common salary, and
related tools (apprenticeship pay, forfettario flat tax, the ordinary regime for the
self-employed, TFR, NASpI, and more).

## Stack

Astro 6 (static output) with React 19 islands, TypeScript in strict mode, Vitest, ESLint,
Prettier, deployed as static assets on Cloudflare Workers.

## Requirements

Node 22.14.0 (via nvm) and pnpm 11.0.4.

## Scripts

- `pnpm dev` - start the dev server
- `pnpm build` - build the static site
- `pnpm preview` - preview the production build
- `pnpm typecheck` - astro check and tsc
- `pnpm lint` - eslint
- `pnpm format` / `pnpm format:check` - prettier
- `pnpm test` / `pnpm test:watch` - vitest
- `pnpm check:budgets` - enforce per-page JS budgets on the built site
- `pnpm check:ai-tells` - scan for AI-flavored vocabulary, emoji, and em-dashes in i18n strings
- `pnpm check` - run all of the above in sequence

## Project layout

- `src/data` - framework-free parameter registry
- `src/domain` - framework-free tax engine
- `src/i18n` - formatter and catalogs (`src/i18n/react.tsx` is the only React file in this directory)
- `src/routes.ts` - route table: paths per locale, nav groups, meta keys, shared-link query keys,
  legacy redirects
- `src/queryParams.ts` - query parameters each tool reads from shared links, with their legacy names
- `src/seo` - sitemap, `_redirects` and structured data builders
- `src/integrations` - Astro integrations: `dist/_redirects`, module preloads for the islands, and
  data snapshots that keep the parameter registry out of client bundles
- `src/layouts` - page layouts
- `src/pages` - Astro pages: one catch-all for every route in the table, the per-salary net pages,
  the style guide and the 404 pages
- `src/islands` - React islands; `src/islands/runtime` holds the URL and storage hooks
- `src/components` - shared components
- `src/styles` - stylesheets
- `scripts/data` - data importers
- `tests/golden` - golden test cases

## Data policy

Every tax parameter carries its source.

## Licence

MIT, see [LICENSE](./LICENSE).

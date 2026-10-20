import { DEFAULT_LOCALE, LOCALES, type Locale } from "./i18n/locales.ts";
import type { Namespace } from "./i18n/messages/index.ts";
import type { MessageKey as HomeKey } from "./i18n/messages/home/it.ts";
import type { MessageKey as LayoutKey } from "./i18n/messages/layout/it.ts";
import type { MessageKey as MetaKey } from "./i18n/messages/meta/it.ts";
import {
  APPRENTICESHIP_PARAMS,
  COMPOUND_INTEREST_PARAMS,
  EMPLOYEE_PARAMS,
  EMPLOYER_COST_PARAMS,
  INVERSE_PARAMS,
  ORDINARIO_PARAMS,
  queryNamesOf,
  type QuerySpec,
} from "./queryParams.ts";
import { pathFor, ROUTE_PATHS, SITE_ORIGIN, type RouteId } from "./routePaths.ts";

export {
  hrefFor,
  pathFor,
  ROUTE_PATHS,
  SITE_ORIGIN,
  type QueryInput,
  type RouteId,
} from "./routePaths.ts";

export type PageKind = "calculator" | "text" | "print";

export type GroupId = "salary" | "vat" | "work" | "time" | "taxes" | "sources";

export interface LegacyPath {
  readonly from: string;
  readonly status: 301 | 302;
}

export interface PageMeta {
  readonly title: MetaKey;
  readonly description: MetaKey;
}

export interface ToolCard {
  readonly title: HomeKey;
  readonly body: HomeKey;
}

interface RouteDefinition {
  readonly path: Readonly<Record<Locale, string>>;
  readonly kind: PageKind;
  readonly island?: string;
  readonly namespaces: readonly Namespace[];
  readonly label: LayoutKey;
  readonly navDescription?: LayoutKey;
  readonly group?: GroupId;
  readonly nav?: number;
  readonly meta: PageMeta;
  readonly card?: ToolCard;
  readonly restore?: QuerySpec;
  readonly legacy?: readonly LegacyPath[];
  readonly noindex?: boolean;
  readonly jsBudgetKb?: number;
}

const ROUTE_TABLE = {
  home: {
    path: ROUTE_PATHS.home,
    kind: "calculator",
    island: "EmployeeCalculator",
    jsBudgetKb: 48,
    namespaces: ["form", "employee"],
    label: "nav.employee",
    navDescription: "nav.employee.description",
    group: "salary",
    nav: 1,
    meta: { title: "meta.home.title", description: "meta.home.description" },
    restore: EMPLOYEE_PARAMS,
    legacy: [
      { from: "/calcola-stipendio", status: 301 },
      { from: "/calcolo-stipendio-netto", status: 301 },
      { from: "/strumenti-stipendio", status: 301 },
      { from: "/simulatore-pensione", status: 301 },
      { from: "/statistics", status: 302 },
      { from: "/statistiche", status: 302 },
      { from: "/confronto-tasse-europa", status: 302 },
      { from: "/sistema-fiscale/*", status: 302 },
    ],
  },
  inverse: {
    path: ROUTE_PATHS.inverse,
    kind: "calculator",
    island: "InverseCalculator",
    jsBudgetKb: 40,
    namespaces: ["form", "inverse"],
    label: "nav.inverse",
    navDescription: "nav.inverse.description",
    group: "salary",
    nav: 2,
    meta: { title: "meta.inverse.title", description: "meta.inverse.description" },
    card: { title: "home.available.inverse.title", body: "home.available.inverse.body" },
    restore: INVERSE_PARAMS,
  },
  tredicesima: {
    path: ROUTE_PATHS.tredicesima,
    kind: "calculator",
    island: "TredicesimaCalculator",
    namespaces: ["form", "tredicesima"],
    label: "nav.tredicesima",
    navDescription: "nav.tredicesima.description",
    group: "salary",
    nav: 3,
    meta: { title: "meta.tredicesima.title", description: "meta.tredicesima.description" },
    card: { title: "home.available.tredicesima.title", body: "home.available.tredicesima.body" },
  },
  comparison: {
    path: ROUTE_PATHS.comparison,
    kind: "calculator",
    island: "ComparisonCalculator",
    jsBudgetKb: 31,
    namespaces: ["form", "comparison"],
    label: "nav.comparison",
    navDescription: "nav.comparison.description",
    group: "salary",
    nav: 4,
    meta: { title: "meta.comparison.title", description: "meta.comparison.description" },
    card: { title: "home.available.comparison.title", body: "home.available.comparison.body" },
    legacy: [{ from: "/confronto-scenari", status: 301 }],
  },
  employerCost: {
    path: ROUTE_PATHS.employerCost,
    kind: "calculator",
    island: "EmployerCostCalculator",
    jsBudgetKb: 38,
    namespaces: ["form", "employerCost"],
    label: "nav.employerCost",
    navDescription: "nav.employerCost.description",
    group: "salary",
    nav: 5,
    meta: { title: "meta.employerCost.title", description: "meta.employerCost.description" },
    card: {
      title: "home.available.employerCost.title",
      body: "home.available.employerCost.body",
    },
    restore: EMPLOYER_COST_PARAMS,
  },
  netTable: {
    path: ROUTE_PATHS.netTable,
    kind: "text",
    island: "NetTableHub",
    namespaces: ["layout", "netTable"],
    label: "nav.netTable",
    navDescription: "nav.netTable.description",
    group: "salary",
    nav: 6,
    meta: { title: "meta.netTable.title", description: "meta.netTable.description" },
  },
  forfettario: {
    path: ROUTE_PATHS.forfettario,
    kind: "calculator",
    island: "ForfettarioCalculator",
    namespaces: ["form", "forfettario"],
    label: "nav.forfettario",
    navDescription: "nav.forfettario.description",
    group: "vat",
    nav: 1,
    meta: { title: "meta.forfettario.title", description: "meta.forfettario.description" },
    card: { title: "home.available.forfettario.title", body: "home.available.forfettario.body" },
    legacy: [{ from: "/calcolo-partita-iva", status: 301 }],
  },
  ordinario: {
    path: ROUTE_PATHS.ordinario,
    kind: "calculator",
    island: "OrdinarioCalculator",
    jsBudgetKb: 35,
    namespaces: ["form", "ordinario"],
    label: "nav.ordinario",
    navDescription: "nav.ordinario.description",
    group: "vat",
    nav: 2,
    meta: { title: "meta.ordinario.title", description: "meta.ordinario.description" },
    card: { title: "home.available.ordinario.title", body: "home.available.ordinario.body" },
    restore: ORDINARIO_PARAMS,
  },
  apprenticeship: {
    path: ROUTE_PATHS.apprenticeship,
    kind: "calculator",
    island: "ApprenticeshipCalculator",
    namespaces: ["form", "apprenticeship"],
    label: "nav.apprenticeship",
    navDescription: "nav.apprenticeship.description",
    group: "work",
    nav: 4,
    meta: { title: "meta.apprenticeship.title", description: "meta.apprenticeship.description" },
    card: {
      title: "home.available.apprenticeship.title",
      body: "home.available.apprenticeship.body",
    },
    restore: APPRENTICESHIP_PARAMS,
  },
  tfr: {
    path: ROUTE_PATHS.tfr,
    kind: "calculator",
    island: "TfrCalculator",
    namespaces: ["form", "tfr"],
    label: "nav.tfr",
    navDescription: "nav.tfr.description",
    group: "work",
    nav: 3,
    meta: { title: "meta.tfr.title", description: "meta.tfr.description" },
    card: { title: "home.available.tfr.title", body: "home.available.tfr.body" },
    legacy: [{ from: "/simulatore-tfr", status: 301 }],
  },
  preavviso: {
    path: ROUTE_PATHS.preavviso,
    kind: "calculator",
    island: "PreavvisoCalculator",
    namespaces: ["form", "preavviso"],
    label: "nav.preavviso",
    navDescription: "nav.preavviso.description",
    group: "work",
    nav: 2,
    meta: { title: "meta.preavviso.title", description: "meta.preavviso.description" },
    card: { title: "home.available.preavviso.title", body: "home.available.preavviso.body" },
  },
  naspi: {
    path: ROUTE_PATHS.naspi,
    kind: "calculator",
    island: "NaspiCalculator",
    jsBudgetKb: 34,
    namespaces: ["form", "naspi"],
    label: "nav.naspi",
    navDescription: "nav.naspi.description",
    group: "work",
    nav: 1,
    meta: { title: "meta.naspi.title", description: "meta.naspi.description" },
    card: { title: "home.available.naspi.title", body: "home.available.naspi.body" },
  },
  salaryHistory: {
    path: ROUTE_PATHS.salaryHistory,
    kind: "calculator",
    island: "SalaryHistory",
    jsBudgetKb: 31,
    namespaces: ["form", "salaryHistory"],
    label: "nav.salaryHistory",
    navDescription: "nav.salaryHistory.description",
    group: "time",
    nav: 2,
    meta: { title: "meta.salaryHistory.title", description: "meta.salaryHistory.description" },
    card: { title: "home.available.history.title", body: "home.available.history.body" },
  },
  inflation: {
    path: ROUTE_PATHS.inflation,
    kind: "calculator",
    island: "InflationCalculator",
    namespaces: ["form", "inflation"],
    label: "nav.inflation",
    navDescription: "nav.inflation.description",
    group: "time",
    nav: 1,
    meta: { title: "meta.inflation.title", description: "meta.inflation.description" },
    card: { title: "home.available.inflation.title", body: "home.available.inflation.body" },
    legacy: [{ from: "/analisi-inflazione", status: 301 }],
  },
  compoundInterest: {
    path: ROUTE_PATHS.compoundInterest,
    kind: "calculator",
    island: "CompoundInterestCalculator",
    namespaces: ["form", "compoundInterest"],
    label: "nav.compoundInterest",
    navDescription: "nav.compoundInterest.description",
    group: "time",
    nav: 3,
    meta: {
      title: "meta.compoundInterest.title",
      description: "meta.compoundInterest.description",
    },
    card: {
      title: "home.available.compoundInterest.title",
      body: "home.available.compoundInterest.body",
    },
    restore: COMPOUND_INTEREST_PARAMS,
  },
  method: {
    path: ROUTE_PATHS.method,
    kind: "text",
    island: "MethodPage",
    namespaces: ["glossary"],
    label: "nav.method",
    navDescription: "nav.method.description",
    group: "taxes",
    nav: 1,
    meta: { title: "meta.method.title", description: "meta.method.description" },
  },
  glossary: {
    path: ROUTE_PATHS.glossary,
    kind: "text",
    island: "GlossaryPage",
    namespaces: ["glossary"],
    label: "nav.glossario",
    navDescription: "nav.glossario.description",
    group: "taxes",
    nav: 2,
    meta: { title: "meta.glossary.title", description: "meta.glossary.description" },
    card: { title: "home.available.glossario.title", body: "home.available.glossario.body" },
  },
  sources: {
    path: ROUTE_PATHS.sources,
    kind: "text",
    island: "SourcesPage",
    namespaces: ["sources"],
    label: "nav.sources",
    navDescription: "nav.sources.description",
    group: "sources",
    nav: 1,
    meta: { title: "meta.sources.title", description: "meta.sources.description" },
    card: { title: "home.available.sources.title", body: "home.available.sources.body" },
    legacy: [
      { from: "/fonti-dati", status: 301 },
      { from: "/fonti-dati/*", status: 301 },
    ],
  },
  about: {
    path: ROUTE_PATHS.about,
    kind: "text",
    island: "AboutPage",
    namespaces: ["about"],
    label: "nav.about",
    navDescription: "nav.about.description",
    group: "sources",
    nav: 2,
    meta: { title: "meta.about.title", description: "meta.about.description" },
    card: { title: "home.available.about.title", body: "home.available.about.body" },
  },
  printPayslip: {
    path: ROUTE_PATHS.printPayslip,
    kind: "print",
    island: "PrintPayslip",
    jsBudgetKb: 31,
    namespaces: ["form", "printPayslip"],
    label: "nav.printPayslip",
    meta: { title: "meta.payslip.title", description: "meta.payslip.description" },
    restore: EMPLOYEE_PARAMS,
    legacy: [{ from: "/simulatore-busta-paga", status: 302 }],
    noindex: true,
  },
} as const satisfies Record<RouteId, RouteDefinition>;

export type IslandName = (typeof ROUTE_TABLE)[RouteId]["island"];

export interface Route extends Omit<RouteDefinition, "island"> {
  readonly id: RouteId;
  readonly island?: IslandName;
}

export const ROUTES: readonly Route[] = (Object.keys(ROUTE_TABLE) as RouteId[]).map((id) => ({
  id,
  ...ROUTE_TABLE[id],
}));

const ROUTES_BY_ID = new Map<RouteId, Route>(ROUTES.map((route) => [route.id, route]));

export function routeById(id: RouteId): Route {
  const route = ROUTES_BY_ID.get(id);
  if (!route) throw new Error(`Unknown route "${id}"`);
  return route;
}

export interface Group {
  readonly id: GroupId;
  readonly label: LayoutKey;
  readonly hub?: RouteId;
}

export const GROUPS: readonly Group[] = [
  { id: "salary", label: "nav.group.salary" },
  { id: "vat", label: "nav.group.vat" },
  { id: "work", label: "nav.group.work" },
  { id: "time", label: "nav.group.time" },
  { id: "taxes", label: "nav.group.taxes" },
  { id: "sources", label: "nav.group.sources" },
];

export const NOT_FOUND_META: PageMeta = {
  title: "meta.notFound.title",
  description: "meta.notFound.description",
};

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).href;
}

export function slugFor(route: Route, locale: Locale): string | undefined {
  const path = route.path[locale];
  return path === "/" ? undefined : path.slice(1);
}

export interface Alternate {
  readonly hreflang: Locale | "x-default";
  readonly href: string;
}

/** The same page in every locale, plus x-default pointing to the Italian one. */
export function alternatesForPaths(paths: Readonly<Record<Locale, string>>): readonly Alternate[] {
  return [
    ...LOCALES.map((locale) => ({ hreflang: locale, href: absoluteUrl(paths[locale]) })),
    { hreflang: "x-default", href: absoluteUrl(paths[DEFAULT_LOCALE]) },
  ];
}

export function alternatesFor(route: Route): readonly Alternate[] {
  return alternatesForPaths(route.path);
}

export interface RouteMatch {
  readonly route: Route;
  readonly locale: Locale;
}

export function routeForPath(pathname: string): RouteMatch | undefined {
  const trimmed = pathname.replace(/\/+$/, "");
  const path = trimmed === "" ? "/" : trimmed;
  for (const route of ROUTES) {
    for (const locale of LOCALES) {
      if (route.path[locale] === path) return { route, locale };
    }
  }
  return undefined;
}

export function isIndexable(route: Route): boolean {
  return route.noindex !== true;
}

export function isInNav(route: Route): boolean {
  return route.nav !== undefined;
}

export function hasCard(route: Route): boolean {
  return route.card !== undefined;
}

export function restoreNamesFor(route: Route): string[] {
  return route.restore ? queryNamesOf(route.restore) : [];
}

export interface RouteGroup {
  readonly group: Group;
  readonly routes: readonly Route[];
}

function navOrder(route: Route): number {
  return route.nav ?? Number.MAX_SAFE_INTEGER;
}

export function groupedRoutes(include: (route: Route) => boolean): readonly RouteGroup[] {
  return GROUPS.map((group) => ({
    group,
    routes: ROUTES.filter((route) => route.group === group.id && include(route)).sort(
      (a, b) => navOrder(a) - navOrder(b),
    ),
  })).filter((entry) => entry.routes.length > 0);
}

export function groupAnchor(id: GroupId): string {
  return `group-${id}`;
}

export interface Crumb {
  readonly label: LayoutKey;
  readonly href: string;
}

export function breadcrumbsFor(route: Route, locale: Locale): readonly Crumb[] {
  if (route.id === "home") return [];
  const home: Crumb = { label: "brand.name", href: absoluteUrl(pathFor("home", locale)) };
  const page: Crumb = { label: route.label, href: absoluteUrl(route.path[locale]) };
  const group = GROUPS.find((candidate) => candidate.id === route.group);
  if (!group || group.hub === route.id) return [home, page];
  const groupHref = group.hub
    ? absoluteUrl(pathFor(group.hub, locale))
    : `${home.href}#${groupAnchor(group.id)}`;
  return [home, { label: group.label, href: groupHref }, page];
}

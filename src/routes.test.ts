import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/locales.ts";
import { NAMESPACES, getMessages } from "@/i18n/messages/index.ts";
import { queryNamesOf } from "@/queryParams.ts";
import {
  GROUPS,
  NOT_FOUND_META,
  ROUTES,
  absoluteUrl,
  alternatesFor,
  alternatesForPaths,
  breadcrumbsFor,
  groupedRoutes,
  hrefFor,
  isInNav,
  isIndexable,
  restoreNamesFor,
  routeById,
  routeForPath,
  slugFor,
} from "@/routes.ts";

const OLD_ROUTER_PATHS = [
  "/",
  "/progressione-apprendistato",
  "/storico-stipendio",
  "/partita-iva-forfettario",
  "/interesse-composto",
  "/calcolo-naspi",
  "/preavviso-dimissioni",
  "/calcolo-netto-lordo",
  "/calcolo-tredicesima",
  "/inflazione",
  "/confronto-stipendi",
  "/costo-azienda",
  "/tfr",
  "/glossario",
  "/stampa-busta-paga",
  "/fonti",
  "/informazioni",
];

const NEW_ITALIAN_PATHS = [
  "/come-calcoliamo-il-netto",
  "/partita-iva-ordinario",
  "/stipendio-netto",
];

const NEW_ENGLISH_PATHS = [
  "/en/how-we-calculate-net-pay",
  "/en/ordinary-tax-regime",
  "/en/net-salary",
];

const HANDOFF_ENGLISH_PATHS = [
  "/en",
  "/en/apprenticeship-pay",
  "/en/salary-history",
  "/en/forfettario-flat-tax",
  "/en/compound-interest",
  "/en/naspi-unemployment-benefit",
  "/en/resignation-notice",
  "/en/net-to-gross",
  "/en/tredicesima-13th-month-pay",
  "/en/inflation",
  "/en/compare-job-offers",
  "/en/employer-cost",
  "/en/tfr-severance-pay",
  "/en/glossary",
  "/en/print-payslip",
  "/en/sources",
  "/en/about",
];

const realPaths = ROUTES.flatMap((route) => LOCALES.map((locale) => route.path[locale]));
const legacyPaths = ROUTES.flatMap((route) => (route.legacy ?? []).map((entry) => entry.from));

describe("route paths", () => {
  it("gives every route a path in every locale", () => {
    for (const route of ROUTES) {
      for (const locale of LOCALES) {
        expect(route.path[locale], `${route.id}/${locale}`).toMatch(/^\//);
      }
    }
  });

  it("keeps the Italian paths of the live site and adds only the new pages", () => {
    expect(ROUTES.map((route) => route.path.it).sort()).toEqual(
      [...OLD_ROUTER_PATHS, ...NEW_ITALIAN_PATHS].sort(),
    );
  });

  it("uses the English slugs agreed in the handoff and for the new pages", () => {
    expect(ROUTES.map((route) => route.path.en).sort()).toEqual(
      [...HANDOFF_ENGLISH_PATHS, ...NEW_ENGLISH_PATHS].sort(),
    );
  });

  it("never repeats a path, within a locale or across locales", () => {
    expect(new Set(realPaths).size).toBe(realPaths.length);
  });

  it("writes paths lowercase, without trailing slash or extension", () => {
    for (const path of realPaths) {
      expect(path).toMatch(/^\/$|^(\/[a-z0-9-]+)+$/);
    }
  });

  it("keeps each locale in its own prefix", () => {
    for (const route of ROUTES) {
      expect(route.path.en === "/en" || route.path.en.startsWith("/en/")).toBe(true);
      expect(route.path.it === "/en" || route.path.it.startsWith("/en/")).toBe(false);
    }
  });

  it("maps each path back to its route and locale", () => {
    for (const route of ROUTES) {
      for (const locale of LOCALES) {
        expect(routeForPath(route.path[locale])).toEqual({ route, locale });
      }
    }
    expect(routeForPath("/en/")).toEqual({ route: routeById("home"), locale: "en" });
    expect(routeForPath("/tfr/")).toEqual({ route: routeById("tfr"), locale: "it" });
    expect(routeForPath("/calcola-stipendio")).toBeUndefined();
  });

  it("turns paths into catch-all slugs", () => {
    expect(slugFor(routeById("home"), "it")).toBeUndefined();
    expect(slugFor(routeById("home"), "en")).toBe("en");
    expect(slugFor(routeById("tfr"), "en")).toBe("en/tfr-severance-pay");
  });
});

describe("route table", () => {
  it("has unique ids and islands", () => {
    const ids = ROUTES.map((route) => route.id);
    const islands = ROUTES.map((route) => route.island).filter((name) => name !== undefined);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(islands).size).toBe(islands.length);
  });

  it("only asks for namespaces that exist", () => {
    for (const route of ROUTES) {
      expect(route.namespaces.length).toBeGreaterThan(0);
      for (const namespace of route.namespaces) expect(NAMESPACES).toContain(namespace);
    }
  });

  it("keeps noindex pages out of the nav and the tool cards", () => {
    for (const route of ROUTES.filter((candidate) => !isIndexable(candidate))) {
      expect(route.nav).toBeUndefined();
      expect(route.card).toBeUndefined();
    }
  });

  it("marks the print page noindex", () => {
    expect(routeById("printPayslip").noindex).toBe(true);
    expect(routeById("printPayslip").kind).toBe("print");
  });

  it("only lets hydrated pages restore shared state", () => {
    for (const route of ROUTES.filter((candidate) => candidate.restore !== undefined)) {
      expect(route.kind).not.toBe("text");
    }
  });

  it("puts every nav entry in a group", () => {
    for (const route of ROUTES.filter(isInNav)) expect(route.group).toBeDefined();
  });

  it("gives every group at least one nav entry and a hub from inside the group", () => {
    const navGroups = groupedRoutes(isInNav);
    expect(navGroups.map((entry) => entry.group.id)).toEqual(GROUPS.map((group) => group.id));
    for (const group of GROUPS) {
      if (group.hub !== undefined) expect(routeById(group.hub).group).toBe(group.id);
    }
  });

  it("describes every nav entry", () => {
    for (const route of ROUTES.filter(isInNav)) expect(route.navDescription).toBeDefined();
  });

  it("orders nav entries inside a group", () => {
    const salary = groupedRoutes(isInNav).find((entry) => entry.group.id === "salary");
    expect(salary?.routes.map((route) => route.id)).toEqual([
      "home",
      "inverse",
      "tredicesima",
      "comparison",
      "employerCost",
      "netTable",
    ]);
    const vat = groupedRoutes(isInNav).find((entry) => entry.group.id === "vat");
    expect(vat?.routes.map((route) => route.id)).toEqual(["forfettario", "ordinario"]);
    const work = groupedRoutes(isInNav).find((entry) => entry.group.id === "work");
    expect(work?.routes.map((route) => route.id)).toEqual([
      "naspi",
      "preavviso",
      "tfr",
      "apprenticeship",
    ]);
    const taxes = groupedRoutes(isInNav).find((entry) => entry.group.id === "taxes");
    expect(taxes?.routes.map((route) => route.id)).toEqual(["method", "glossary"]);
    const sources = groupedRoutes(isInNav).find((entry) => entry.group.id === "sources");
    expect(sources?.routes.map((route) => route.id)).toEqual(["sources", "about"]);
  });
});

describe("shared-link restore keys", () => {
  it("reads the live employee, apprenticeship and compound interest parameters", () => {
    expect(restoreNamesFor(routeById("home"))).toEqual([
      "l",
      "lordo",
      "y",
      "anno",
      "r",
      "regione",
      "k",
      "c",
      "comune",
      "m",
      "mens",
      "t",
      "contratto",
      "a",
      "az15",
      "p",
      "pubblico",
      "e",
      "inpsEmp",
      "d",
      "inpsDat",
      "s",
      "partenza",
      "n",
      "netto",
    ]);
    expect(restoreNamesFor(routeById("apprenticeship"))).toEqual(["l", "lordo"]);
    expect(restoreNamesFor(routeById("compoundInterest"))).toEqual([
      "p",
      "r",
      "y",
      "c",
      "cf",
      "f",
      "i",
    ]);
    expect(routeById("printPayslip").restore).toBe(routeById("home").restore);
  });

  it("reads the net-to-gross and employer cost parameters", () => {
    expect(restoreNamesFor(routeById("inverse"))).toEqual([
      "n",
      "y",
      "r",
      "k",
      "c",
      "m",
      "t",
      "a",
      "p",
    ]);
    expect(restoreNamesFor(routeById("employerCost"))).toEqual(["l", "y", "t", "r", "k", "c", "m"]);
  });

  it("reads the ordinary regime parameters", () => {
    expect(restoreNamesFor(routeById("ordinario"))).toEqual([
      "f",
      "s",
      "y",
      "r",
      "k",
      "c",
      "g",
      "o",
      "m",
      "q",
      "a",
      "n",
    ]);
  });

  it("never lists a name twice within a route", () => {
    for (const route of ROUTES) {
      const names = route.restore ? queryNamesOf(route.restore) : [];
      expect(new Set(names).size, route.id).toBe(names.length);
    }
  });

  it("never claims a tracking parameter", () => {
    for (const route of ROUTES) {
      for (const name of restoreNamesFor(route)) {
        expect(name).not.toMatch(/^(utm_|fbclid$|gclid$)/);
        expect(name).not.toContain(" ");
      }
    }
  });
});

describe("legacy paths", () => {
  it("are unique absolute paths", () => {
    expect(new Set(legacyPaths).size).toBe(legacyPaths.length);
    for (const path of legacyPaths) expect(path).toMatch(/^\/[a-z0-9-]+(\/\*)?$/);
  });

  it("never collide with a real page", () => {
    for (const path of legacyPaths) {
      if (path.endsWith("/*")) {
        const prefix = path.slice(0, -1);
        expect(
          realPaths.filter((real) => real.startsWith(prefix)),
          path,
        ).toEqual([]);
      } else {
        expect(realPaths).not.toContain(path);
        expect(realPaths).not.toContain(`${path}/`);
      }
    }
  });

  it("follow the handoff table", () => {
    const table = Object.fromEntries(
      ROUTES.flatMap((route) =>
        (route.legacy ?? []).map((entry) => [
          entry.from,
          `${route.path.it} ${String(entry.status)}`,
        ]),
      ),
    );
    expect(table).toEqual({
      "/calcola-stipendio": "/ 301",
      "/calcolo-stipendio-netto": "/ 301",
      "/strumenti-stipendio": "/ 301",
      "/simulatore-pensione": "/ 301",
      "/calcolo-partita-iva": "/partita-iva-forfettario 301",
      "/confronto-scenari": "/confronto-stipendi 301",
      "/analisi-inflazione": "/inflazione 301",
      "/simulatore-tfr": "/tfr 301",
      "/fonti-dati": "/fonti 301",
      "/fonti-dati/*": "/fonti 301",
      "/simulatore-busta-paga": "/stampa-busta-paga 302",
      "/statistics": "/ 302",
      "/statistiche": "/ 302",
      "/confronto-tasse-europa": "/ 302",
      "/sistema-fiscale/*": "/ 302",
    });
  });
});

describe("message keys used by routes and the layout", () => {
  const catalogs = Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      {
        meta: getMessages(locale, ["meta"]),
        layout: getMessages(locale, ["layout"]),
        home: getMessages(locale, ["home"]),
      },
    ]),
  );

  it.each(LOCALES)("exist in the %s catalogs", (locale) => {
    const catalog = catalogs[locale];
    if (!catalog) throw new Error(`No catalog for ${locale}`);
    const missing: string[] = [];
    const expectKey = (namespace: "meta" | "layout" | "home", key: string) => {
      if (catalog[namespace][key] === undefined) missing.push(`${namespace}:${key}`);
    };
    for (const route of ROUTES) {
      expectKey("meta", route.meta.title);
      expectKey("meta", route.meta.description);
      expectKey("layout", route.label);
      if (route.navDescription) expectKey("layout", route.navDescription);
      if (route.card) {
        expectKey("home", route.card.title);
        expectKey("home", route.card.body);
      }
    }
    for (const group of GROUPS) expectKey("layout", group.label);
    expectKey("meta", NOT_FOUND_META.title);
    expectKey("meta", NOT_FOUND_META.description);
    for (const key of [
      "a11y.skipToMain",
      "brand.name",
      "title.home",
      "title.page",
      "nav.label",
      "nav.footer.label",
      "theme.prefix",
      "theme.label.light",
      "theme.label.dark",
      "theme.label.system",
      "footer.use",
      "footer.repo",
      "footer.license",
      "menu.open",
      "menu.close.visible",
      "menu.close.label",
      "breadcrumbs.label",
      "prefs.language",
      "notFound.title",
      "notFound.body",
      "notFound.home",
      "notFound.tools",
      ...LOCALES.map((other) => `locale.${other}`),
    ]) {
      expectKey("layout", key);
    }
    expect(missing).toEqual([]);
  });
});

describe("links", () => {
  it("builds localized hrefs with an optional query", () => {
    expect(hrefFor("home", "it")).toBe("/");
    expect(hrefFor("home", "en")).toBe("/en");
    expect(hrefFor("home", "it", { l: 28000, t: "apprendistato", s: undefined, n: null })).toBe(
      "/?l=28000&t=apprendistato",
    );
    expect(hrefFor("printPayslip", "en", {})).toBe("/en/print-payslip");
  });

  it("lists absolute alternates for every locale plus x-default to Italian", () => {
    expect(alternatesFor(routeById("tfr"))).toEqual([
      { hreflang: "it", href: "https://quantoguadagno.com/tfr" },
      { hreflang: "en", href: "https://quantoguadagno.com/en/tfr-severance-pay" },
      { hreflang: "x-default", href: "https://quantoguadagno.com/tfr" },
    ]);
  });

  it("lists the alternates of a page outside the route table from its paths", () => {
    expect(
      alternatesForPaths({
        it: "/stipendio-netto/30000-euro-lordi",
        en: "/en/net-salary/30000-euro-gross",
      }),
    ).toEqual([
      { hreflang: "it", href: "https://quantoguadagno.com/stipendio-netto/30000-euro-lordi" },
      { hreflang: "en", href: "https://quantoguadagno.com/en/net-salary/30000-euro-gross" },
      {
        hreflang: "x-default",
        href: "https://quantoguadagno.com/stipendio-netto/30000-euro-lordi",
      },
    ]);
  });

  it("builds canonical URLs without a trailing slash except for the root", () => {
    expect(absoluteUrl("/")).toBe("https://quantoguadagno.com/");
    for (const path of realPaths.filter((candidate) => candidate !== "/")) {
      expect(absoluteUrl(path)).not.toMatch(/\/$/);
    }
  });

  it("derives breadcrumbs from the group", () => {
    expect(breadcrumbsFor(routeById("home"), "it")).toEqual([]);
    expect(breadcrumbsFor(routeById("tfr"), "en")).toEqual([
      { label: "brand.name", href: "https://quantoguadagno.com/en" },
      { label: "nav.group.work", href: "https://quantoguadagno.com/en#group-work" },
      { label: "nav.tfr", href: "https://quantoguadagno.com/en/tfr-severance-pay" },
    ]);
    expect(breadcrumbsFor(routeById("sources"), "it")).toEqual([
      { label: "brand.name", href: "https://quantoguadagno.com/" },
      { label: "nav.group.sources", href: "https://quantoguadagno.com/#group-sources" },
      { label: "nav.sources", href: "https://quantoguadagno.com/fonti" },
    ]);
    expect(breadcrumbsFor(routeById("about"), "it")).toEqual([
      { label: "brand.name", href: "https://quantoguadagno.com/" },
      { label: "nav.group.sources", href: "https://quantoguadagno.com/#group-sources" },
      { label: "nav.about", href: "https://quantoguadagno.com/informazioni" },
    ]);
  });
});

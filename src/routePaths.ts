import type { Locale } from "./i18n/locales.ts";

export const SITE_ORIGIN = "https://quantoguadagno.com";

export const ROUTE_PATHS = {
  home: { it: "/", en: "/en" },
  inverse: { it: "/calcolo-netto-lordo", en: "/en/net-to-gross" },
  tredicesima: { it: "/calcolo-tredicesima", en: "/en/tredicesima-13th-month-pay" },
  comparison: { it: "/confronto-stipendi", en: "/en/compare-job-offers" },
  employerCost: { it: "/costo-azienda", en: "/en/employer-cost" },
  netTable: { it: "/stipendio-netto", en: "/en/net-salary" },
  forfettario: { it: "/partita-iva-forfettario", en: "/en/forfettario-flat-tax" },
  ordinario: { it: "/partita-iva-ordinario", en: "/en/ordinary-tax-regime" },
  apprenticeship: { it: "/progressione-apprendistato", en: "/en/apprenticeship-pay" },
  tfr: { it: "/tfr", en: "/en/tfr-severance-pay" },
  preavviso: { it: "/preavviso-dimissioni", en: "/en/resignation-notice" },
  naspi: { it: "/calcolo-naspi", en: "/en/naspi-unemployment-benefit" },
  salaryHistory: { it: "/storico-stipendio", en: "/en/salary-history" },
  inflation: { it: "/inflazione", en: "/en/inflation" },
  compoundInterest: { it: "/interesse-composto", en: "/en/compound-interest" },
  method: { it: "/come-calcoliamo-il-netto", en: "/en/how-we-calculate-net-pay" },
  glossary: { it: "/glossario", en: "/en/glossary" },
  sources: { it: "/fonti", en: "/en/sources" },
  about: { it: "/informazioni", en: "/en/about" },
  printPayslip: { it: "/stampa-busta-paga", en: "/en/print-payslip" },
} as const satisfies Record<string, Readonly<Record<Locale, string>>>;

export type RouteId = keyof typeof ROUTE_PATHS;

export type QueryInput = Readonly<Record<string, string | number | boolean | null | undefined>>;

export function pathFor(id: RouteId, locale: Locale): string {
  return ROUTE_PATHS[id][locale];
}

export function hrefFor(id: RouteId, locale: Locale, query?: QueryInput): string {
  const path = pathFor(id, locale);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined) params.set(key, String(value));
  }
  const search = params.toString();
  return search === "" ? path : `${path}?${search}`;
}

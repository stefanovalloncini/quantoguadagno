export type ViewGroup = "comune" | "previdenza" | "forfettario";

export const VIEW_GROUPS: readonly ViewGroup[] = ["comune", "previdenza", "forfettario"];

export const GROUP_IDS: Readonly<Record<ViewGroup, string>> = {
  comune: "gruppo-comune",
  previdenza: "gruppo-previdenza",
  forfettario: "gruppo-forfettario",
};

export const IDS = {
  result: "risultato",
  resultHeading: "netto-titolo",
  ledgerHeading: "dettaglio-titolo",
  ledgerToggle: "spiega",
  extrasHeading: "personalizza-titolo",
  comparisonHeading: "forfettario-titolo",
  topicsHeading: "capire-titolo",
  revenue: "compensi",
  costs: "costi",
  year: "anno",
  region: "regione",
  comune: "comune",
  municipalRate: "aliquota-comunale",
  gestion: "gestione",
  hasOtherPension: "altra-previdenza",
  months: "mesi-attivita",
  cassaAmount: "importo-cassa",
  activity: "attivita",
  startup: "primi-anni",
} as const;

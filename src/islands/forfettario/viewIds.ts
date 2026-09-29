export type ViewGroup = "previdenza" | "regime" | "dipendente";

export const VIEW_GROUPS: readonly ViewGroup[] = ["previdenza", "regime", "dipendente"];

export const GROUP_IDS: Readonly<Record<ViewGroup, string>> = {
  previdenza: "gruppo-previdenza",
  regime: "gruppo-regime",
  dipendente: "gruppo-dipendente",
};

export const IDS = {
  result: "risultato",
  resultHeading: "netto-titolo",
  assumptionsHeading: "ipotesi-titolo",
  ledgerHeading: "dettaglio-titolo",
  ledgerToggle: "spiega",
  extrasHeading: "personalizza-titolo",
  revenue: "fatturato",
  activity: "attivita",
  year: "anno",
  yearsOfActivity: "anni-attivita",
  employeeCosts: "spese-dipendenti",
  gestion: "cassa",
  hasOtherPension: "altra-previdenza",
  mesiAttivita: "mesi-attivita",
  isAnte1996: "prima-1996",
  forfettarioDiscount35: "riduzione-35",
  newRegistrantDiscount50: "riduzione-50",
  cassaManualAmount: "importo-cassa",
  isConcurrentFullTimeEmployee: "dipendente-concorrente",
  concurrentEmployeeRal: "ral-dipendente",
} as const;

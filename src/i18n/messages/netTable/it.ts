export const it = {
  "netTable.scenario":
    "Per un dipendente a tempo indeterminato del settore privato che vive a {city}, con {count} mensilità e nessun familiare a carico.",
  "netTable.action": "Calcola con i tuoi dati",
  "netTable.understand.title": "Per capire il calcolo",

  "netTable.column.gross": "RAL",
  "netTable.column.net": "Netto annuo",
  "netTable.column.monthly": "Al mese su {count}",
  "netTable.column.withheld": "Trattenute",
  "netTable.inline.monthly": "{count} mensilità:",
  "netTable.inline.withheld": "trattenute:",
  "netTable.row.suffix": "lordi",

  "netTable.hub.title": "Tabella lordo netto {year}",
  "netTable.hub.table.title": "Tutti gli importi",
  "netTable.hub.table.caption": "Netto {year} per RAL, con residenza a {city}",
  "netTable.hub.withheld":
    "Trattenute: la parte della RAL che non arriva netta, cioè contributi INPS, IRPEF e addizionali meno i crediti in busta paga.",
} as const;

export type MessageKey = keyof typeof it;

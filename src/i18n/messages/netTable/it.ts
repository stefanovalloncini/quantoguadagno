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

  "netTable.page.title": "{gross} lordi: quanto resta netto nel {year}",
  "netTable.page.metaTitle": "{gross} lordi, netto {year}: {monthly} al mese",
  "netTable.page.metaDescription":
    "Con {gross} lordi nel {year} restano {net} netti all’anno: {thirteen} al mese su 13 mensilità, {fourteen} su 14. Per un dipendente a {city}.",
  "netTable.page.crumb": "{gross} lordi",
  "netTable.page.comuneSource":
    "Addizionale comunale di {city}: dati {ruleYear} del Dipartimento delle Finanze{carried, select, yes {; per il {year} non c’è ancora una nuova delibera} other {}}.",

  "netTable.ledger.title": "Dal lordo al netto",
  "netTable.ledger.municipalExempt":
    "Niente addizionale comunale: a {city} non si paga con un reddito imponibile fino a {threshold}.",
  "netTable.ledger.municipalNone":
    "Niente addizionale comunale: il comune di {city} non la applica.",
  "netTable.ledger.surchargesNotDue":
    "Niente addizionali regionale e comunale: non si pagano quando l’IRPEF netta è zero.",

  "netTable.months.title": "Al mese con 12, 13 o 14 mensilità",
  "netTable.months.lead": "Il netto annuo resta {net}: cambia solo in quante buste paga si divide.",
  "netTable.months.caption": "Netto al mese con {gross} lordi, per numero di mensilità",
  "netTable.months.column.count": "Mensilità",
  "netTable.months.column.net": "Netto al mese",
  "netTable.months.row": "{count} mensilità",

  "netTable.cities.title": "Nei capoluoghi di regione",
  "netTable.cities.lead":
    "Con {gross} lordi il netto annuo va da {low} ({lowCities}) a {high} ({highCities}): cambiano solo le addizionali regionale e comunale.",
  "netTable.cities.caption":
    "Netto {year} con {gross} lordi nei capoluoghi delle regioni e delle province autonome",
  "netTable.cities.column.region": "Regione",
  "netTable.cities.column.city": "Capoluogo",
  "netTable.cities.reference": "riferimento",
  "netTable.cities.note":
    "Ogni capoluogo apre il calcolatore con il suo comune; {city} è il riferimento di questa pagina.",

  "netTable.raise.title": "Se la RAL sale di {amount}",
  "netTable.raise.gain":
    "Con {gross} lordi il netto annuo sale di {annual}, cioè {monthly} al mese su {count} mensilità: di ogni euro lordo in più ti {cents, plural, one {resta # centesimo} other {restano # centesimi}}.",
  "netTable.raise.loss":
    "Con {gross} lordi il netto annuo scende di {annual}: con l’aumento si supera una soglia e si perde parte dei crediti o delle detrazioni.",

  "netTable.employer.title": "Quanto costa all’azienda",
  "netTable.employer.body":
    "Per l’azienda una RAL di {gross} costa {cost} all’anno: ai {gross} lordi si aggiungono {inps} di contributi INPS, {tfr} di trattamento di fine rapporto (TFR) e {other} di altri contributi.",
  "netTable.employer.link": "Calcola il costo del lavoro",

  "netTable.pager.label": "Altri importi",
  "netTable.pager.previous": "Precedente",
  "netTable.pager.next": "Successivo",
  "netTable.pager.all": "Tutti gli importi nella tabella lordo netto",
} as const;

export type MessageKey = keyof typeof it;

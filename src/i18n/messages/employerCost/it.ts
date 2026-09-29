export const it = {
  "employerCost.title": "Quanto costa un dipendente",
  "employerCost.lede":
    "Il costo per l’azienda di una retribuzione annua lorda (RAL), dal {first} al {last}.",

  "employerCost.gross.label": "Stipendio lordo annuo (RAL)",
  "employerCost.gross.hint": "Lo trovi nel contratto o nella lettera di assunzione.",
  "employerCost.gross.readAs": "Letto come {amount}",
  "employerCost.gross.monthly": "{amount} lordi al mese su {count} mensilità",
  "employerCost.gross.monthlyNote":
    "È un importo mensile? La RAL è il lordo di un anno: {monthly} al mese su {count} mensilità sono {annual}.",
  "employerCost.year.legend": "Anno fiscale",
  "employerCost.contract.label": "Tipo di contratto",
  "employerCost.contract.indeterminato": "Tempo indeterminato",
  "employerCost.contract.determinato": "Tempo determinato",
  "employerCost.contract.apprendistato": "Apprendistato",

  "employerCost.extras.title": "Personalizza il calcolo",
  "employerCost.extras.hint":
    "Regione, comune e mensilità servono solo a stimare il netto del dipendente: il costo per l’azienda non cambia.",
  "employerCost.group.net": "Netto del dipendente",
  "employerCost.recap.rateDefault": "comune non scelto",
  "employerCost.recap.rateManual": "addizionale comunale {rate}",
  "employerCost.region.label": "Regione di residenza",
  "employerCost.frequency.legend": "Mensilità",
  "employerCost.frequency.hint":
    "Quante buste paga riceve il dipendente in un anno: 13 con la tredicesima, 14 con anche la quattordicesima.",

  "employerCost.result.label": "Costo annuo per l’azienda",
  "employerCost.result.basis": "per una RAL di {amount}",
  "employerCost.result.monthly": "Al mese {amount}, media su 12 mesi",
  "employerCost.result.net":
    "Al dipendente restano {net} netti all’anno, in media {monthly} per ognuna delle {count} mensilità. Ogni euro netto costa all’azienda {ratio}.",
  "employerCost.result.empty": "Inserisci la RAL per vedere il costo.",
  "employerCost.result.fix": "Correggi i valori segnati per vedere il costo.",
  "employerCost.result.staleGross":
    "Non aggiornato: è il costo per {gross} lordi. Correggi la RAL per ricalcolare.",
  "employerCost.result.staleOther":
    "Non aggiornato: è il risultato di prima. Correggi i valori segnati per ricalcolare.",
  "employerCost.result.announce": "Costo annuo per l’azienda {amount}, per una RAL di {gross}.",
  "employerCost.result.estimate":
    "non comprende i costi fuori dal contratto, come formazione, attrezzatura e benefit.",
  "employerCost.result.verified": "Dati controllati il {date}",
  "employerCost.result.trust":
    "{checked}{pending, select, yes {: {count, plural, one {un valore usato in questo calcolo è ancora da verificare} other {# valori usati in questo calcolo sono ancora da verificare}}} other {}}.",

  "employerCost.assumptions.net": "Ipotesi per il netto del dipendente",
  "employerCost.assumption.year": "Anno fiscale {year}",
  "employerCost.assumption.contract":
    "{type, select, determinato {Tempo determinato} apprendistato {Apprendistato} other {Tempo indeterminato}}",
  "employerCost.assumption.region":
    "{region, select, bolzano {Provincia autonoma di Bolzano} trento {Provincia autonoma di Trento} other {Regione {name}}}",
  "employerCost.assumption.comune": "Comune di {name}, addizionale {rate}",
  "employerCost.assumption.comuneZero": "Comune di {name}, senza addizionale",
  "employerCost.assumption.rateDefault": "Addizionale comunale {rate}, comune non scelto",
  "employerCost.assumption.rateManual": "Addizionale comunale {rate}, inserita a mano",
  "employerCost.assumption.frequency": "{count} mensilità",
  "employerCost.change.year": "anno fiscale",
  "employerCost.change.contract": "contratto",
  "employerCost.change.region": "regione",
  "employerCost.change.comune": "comune",
  "employerCost.change.frequency": "mensilità",

  "employerCost.ledger.title": "Dettaglio del calcolo",
  "employerCost.ledger.caption": "Dettaglio del costo {year}, importi in euro",
  "employerCost.ledger.column.term": "Voce",
  "employerCost.ledger.column.monthly": "Media su 12 mesi",
  "employerCost.ledger.column.annual": "Annuo",
  "employerCost.ledger.gross": "Lordo",
  "employerCost.ledger.gross.rule": "RAL",
  "employerCost.ledger.gross.explain":
    "La retribuzione annua lorda (RAL) del contratto: tutto quello che il dipendente riceve in un anno, tredicesima compresa, prima di contributi e tasse.",
  "employerCost.ledger.inps": "Contributi INPS",
  "employerCost.ledger.inps.rule": "{rate} della RAL",
  "employerCost.ledger.inps.explain":
    "I contributi che l’azienda versa all’Istituto nazionale della previdenza sociale (INPS) per la pensione del dipendente, in aggiunta alla RAL.",
  "employerCost.ledger.tfr": "TFR",
  "employerCost.ledger.tfr.rule": "{rate} della RAL, accantonato",
  "employerCost.ledger.tfr.explain":
    "Il trattamento di fine rapporto (TFR): ogni anno l’azienda mette da parte la RAL divisa per 13,5, meno lo 0,50% che versa all’INPS, e lo paga quando il rapporto finisce.",
  "employerCost.ledger.other": "Altri contributi",
  "employerCost.ledger.other.rule": "INAIL, NASpI, maternità, cassa integrazione",
  "employerCost.ledger.other.explain":
    "L’assicurazione contro gli infortuni sul lavoro (INAIL) e i contributi per la disoccupazione (NASpI), la maternità e la cassa integrazione.",
  "employerCost.ledger.other.inail": "INAIL, {rate}",
  "employerCost.ledger.other.maternity": "Maternità, {rate}",
  "employerCost.ledger.other.naspi": "NASpI, {rate}",
  "employerCost.ledger.other.naspiAdditional": "Contributo addizionale NASpI, {rate}",
  "employerCost.ledger.other.cig": "Cassa integrazione, {rate}",
  "employerCost.ledger.other.other": "Altri contributi minori, {rate}",
  "employerCost.ledger.total": "Costo per l’azienda",
  "employerCost.ledger.total.rule": "RAL più contributi e TFR",
  "employerCost.ledger.total.explain":
    "Quanto spende l’azienda in un anno per questo contratto: {annual}, in media {monthly} al mese su 12 mesi.",

  "employerCost.action.print": "Stampa la busta paga del dipendente",
} as const;

export type MessageKey = keyof typeof it;

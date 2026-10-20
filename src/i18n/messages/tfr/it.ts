export const it = {
  "tfr.title": "Quanto TFR accumuli",
  "tfr.lede": "Il montante accumulato anno per anno, con rivalutazione e imposta già calcolate.",
  "tfr.ral.label": "Stipendio lordo annuo (RAL)",
  "tfr.ral.hint": "Lo stipendio lordo su cui si calcola la quota di TFR.",
  "tfr.form.years": "Anni di lavoro",
  "tfr.form.years.hint": "Per quanti anni resti con lo stesso datore di lavoro.",
  "tfr.form.inflation": "Inflazione attesa",
  "tfr.form.inflation.hint":
    "Determina la rivalutazione annua: 1,5% fisso più il 75% dell’inflazione.",
  "tfr.result.stock": "TFR accumulato",
  "tfr.result.stock.sub": "Quota annua {amount}, al lordo della tassazione separata",
  "tfr.result.empty": "Inserisci la RAL per vedere il TFR accumulato.",
  "tfr.result.fix": "Correggi i valori segnati per vedere il TFR accumulato.",
  "tfr.result.announce":
    "TFR accumulato {amount} dopo {years, plural, one {un anno} other {# anni}}.",
  "tfr.result.stale":
    "Non aggiornato: è il risultato di prima. Correggi i valori segnati per ricalcolare.",
  "tfr.result.verified": "Dati controllati il {date}",
  "tfr.breakdown.quote": "Quote versate",
  "tfr.breakdown.quote.explain":
    "RAL diviso 13,5, al netto dello 0,50% trattenuto come contributo IVS (art. 3 L. 297/1982).",
  "tfr.breakdown.revaluation": "Rivalutazione netta",
  "tfr.breakdown.revaluation.explain":
    "1,5% fisso più il 75% dell’inflazione attesa sul montante dell’anno prima, al netto del 17% di imposta sostitutiva.",
  "tfr.ledger.title": "Dettaglio del calcolo",
  "tfr.ledger.caption": "Dettaglio del calcolo su {years} anni, importi in euro",
  "tfr.ledger.column.term": "Voce",
  "tfr.ledger.column.total": "Importo",
  "tfr.schedule.title": "Anno per anno",
  "tfr.schedule.caption": "Accumulo anno per anno, importi in euro",
  "tfr.schedule.year": "Anno",
  "tfr.schedule.quota": "Quota",
  "tfr.schedule.revaluation": "Rivalutazione",
  "tfr.schedule.stock": "Accumulato",
  "tfr.result.note":
    "ogni anno accantoni circa un tredicesimo e mezzo dello stipendio, rivalutato all’1,5% più il 75% dell’inflazione ISTAT, con imposta sostitutiva del 17% sulla rivalutazione. Alla liquidazione si applica la tassazione separata, qui non calcolata.",
} as const;

export type MessageKey = keyof typeof it;

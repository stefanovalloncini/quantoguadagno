export const it = {
  "inflation.title": "Il potere d’acquisto nel tempo",
  "inflation.lede": "Quanto vale oggi un importo di un altro anno, secondo l’indice ISTAT FOI.",
  "inflation.form.amount": "Importo",
  "inflation.form.amount.hint": "La cifra di cui confrontare il valore reale tra due anni.",
  "inflation.form.fromYear": "Anno di partenza",
  "inflation.form.toYear": "Anno di confronto",
  "inflation.result.adjusted": "Equivalente nel {year}",
  "inflation.result.adjusted.sub": "Stesso potere d’acquisto del {year}",
  "inflation.result.cumulative": "Inflazione cumulata",
  "inflation.result.stale":
    "Non aggiornato: è il risultato di prima. Correggi i valori segnati per ricalcolare.",
  "inflation.result.announce": "{amount} del {fromYear} equivalgono a {adjusted} nel {toYear}.",
  "inflation.result.note":
    "Calcolo basato sull’indice ISTAT FOI (prezzi al consumo per famiglie di operai e impiegati), base 2015. È lo stesso indice usato per rivalutare il TFR.",
  "inflation.result.verified": "Dati controllati {dateArticle, select, l {l’} other {il }}{date}",
  "inflation.result.provisionalBadge": "Provvisorio",
  "inflation.result.provisional": "Il dato del {year} è ancora provvisorio.",
  "inflation.keepPace.title": "Quanto aumento serve per pareggiare l’inflazione",
  "inflation.keepPace.needed": "Importo necessario nel {year}",
  "inflation.keepPace.raise": "Aumento",
  "inflation.keepPace.note":
    "È l’aumento che riporta l’importo del {from} allo stesso potere d’acquisto nel {to}.",
  "inflation.frozen.title": "Se lo stipendio resta fermo",
  "inflation.frozen.hint": "Il valore reale dello stesso importo, se non aumenta mai.",
  "inflation.frozen.caption": "Valore reale, in euro del {year}",
  "inflation.frozen.col.year": "Anno",
  "inflation.frozen.col.real": "Valore reale",
  "inflation.frozen.col.loss": "Perdita",
  "inflation.frozen.row.base": "anno base",
  "inflation.frozen.row.loss": "perde il {rate}",
  "inflation.frozen.row.gain": "guadagna il {rate}",
  "inflation.frozen.chart.caption": "Il valore reale è calcolato ai prezzi del {year}.",
  "inflation.frozen.seriesEnd": "La serie ISTAT FOI arriva al {year}: oltre non c’è proiezione.",
  "inflation.form.fromYear.error": "Scegli un anno della serie ISTAT FOI.",
  "inflation.form.toYear.error": "Scegli un anno della serie ISTAT FOI.",
} as const;

export type MessageKey = keyof typeof it;

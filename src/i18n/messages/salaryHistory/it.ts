export const it = {
  "history.title": "I tuoi stipendi nel tempo",
  "history.lede":
    "Aggiungi la RAL di ogni anno: la confrontiamo con l’inflazione, con l’indice dei prezzi dell’ISTAT fino al {target}, e dal {firstTax} stimiamo anche il netto.",

  "history.form.title": "Aggiungi un anno",
  "history.form.errors": "C’è un problema",
  "history.form.year": "Anno",
  "history.form.gross": "Stipendio lordo annuo (RAL)",
  "history.form.gross.hint": "Quello del contratto in quell’anno, per esempio 32.000.",
  "history.form.gross.readAs": "Letto come {amount}",
  "history.form.duplicate":
    "Hai già aggiunto il {year}: rimuovilo dall’elenco per inserirlo di nuovo.",
  "history.form.note": "Nota, facoltativa",
  "history.form.note.hint": "Per esempio l’azienda o il ruolo: la ritrovi nell’elenco.",
  "history.form.submit": "Aggiungi l’anno",
  "history.form.privacy":
    "Gli anni che aggiungi restano solo in questo browser: non li inviamo a nessuno.",

  "history.net.title": "Per calcolare il netto",
  "history.net.recap": "{contract}, {count} mensilità, {region}, addizionale comunale {rate}",
  "history.contract.legend": "Tipo di contratto",
  "history.contract.indeterminato": "Tempo indeterminato",
  "history.contract.determinato": "Tempo determinato",
  "history.contract.apprendistato": "Apprendistato",
  "history.frequency.legend": "Mensilità",
  "history.frequency.hint": "Quante buste paga all’anno: 13 con la tredicesima.",
  "history.region.label": "Regione di residenza",
  "history.municipal.label": "Aliquota dell’addizionale comunale",
  "history.municipal.hint": "La trovi nella delibera del tuo comune, per esempio 0,8.",
  "history.largeCompany.label": "Azienda con più di 15 dipendenti",
  "history.family.title": "Familiari a carico",
  "history.family.none": "Nessuno",
  "history.family.spouse": "Coniuge a carico",
  "history.family.children": "Figli a carico con almeno 21 anni",
  "history.family.children.hint":
    "Per i figli più piccoli c’è l’assegno unico, non una detrazione in busta paga.",
  "history.family.others": "Altri familiari a carico",
  "history.family.part.spouse": "coniuge",
  "history.family.part.children": "{count, plural, one {# figlio} other {# figli}}",
  "history.family.part.others":
    "{count, plural, one {# altro familiare} other {# altri familiari}}",

  "history.result.change": "Potere d’acquisto",
  "history.result.change.basis": "dal {first} al {last}",
  "history.result.change.sub":
    "La RAL è passata da {from} a {to}, {nominal}; in euro del {target} da {fromReal} a {toReal}.",
  "history.result.single": "RAL del {year}",
  "history.result.single.real": "In euro del {target} sono {amount}.",
  "history.result.single.more":
    "Aggiungi un altro anno per vedere come è cambiato il potere d’acquisto.",
  "history.result.empty":
    "Aggiungi la RAL di almeno due anni per vedere se il tuo stipendio ha tenuto il passo con l’inflazione.",
  "history.announce.added": "Aggiunto il {year}: {amount}.",
  "history.announce.change": "Potere d’acquisto dal {first} al {last}: {change}.",
  "history.announce.removed": "Rimosso il {year}.",
  "history.announce.cleared": "Hai rimosso tutti gli anni.",

  "history.note.estimate":
    "rivalutiamo la RAL con l’indice dei prezzi FOI dell’ISTAT, media dell’anno; il dato del {target} è provvisorio. Il netto usa le regole fiscali di ogni anno e c’è solo dal {firstTax}.",
  "history.note.verified": "Dati controllati {dateArticle, select, l {l’} other {il }}{date}",

  "history.note.trust": "{checked}.",

  "history.entries.title": "Anni inseriti",
  "history.entries.caption": "Anni inseriti, dal più vecchio, importi lordi e netti in euro",
  "history.entries.year": "Anno",
  "history.entries.gross": "RAL",
  "history.entries.real": "In euro del {target}",
  "history.entries.net": "Netto annuo",
  "history.entries.actions": "Azioni",
  "history.entries.remove": "Rimuovi",
  "history.entries.remove.target": "il {year}",
  "history.entries.netMissing": "non stimato",
  "history.entries.realMissing": "non disponibile",
  "history.entries.netNote":
    "Il netto c’è solo dal {firstTax}: per gli anni prima non abbiamo le regole fiscali.",
  "history.entries.migrated": "impostazioni predefinite",
  "history.entries.migratedNote":
    "Gli anni salvati con la versione precedente del sito usano impostazioni predefinite per il netto: {count} mensilità, {region}, addizionale comunale {rate}. Per cambiarle, rimuovili e aggiungili di nuovo.",
  "history.entries.clear": "Rimuovi tutti gli anni",
  "history.entries.clear.question":
    "Vuoi rimuovere {count, plural, one {l’anno salvato} other {i # anni salvati}} in questo browser?",
  "history.entries.clear.confirm": "Sì, rimuovi tutti",
  "history.entries.clear.cancel": "Annulla",

  "history.chart.title": "Andamento",
  "history.chart.hint":
    "La RAL com’era ogni anno e il suo valore in euro del {target}, cioè tolta l’inflazione.",
  "history.chart.hint.projected": "La linea tratteggiata è la stima dei prossimi anni.",
  "history.chart.nominal": "RAL",
  "history.chart.real": "RAL in euro del {target}",
  "history.chart.projected": "RAL stimata",
  "history.chart.summary":
    "RAL dal {first} al {last}: da {from} a {to}; in euro del {target} da {fromReal} a {toReal}.",
  "history.chart.summary.projected": "Stima fino al {year}: {amount}.",
  "history.chart.caption":
    "RAL annue in euro. I valori degli anni inseriti sono nella tabella «Anni inseriti».",
  "history.chart.caption.projected":
    "RAL annue in euro. I valori degli anni inseriti sono nella tabella «Anni inseriti», quelli stimati nella tabella della proiezione.",
  "history.chart.year": "Anno",

  "history.projection.title": "Proiezione",
  "history.projection.hint":
    "Partiamo dalla RAL del {year}, {amount}, e la facciamo crescere ogni anno; il netto usa le regole fiscali del {taxYear}.",
  "history.projection.growth": "Crescita annua della RAL",
  "history.projection.growth.hint": "All’inizio è l’inflazione media degli ultimi 3 anni, {rate}.",
  "history.projection.horizon": "Anni da stimare",
  "history.projection.caption": "RAL e netto stimati",
  "history.projection.year": "Anno",
  "history.projection.gross": "RAL",
  "history.projection.net": "Netto annuo",
  "history.projection.empty":
    "Per la proiezione serve un anno dal {firstTax} in poi: aggiungilo e la vedrai qui.",
  "history.projection.stale": "Non aggiornata: correggi la crescita annua per ricalcolare.",
} as const;

export type MessageKey = keyof typeof it;

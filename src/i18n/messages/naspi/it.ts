export const it = {
  "naspi.title": "Indennità di disoccupazione (NASpI)",
  "naspi.lede":
    "Quanto ricevi al mese e per quanto tempo se perdi il lavoro senza averlo scelto, con le regole dell’INPS dal {first} al {last}.",

  "naspi.year.legend": "Anno della cessazione",
  "naspi.year.hint": "L’anno in cui è finito il rapporto di lavoro.",
  "naspi.gross.label": "Retribuzione lorda degli ultimi 4 anni",
  "naspi.gross.hint":
    "La somma dell’imponibile previdenziale nelle Certificazioni Uniche (CU), senza il trattamento di fine rapporto (TFR): con 4 anni di lavoro è circa 4 volte la RAL.",
  "naspi.gross.readAs": "Letto come {amount}",
  "naspi.gross.monthly":
    "Cioè in media {amount} lordi al mese nelle {weeks, plural, one {# settimana} other {# settimane}}",
  "naspi.weeks.label": "Settimane di contributi negli ultimi 4 anni",
  "naspi.weeks.hint":
    "Almeno 13; un anno intero sono 52 settimane, maternità e congedo parentale compresi.",
  "naspi.weeks.unit": "settimane",
  "naspi.age.label": "Età alla domanda",
  "naspi.age.hiddenUnit": "in anni",
  "naspi.age.hint": "Dai 55 anni la riduzione parte dall’ottavo mese invece che dal sesto.",
  "naspi.age.unit": "anni",
  "naspi.resigned.label":
    "Hai dato le dimissioni da un contratto a tempo indeterminato negli ultimi 12 mesi",
  "naspi.resigned.hint":
    "In questo caso servono almeno 13 settimane di contributi dopo le dimissioni.",
  "naspi.weeksAfter.label": "Settimane di contributi dopo le dimissioni",
  "naspi.weeksAfter.hint": "Quelle del lavoro che hai iniziato dopo le dimissioni.",

  "naspi.net.title": "Per stimare il netto",
  "naspi.extras.title": "Personalizza il calcolo",
  "naspi.extras.hint":
    "Altri redditi, regione e comune servono solo a stimare il netto: l’importo lordo non cambia.",
  "naspi.net.recap": "{other}; {residence}",
  "naspi.net.recap.noOther": "Nessun altro reddito nel {year}",
  "naspi.net.recap.other": "{amount} di altri redditi nel {year}",
  "naspi.net.recap.comune": "{comune}, {region}",
  "naspi.net.recap.rate": "{region}, addizionale comunale {rate}",
  "naspi.other.label": "Altri redditi da lavoro nel {year}",
  "naspi.other.hint":
    "Conta anche lo stipendio del {year} fino alla fine del lavoro: con altri redditi l’IRPEF sulla NASpI sale.",
  "naspi.region.label": "Regione di residenza",

  "naspi.result.label": "Importo mensile lordo",
  "naspi.result.basis.first": "{months, plural, one {nel primo mese} other {nei primi # mesi}}",
  "naspi.result.basis.all": "{months, plural, one {per l’unico mese} other {per tutti i # mesi}}",
  "naspi.result.net.alone": "Circa {amount} netti al mese, se nel {year} non hai altri redditi",
  "naspi.result.net.other": "Circa {amount} netti al mese, con {other} di altri redditi nel {year}",
  "naspi.result.total":
    "Per {weeks, plural, one {# settimana} other {# settimane}}, {months, plural, one {circa # mese} other {circa # mesi}}: in tutto {total} lordi",
  "naspi.result.empty": "Inserisci la retribuzione lorda degli ultimi 4 anni per vedere l’importo.",
  "naspi.result.fix": "Correggi i valori segnati per vedere l’importo.",
  "naspi.result.stale":
    "Non aggiornato: è il risultato di prima. Correggi i valori segnati per ricalcolare.",
  "naspi.result.announce":
    "Importo mensile lordo {amount} {basis}, circa {net} netti. In tutto {total} lordi.",
  "naspi.result.announce.none": "La NASpI non spetta. {reason}",

  "naspi.none.answer": "La NASpI non spetta",
  "naspi.ineligible.insufficient-weeks":
    "Servono almeno {min} settimane di contributi negli ultimi 4 anni: {weeks, plural, =0 {non ne hai indicata nessuna} one {ne hai indicata #} other {ne hai indicate #}}.",
  "naspi.ineligible.voluntary-resignation-lockout":
    "Dopo le dimissioni degli ultimi 12 mesi servono almeno {min} settimane di contributi: {weeks, plural, =0 {non ne hai indicata nessuna} one {ne hai indicata #} other {ne hai indicate #}}.",
  "naspi.check.title": "Cosa controllare",
  "naspi.check.statement":
    "Le settimane nel tuo estratto conto contributivo, nell’area personale del sito dell’INPS: contano anche maternità e congedo parentale.",
  "naspi.check.period": "Il periodo: contano le settimane dei 4 anni prima della fine del lavoro.",
  "naspi.check.afterResignation":
    "Contano solo le settimane del lavoro che hai iniziato dopo le dimissioni.",

  "naspi.note.estimate":
    "l’importo esatto lo calcola l’INPS, che trattiene anche l’IRPEF. Non consideriamo nuovi lavori mentre ricevi la NASpI.",
  "naspi.note.decision": "la decisione spetta all’INPS, che valuta la domanda.",
  "naspi.note.verified": "Dati controllati il {date}",
  "naspi.note.trust":
    "{checked}{pending, select, yes {: {count, plural, one {un valore usato in questo calcolo è ancora da verificare} other {# valori usati in questo calcolo sono ancora da verificare}}} other {}}.",

  "naspi.ledger.title": "Dettaglio del calcolo",
  "naspi.ledger.caption": "Calcolo della NASpI {year}, importi lordi in euro",
  "naspi.ledger.term": "Voce",
  "naspi.ledger.value": "Valore",
  "naspi.ledger.reference": "Retribuzione mensile di riferimento",
  "naspi.ledger.reference.rule": "media degli ultimi 4 anni",
  "naspi.ledger.reference.explain":
    "{gross} diviso {weeks, plural, one {# settimana} other {# settimane}}, per 52 settimane diviso 12 mesi. La legge parla di 4,33 settimane al mese: il valore che usiamo è tra quelli da verificare.",
  "naspi.ledger.first": "Importo del primo mese",
  "naspi.ledger.first.rule.base": "75% della retribuzione",
  "naspi.ledger.first.rule.split": "75% fino a {threshold}, 25% oltre",
  "naspi.ledger.first.rule.capped": "al massimale del {year}",
  "naspi.ledger.first.explain.base":
    "Il 75% di {reference}, che resta sotto la soglia di {threshold}. Nel {year} l’importo non può superare {cap}.",
  "naspi.ledger.first.explain.split":
    "Il 75% della retribuzione fino alla soglia di {threshold}, più il 25% della parte che la supera: {base} + {extra}. Nel {year} l’importo non può superare {cap}.",
  "naspi.ledger.first.explain.capped":
    "Il 75% fino alla soglia di {threshold} e il 25% oltre darebbero {uncapped}, ma nel {year} l’importo non può superare {cap}.",
  "naspi.ledger.duration": "Durata",
  "naspi.ledger.duration.rule": "metà delle settimane di contributi",
  "naspi.ledger.duration.value": "{weeks, plural, one {# settimana} other {# settimane}}",
  "naspi.ledger.duration.explain":
    "{weeks, plural, one {# settimana} other {# settimane}} di contributi danno {duration, plural, one {# settimana} other {# settimane}} di NASpI, {months, plural, one {circa # mese} other {circa # mesi}}. {capped, select, yes {È il massimo: 104 settimane, circa 24 mesi.} other {Il massimo è 104 settimane, circa 24 mesi.}}",
  "naspi.ledger.reduction": "Riduzione",
  "naspi.ledger.reduction.rule": "{start, select, 8 {dall’ottavo mese} other {dal sesto mese}}",
  "naspi.ledger.reduction.value": "{rate} al mese",
  "naspi.ledger.reduction.explain":
    "{start, select, 8 {Dall’ottavo mese} other {Dal sesto mese}} l’importo cala del {rate} ogni mese, calcolato sull’importo del mese prima. {start, select, 8 {Hai almeno 55 anni: la riduzione parte due mesi più tardi.} other {Dai 55 anni la riduzione parte dall’ottavo mese.}}",
  "naspi.ledger.reduction.none": "La NASpI dura meno: la riduzione non si applica.",
  "naspi.ledger.total": "Totale lordo",
  "naspi.ledger.total.rule": "{months, plural, one {un mese} other {somma dei # mesi}}",
  "naspi.ledger.total.explain":
    "{months, plural, one {L’importo dell’unico mese, nella tabella qui sotto.} other {La somma dei # importi mensili della tabella qui sotto.}}",

  "naspi.estimate.title": "Come stimiamo il netto",
  "naspi.estimate.caption": "Stima del netto della NASpI {year}, importi in euro",
  "naspi.estimate.period": "{months, plural, one {Nel mese} other {Nei # mesi}}",
  "naspi.estimate.period.first": "Nei primi 12 mesi",
  "naspi.estimate.gross": "Totale lordo",
  "naspi.estimate.gross.rule": "{months, plural, one {# mese di NASpI} other {# mesi di NASpI}}",
  "naspi.estimate.gross.rule.first": "primi 12 mesi di NASpI",
  "naspi.estimate.gross.alone": "La stima tratta la NASpI come l’unico reddito del {year}.",
  "naspi.estimate.gross.other":
    "La NASpI si somma agli altri {other} di reddito del {year}: le imposte che le attribuiamo sono quelle in più rispetto ai soli altri redditi.",
  "naspi.estimate.gross.later": "Dopo il dodicesimo mese usiamo la stessa percentuale di imposte.",
  "naspi.estimate.irpef": "IRPEF netta",
  "naspi.estimate.irpef.rule.flat": "{rate}, meno la detrazione per lavoro dipendente",
  "naspi.estimate.irpef.rule.bands": "a scaglioni, meno la detrazione per lavoro dipendente",
  "naspi.estimate.irpef.explain":
    "Sulla NASpI si paga l’imposta sul reddito delle persone fisiche (IRPEF), con la stessa detrazione dello stipendio.",
  "naspi.estimate.irpef.gross.flat": "IRPEF lorda: {rate} di {income}",
  "naspi.estimate.irpef.gross.bands": "IRPEF lorda, a scaglioni su {income}",
  "naspi.estimate.irpef.deduction":
    "Detrazione per lavoro dipendente, art. 13 del Testo unico delle imposte sui redditi (TUIR)",
  "naspi.estimate.irpef.net": "IRPEF netta",
  "naspi.estimate.irpef.withOther": "IRPEF netta su {income}, NASpI e altri redditi",
  "naspi.estimate.irpef.otherOnly": "IRPEF netta sui soli altri redditi",
  "naspi.estimate.irpef.share": "Parte dovuta alla NASpI",
  "naspi.estimate.regional": "Addizionale regionale",
  "naspi.estimate.regional.rule": "{region}, {rates}",
  "naspi.estimate.regional.explain": "Le aliquote {regionOf} per il {year}, applicate a {income}.",
  "naspi.estimate.local.withOther":
    "È la differenza tra l’addizionale su {total} e quella sui soli altri redditi.",
  "naspi.estimate.local.none":
    "Non si paga: con l’IRPEF netta a zero le addizionali non sono dovute.",
  "naspi.estimate.municipal": "Addizionale comunale",
  "naspi.estimate.municipal.rule.exempt": "{comune}, esente fino a {amount}",
  "naspi.estimate.municipal.rule.comune": "{comune}, {rate}",
  "naspi.estimate.municipal.rule.rate": "{rate}, comune non scelto",
  "naspi.estimate.municipal.explain.exempt":
    "Con {income} di reddito resti sotto la soglia di esenzione di {comune}.",
  "naspi.estimate.municipal.explain.comune":
    "L’aliquota di {comune} per il {year}, applicata a {income}.",
  "naspi.estimate.municipal.explain.rate":
    "Senza un comune usiamo {article, select, lo {lo } l {l’} other {il }}{rate}: scegli il tuo comune in «Per stimare il netto».",
  "naspi.estimate.net": "Netto stimato",
  "naspi.estimate.net.rule": "{share} di imposte",
  "naspi.estimate.net.explain":
    "{months, plural, one {Nel primo mese} other {Nei primi # mesi}} {amount} meno {article, select, lo {lo } l {l’} other {il }}{share} fanno {net}, da qui «circa {rounded}». Mese per mese è nella tabella qui sotto.",

  "naspi.chart.title": "Andamento mese per mese",
  "naspi.chart.hint":
    "Il grafico e la tabella mostrano gli stessi importi lordi; la tabella aggiunge il netto stimato.",
  "naspi.chart.summary.flat":
    "Importo lordo della NASpI mese per mese: {amount} per tutti i {months} mesi.",
  "naspi.chart.summary":
    "Importo lordo della NASpI mese per mese: {first} {basis}, poi in calo del {rate} al mese fino a {last} nel mese {months}.",
  "naspi.chart.caption": "Importo lordo per mese, in euro.",
  "naspi.chart.caption.reduction":
    "Importo lordo per mese, in euro: {start, select, 8 {dall’ottavo mese} other {dal sesto mese}} ogni barra è il {rate} più bassa della precedente.",
  "naspi.chart.month": "Mese",
  "naspi.table.caption": "Importo mese per mese",
  "naspi.table.caption.partial":
    "Qui i primi {shown} mesi su {months}; il totale è di tutti i mesi.",
  "naspi.table.month": "Mese",
  "naspi.table.gross": "Lordo",
  "naspi.table.net": "Netto stimato",
  "naspi.table.change": "Rispetto al primo mese",
  "naspi.table.total": "Totale",

  "naspi.topics.title": "Per capire la NASpI",
  "naspi.topic.who": "Chi ha diritto alla NASpI",
  "naspi.topic.who.body":
    "Chi perde il lavoro senza averlo scelto: per esempio con un licenziamento, alla scadenza di un contratto a termine o con dimissioni per giusta causa. Servono almeno 13 settimane di contributi negli ultimi 4 anni. La domanda va fatta all’INPS entro 68 giorni dalla fine del lavoro.",
  "naspi.topic.duration": "Durata della NASpI",
  "naspi.topic.duration.body":
    "La metà delle settimane di contributi degli ultimi 4 anni, fino a un massimo di 104 settimane, circa 24 mesi. Con 100 settimane di contributi spettano 50 settimane di NASpI.",
  "naspi.topic.tax": "IRPEF sulla NASpI",
  "naspi.topic.tax.body":
    "La NASpI è un reddito soggetto a IRPEF come lo stipendio, con la detrazione per lavoro dipendente, e l’INPS trattiene l’imposta ogni mese. Per questo mostriamo l’importo lordo e una stima del netto, che dipende dagli altri redditi che hai nell’anno.",
  "naspi.topic.work": "Lavorare mentre ricevi la NASpI",
  "naspi.topic.work.body":
    "Si può, ma l’attività va comunicata all’INPS, che riduce o sospende l’indennità secondo il contratto e il reddito. Questo calcolo non ne tiene conto: verifica il tuo caso con l’INPS.",

  "naspi.bar.label": "Importo mensile lordo",
} as const;

export type MessageKey = keyof typeof it;

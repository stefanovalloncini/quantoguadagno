export const it = {
  "ordinario.title": "Partita IVA in regime ordinario",
  "ordinario.lede":
    "Per professionisti e ditte individuali in contabilità semplificata. Sotto il calcolo trovi il confronto con il forfettario.",

  "ordinario.revenue.label": "Compensi o ricavi dell’anno",
  "ordinario.revenue.hint": "Quello che incassi nell’anno, senza IVA.",
  "ordinario.costs.label": "Costi deducibili dell’anno",
  "ordinario.costs.hint": "Le spese per l’attività che paghi nell’anno, senza IVA.",
  "ordinario.year.legend": "Anno fiscale",
  "ordinario.region.label": "Regione di residenza",
  "ordinario.region.hint": "Serve per l’addizionale regionale.",

  "ordinario.extras.title": "Personalizza il calcolo",
  "ordinario.extras.hint":
    "Il comune, la gestione dei contributi e l’attività per il confronto con il forfettario.",
  "ordinario.group.comune": "Addizionale comunale",
  "ordinario.group.previdenza": "Contributi previdenziali",
  "ordinario.group.forfettario": "Confronto con il forfettario",
  "ordinario.recap.rateDefault": "comune non scelto, addizionale {rate}",
  "ordinario.recap.rateManual": "addizionale comunale {rate}",
  "ordinario.recap.reduced": "{gestion}, aliquota {rate}",
  "ordinario.recap.months": "{gestion}, {months, plural, one {# mese} other {# mesi}}",
  "ordinario.recap.cassa": "{gestion}, {amount} all’anno",
  "ordinario.recap.forfettario": "coefficiente {coefficient}, imposta {rate}",

  "ordinario.gestion.label": "Gestione previdenziale",
  "ordinario.gestion.hint":
    "La Gestione Separata è per i professionisti senza una cassa propria, Artigiani e Commercianti per le ditte individuali.",
  "ordinario.gestion.gestione-separata": "Gestione Separata INPS",
  "ordinario.gestion.artigiani": "INPS Artigiani",
  "ordinario.gestion.commercianti": "INPS Commercianti",
  "ordinario.gestion.cassa-professionale": "Cassa professionale",
  "ordinario.otherPension.label": "Ho già un’altra copertura previdenziale",
  "ordinario.otherPension.hint":
    "Per esempio un lavoro dipendente o una pensione: l’aliquota della Gestione Separata scende {article, select, lo {allo } l {all’} other {al }}{rate}.",
  "ordinario.months.label": "Mesi di attività nell’anno",
  "ordinario.months.hint": "Il contributo minimo si paga in proporzione ai mesi di iscrizione.",
  "ordinario.cassa.label": "Contributi annui alla cassa",
  "ordinario.cassa.hint": "Quanto versi alla tua cassa per l’anno: ogni cassa ha le sue regole.",
  "ordinario.activity.label": "Attività svolta",
  "ordinario.activity.hint":
    "Nel forfettario decide il coefficiente di redditività, cioè la parte dei ricavi su cui paghi l’imposta.",
  "ordinario.activity.professionisti":
    "Attività professionali, scientifiche, tecniche, sanitarie, di istruzione",
  "ordinario.activity.altre-attivita": "Altre attività economiche",
  "ordinario.activity.intermediari": "Intermediari del commercio",
  "ordinario.activity.commercio": "Commercio all’ingrosso e al dettaglio",
  "ordinario.activity.commercio-ambulante-altro": "Commercio ambulante di altri prodotti",
  "ordinario.activity.commercio-ambulante-alimentare":
    "Commercio ambulante di alimentari e bevande",
  "ordinario.activity.industrie-alimentari": "Industrie alimentari e bevande",
  "ordinario.activity.servizi-alloggio": "Servizi di alloggio e ristorazione",
  "ordinario.activity.costruzioni": "Costruzioni e attività immobiliari",
  "ordinario.startup.label": "Sono nei primi {years} anni di attività",
  "ordinario.startup.hint":
    "Con un’attività nuova e i requisiti di legge, nel forfettario l’imposta sostitutiva è {startupArticle, select, lo {dello } l {dell’} other {del }}{startupRate} invece {standardArticle, select, lo {dello } l {dell’} other {del }}{standardRate}.",

  "ordinario.result.label": "Netto annuo",
  "ordinario.result.basis": "dopo costi, contributi e imposte",
  "ordinario.result.monthly": "In media {amount} al mese su 12 mesi",
  "ordinario.result.empty": "Scrivi i compensi o i ricavi dell’anno per vedere il netto.",
  "ordinario.result.fix": "Correggi i valori segnati per vedere il netto.",
  "ordinario.result.stale": "Non aggiornato: correggi il campo segnato per ricalcolare.",
  "ordinario.result.announce": "Netto annuo stimato {amount}, in media {monthly} al mese.",
  "ordinario.result.estimate":
    "vale se la partita IVA è il tuo unico reddito e se versi nell’anno i contributi dell’anno.",
  "ordinario.result.verified": "Dati controllati il {date}",
  "ordinario.result.trust":
    "{checked}{pending, select, yes {: {count, plural, one {un valore usato in questo calcolo è ancora da verificare} other {# valori usati in questo calcolo sono ancora da verificare}}} other {}}.",
  "ordinario.result.vatTerm": "IRAP e IVA:",
  "ordinario.result.vat":
    "dal 2022 le persone fisiche non pagano l’IRAP. L’IVA resta fuori dal calcolo: quella che incassi la versi allo Stato, quella che paghi sugli acquisti la detrai.",

  "ordinario.ledger.title": "Dettaglio del calcolo",
  "ordinario.ledger.caption": "Dettaglio del calcolo {year}, importi in euro",
  "ordinario.ledger.column.term": "Voce",
  "ordinario.ledger.column.annual": "Annuo",
  "ordinario.ledger.revenue": "Compensi o ricavi",
  "ordinario.ledger.revenue.rule": "senza IVA",
  "ordinario.ledger.revenue.explain":
    "Quello che incassi nell’anno per l’attività, senza IVA: per un professionista i compensi percepiti (art. 54 TUIR), per una ditta individuale in contabilità semplificata i ricavi incassati (art. 66 TUIR).",
  "ordinario.ledger.costs": "Costi deducibili",
  "ordinario.ledger.costs.explain":
    "Le spese per l’attività che paghi nell’anno, senza l’IVA che detrai. Alcune spese si deducono solo in parte: conta la parte deducibile.",
  "ordinario.ledger.income": "Reddito",
  "ordinario.ledger.income.rule": "compensi o ricavi meno costi",
  "ordinario.ledger.income.explain":
    "Il reddito di lavoro autonomo o d’impresa. Su questo reddito si calcolano i contributi e la detrazione per lavoro autonomo.",
  "ordinario.ledger.income.loss":
    "I costi superano i ricavi: il reddito è una perdita, quindi niente IRPEF e niente addizionali.",
  "ordinario.ledger.contributions.gestione-separata": "Contributi Gestione Separata",
  "ordinario.ledger.contributions.artigiani": "Contributi INPS Artigiani",
  "ordinario.ledger.contributions.commercianti": "Contributi INPS Commercianti",
  "ordinario.ledger.contributions.cassa-professionale": "Contributi alla cassa",
  "ordinario.ledger.contributions.rate": "{rate} del reddito",
  "ordinario.ledger.contributions.capped": "{rate} del reddito fino al massimale",
  "ordinario.ledger.contributions.separata":
    "La Gestione Separata INPS chiede {article, select, lo {lo } l {l’} other {il }}{rate} del reddito, fino al massimale di {massimale}.",
  "ordinario.ledger.contributions.reduced":
    "È l’aliquota ridotta per chi ha già un’altra copertura previdenziale.",
  "ordinario.ledger.contributions.minimum": "contributo minimo",
  "ordinario.ledger.contributions.overMinimum": "minimo più {rate} oltre {minimale}",
  "ordinario.ledger.contributions.minimumExplain":
    "Artigiani e commercianti pagano un contributo minimo anche se il reddito è più basso del minimale di {minimale}: {fixed} per {months, plural, one {# mese} other {# mesi}} di attività.",
  "ordinario.ledger.contributions.overExplain":
    "Sul reddito oltre il minimale si aggiunge {article, select, lo {lo } l {l’} other {il }}{rate}, che diventa {higherArticle, select, lo {lo } l {l’} other {il }}{higherRate} oltre {band}, fino al massimale di {massimale}.",
  "ordinario.ledger.contributions.typed": "importo inserito",
  "ordinario.ledger.contributions.cassa":
    "Il contributo annuo che hai scritto per la tua cassa professionale, dedotto per intero dal reddito.",
  "ordinario.ledger.taxable": "Reddito imponibile",
  "ordinario.ledger.taxable.rule": "reddito meno contributi",
  "ordinario.ledger.taxable.explain":
    "I contributi previdenziali obbligatori si tolgono dal reddito (art. 10 TUIR): IRPEF e addizionali si calcolano su quello che resta.",
  "ordinario.ledger.taxable.zero":
    "Non resta reddito da tassare, quindi niente IRPEF e niente addizionali.",
  "ordinario.ledger.irpef": "IRPEF netta",
  "ordinario.ledger.irpef.rule": "{gross} di IRPEF lorda meno {deduction} di detrazione",
  "ordinario.ledger.irpef.ruleNoDeduction": "a scaglioni, senza detrazione",
  "ordinario.ledger.irpef.ruleZero": "nessuna imposta",
  "ordinario.ledger.irpef.explain":
    "L’IRPEF si calcola a scaglioni sul reddito imponibile. Poi si toglie la detrazione per lavoro autonomo e impresa minore (art. 13, comma 5, TUIR), che dipende dal reddito prima dei contributi, {income}.",
  "ordinario.ledger.irpef.gross": "IRPEF lorda: {bands}",
  "ordinario.ledger.irpef.bandUpTo": "{rate} fino a {max}",
  "ordinario.ledger.irpef.bandAbove": "{rate} oltre",
  "ordinario.ledger.irpef.deduction": "Detrazione per lavoro autonomo",
  "ordinario.ledger.irpef.lost":
    "La detrazione spettante è di {due}, più dell’imposta: la parte che avanza si perde.",
  "ordinario.ledger.regional": "Addizionale regionale",
  "ordinario.ledger.regional.explain":
    "L’imposta della tua regione sul reddito imponibile, con le aliquote della regione per l’anno.",
  "ordinario.ledger.municipal": "Addizionale comunale",
  "ordinario.ledger.municipal.explain": "L’imposta del tuo comune sul reddito imponibile.",
  "ordinario.ledger.municipal.none": "comune non scelto, {rate}",
  "ordinario.ledger.municipal.manual": "aliquota inserita, {rate}",
  "ordinario.ledger.municipal.zero": "{name}, senza addizionale",
  "ordinario.ledger.notDue": "{name}, non dovuta",
  "ordinario.ledger.exempt": "{name}, esente fino a {amount}",
  "ordinario.ledger.surchargesNotDue":
    "Non si paga: le addizionali sono dovute solo se, tolte le detrazioni, resta IRPEF da pagare.",
  "ordinario.ledger.net": "Netto annuo",
  "ordinario.ledger.net.rule": "reddito meno contributi e imposte",
  "ordinario.ledger.net.explain":
    "Quello che ti resta dopo costi, contributi e imposte. In media sono {monthly} al mese su 12 mesi.",

  "ordinario.compare.title": "Con il forfettario",
  "ordinario.compare.more":
    "Con il forfettario il netto annuo sarebbe {net}: {difference} in più che con l’ordinario.",
  "ordinario.compare.less":
    "Con il forfettario il netto annuo sarebbe {net}: {difference} in meno che con l’ordinario.",
  "ordinario.compare.same": "Con il forfettario il netto annuo sarebbe lo stesso: {net}.",
  "ordinario.compare.caption": "Ordinario e forfettario nel {year}",
  "ordinario.compare.captionNote":
    "Importi annui in euro, con gli stessi ricavi, gli stessi costi e la stessa gestione previdenziale.",
  "ordinario.compare.column.item": "Voce",
  "ordinario.compare.column.ordinario": "Ordinario",
  "ordinario.compare.column.forfettario": "Forfettario",
  "ordinario.compare.column.difference": "Differenza",
  "ordinario.compare.row.revenue": "Compensi o ricavi",
  "ordinario.compare.row.costs": "Costi",
  "ordinario.compare.row.contributions": "Contributi",
  "ordinario.compare.row.taxes": "Imposte",
  "ordinario.compare.row.net": "Netto annuo",
  "ordinario.compare.how":
    "Nel forfettario paghi l’imposta sostitutiva {rateArticle, select, lo {dello } l {dell’} other {del }}{rate} {coefficientArticle, select, lo {sullo } l {sull’} other {sul }}{coefficient} dei ricavi, tolti i contributi. I costi veri non si deducono, ma li paghi lo stesso: per questo il netto li toglie.",
  "ordinario.compare.discount":
    "Non è applicata la riduzione {article, select, lo {dello } l {dell’} other {del }}{discount} dei contributi che artigiani e commercianti possono chiedere nel forfettario.",
  "ordinario.compare.cassa":
    "Per la cassa professionale vale lo stesso contributo che hai scritto per l’ordinario.",
  "ordinario.compare.limits":
    "Il confronto non controlla gli altri requisiti del forfettario. Per quelli, e per le riduzioni dei contributi, usa il {link}.",
  "ordinario.compare.link": "calcolatore del forfettario",
  "ordinario.compare.overTitle": "Oltre il limite del forfettario",
  "ordinario.compare.over":
    "Con {revenue} di compensi o ricavi superi il limite di {limit} all’anno: il forfettario non si applica.",

  "ordinario.topics.title": "Per capire il regime ordinario",
  "ordinario.topic.payments": "Saldo e acconti: quando si paga",
  "ordinario.topic.payments.when":
    "Il calcolo mostra imposte e contributi di un anno, non le date in cui li paghi. Le imposte di un anno si versano l’anno dopo, con la dichiarazione dei redditi: il saldo entro il 30 giugno, insieme al primo acconto per l’anno in corso, e il secondo acconto entro il 30 novembre.",
  "ordinario.topic.payments.advance":
    "L’acconto IRPEF è pari all’imposta dell’anno prima, tolte le ritenute, e non è dovuto se l’importo è inferiore a 52 €. Si versa il 40% a giugno e il resto a novembre, oppure metà e metà se applichi gli indici sintetici di affidabilità (ISA). Se prevedi un’imposta più bassa, puoi calcolare gli acconti su quella.",
  "ordinario.topic.payments.withholding":
    "Se sei un professionista e fatturi ad aziende o ad altri professionisti, il cliente trattiene il 20% dei compensi come ritenuta d’acconto e lo versa per te: è IRPEF già pagata, che si toglie dal saldo e dagli acconti.",
  "ordinario.topic.payments.firstYear":
    "Nel primo anno di attività, se l’anno prima non avevi IRPEF da versare, non paghi acconti. L’anno dopo, entro il 30 giugno, versi il saldo di tutto il primo anno e il primo acconto del secondo.",
  "ordinario.topic.payments.others":
    "L’addizionale comunale ha un acconto del 30%, la regionale si paga tutta con il saldo. I contributi della Gestione Separata seguono le scadenze delle imposte, con saldo e due acconti. Artigiani e commercianti pagano il contributo minimo in quattro rate, a maggio, agosto, novembre e febbraio, e la parte oltre il minimale con le imposte.",
  "ordinario.topic.deduction": "La detrazione per lavoro autonomo",
  "ordinario.topic.deduction.amounts":
    "Dall’IRPEF lorda si toglie una detrazione che dipende dal reddito prima dei contributi: {base} fino a {first}, poi scende fino a {fixed} a {second} e si azzera a {last}. Con un reddito oltre {above} e fino a {upTo} aumenta di {bonus} (art. 13, commi 5 e 5-ter, TUIR).",
  "ordinario.topic.deduction.limits":
    "La detrazione non diventa un rimborso: se supera l’imposta, la parte in più si perde. Non si somma alle detrazioni per lavoro dipendente o per pensione.",
  "ordinario.topic.scope": "Cosa resta fuori dal calcolo",
  "ordinario.topic.scope.income":
    "Il calcolo vale se la partita IVA è il tuo unico reddito. Con uno stipendio o una pensione i redditi si sommano e l’IRPEF sale.",
  "ordinario.topic.scope.missing":
    "Non considera le perdite degli anni precedenti, gli altri oneri deducibili e detraibili, le riduzioni dei contributi di artigiani e commercianti e i minimi delle casse professionali. Per le imprese vale la contabilità semplificata: in contabilità ordinaria la detrazione per lavoro autonomo non spetta.",
} as const;

export type MessageKey = keyof typeof it;

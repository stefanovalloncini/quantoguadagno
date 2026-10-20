export const it = {
  "inverse.title": "Dal netto al lordo",
  "inverse.lede":
    "La retribuzione annua lorda (RAL) che serve per il netto che vuoi, dal {first} al {last}.",

  "inverse.target.label": "Netto annuo che vuoi ricevere",
  "inverse.target.hint": "Le buste paga di un anno, tredicesima compresa.",
  "inverse.target.readAs": "Letto come {amount}",
  "inverse.target.monthly": "{amount} netti al mese su {count} mensilità",
  "inverse.target.monthlyNote":
    "È un importo mensile? Il netto annuo è la somma di un anno: {monthly} al mese su {count} mensilità sono {annual}.",
  "inverse.target.grossQuestion": "Conosci già la RAL?",
  "inverse.target.grossLink": "Calcola il netto dalla RAL",
  "inverse.year.legend": "Anno fiscale",
  "inverse.region.label": "Regione di residenza",
  "inverse.frequency.legend": "Mensilità",
  "inverse.frequency.hint":
    "Quante buste paga ricevi in un anno: 13 con la tredicesima, 14 con anche la quattordicesima.",

  "inverse.extras.title": "Personalizza il calcolo",
  "inverse.extras.hint":
    "Comune, mensilità e contratto cambiano la RAL che serve; il gruppo mostra i valori che stai usando.",
  "inverse.group.contract": "Contratto e INPS",
  "inverse.contract.legend": "Tipo di contratto",
  "inverse.contract.hint":
    "Con l’apprendistato i contributi INPS scendono {article, select, lo {allo } l {all’} other {al }}{rate}; tempo determinato e indeterminato chiedono la stessa RAL.",
  "inverse.contract.indeterminato": "Tempo indeterminato",
  "inverse.contract.determinato": "Tempo determinato",
  "inverse.contract.apprendistato": "Apprendistato",
  "inverse.public.label": "Dipendente pubblico",
  "inverse.public.hint":
    "I contributi sono {article, select, lo {lo } l {l’} other {il }}{publicRate} invece {baseArticle, select, lo {dello } l {dell’} other {del }}{rate}.",
  "inverse.large.label": "Azienda con più di 15 dipendenti",
  "inverse.large.hint":
    "I contributi salgono {article, select, lo {allo } l {all’} other {al }}{rate} per la cassa integrazione straordinaria.",
  "inverse.part.contractType":
    "{type, select, determinato {Tempo determinato} apprendistato {Apprendistato} other {Tempo indeterminato}}",
  "inverse.part.sector": "{public, select, yes {settore pubblico} other {settore privato}}",
  "inverse.part.largeCompany": "azienda con più di 15 dipendenti",
  "inverse.part.inpsRate": "contributi {rate}",

  "inverse.result.label": "RAL necessaria",
  "inverse.result.basis": "per {amount} netti all’anno",
  "inverse.result.monthly": "Lordo mensile {amount} su {count} mensilità",
  "inverse.result.net":
    "Con questa RAL il netto è {annual} all’anno, in media {monthly} per ognuna delle {count} mensilità.",
  "inverse.result.notConverged":
    "Nessuna RAL dà esattamente {target} netti: a questo livello di reddito una soglia di legge fa cambiare il netto a scatti. La RAL più vicina dà {annual} netti all’anno.",
  "inverse.result.empty": "Inserisci il netto annuo per vedere la RAL.",
  "inverse.result.fix": "Correggi i valori segnati per vedere la RAL.",
  "inverse.result.staleTarget":
    "Non aggiornato: è la RAL per {amount} netti. Correggi il netto annuo per ricalcolare.",
  "inverse.result.staleOther":
    "Non aggiornato: è il risultato di prima. Correggi i valori segnati per ricalcolare.",
  "inverse.result.announce": "RAL necessaria {amount}, per {target} netti all’anno.",
  "inverse.result.estimate": "la busta paga resta il riferimento.",
  "inverse.result.verified": "Dati controllati {dateArticle, select, l {l’} other {il }}{date}",
  "inverse.result.trust":
    "{checked}{pending, select, yes {: {count, plural, one {un valore usato in questo calcolo è ancora da verificare} other {# valori usati in questo calcolo sono ancora da verificare}}} other {}}.",

  "inverse.ledger.title": "Dettaglio del calcolo",
  "inverse.ledger.caption": "Dettaglio del calcolo {year}, importi in euro",
  "inverse.ledger.column.term": "Voce",
  "inverse.ledger.column.monthly": "Media mensile",
  "inverse.ledger.column.annual": "Annuo",
  "inverse.ledger.gross": "Lordo",
  "inverse.ledger.gross.rule": "RAL",
  "inverse.ledger.gross.explain":
    "La retribuzione annua lorda (RAL) che serve: quello che guadagni in un anno prima di contributi e tasse.",
  "inverse.ledger.inps": "Contributi INPS",
  "inverse.ledger.inps.rule": "{rate} del lordo",
  "inverse.ledger.inps.explain":
    "I contributi per la tua pensione, versati all’Istituto nazionale della previdenza sociale (INPS) e trattenuti in busta paga.",
  "inverse.ledger.taxable": "Reddito imponibile",
  "inverse.ledger.taxable.rule": "lordo meno contributi",
  "inverse.ledger.taxable.explain":
    "Il lordo meno i contributi: su questa cifra si calcolano l’imposta sul reddito delle persone fisiche (IRPEF) e le addizionali.",
  "inverse.ledger.irpef": "IRPEF netta",
  "inverse.ledger.irpef.rule": "a scaglioni, meno detrazioni",
  "inverse.ledger.irpef.explain":
    "L’IRPEF si calcola a scaglioni sul reddito imponibile; poi si tolgono le detrazioni che ti spettano.",
  "inverse.ledger.irpef.gross": "IRPEF lorda",
  "inverse.ledger.irpef.deductions": "Detrazioni",
  "inverse.ledger.ruleNotDue": "{name}, non dovuta",
  "inverse.ledger.ruleExempt": "{name}, esente fino a {amount}",
  "inverse.ledger.regional": "Addizionale regionale",
  "inverse.ledger.regional.explain":
    "L’imposta della tua regione sul reddito imponibile. Si paga solo se l’IRPEF netta è maggiore di zero.",
  "inverse.ledger.municipal": "Addizionale comunale",
  "inverse.ledger.municipal.ruleNone": "comune non scelto, {rate}",
  "inverse.ledger.municipal.ruleManual": "aliquota inserita, {rate}",
  "inverse.ledger.municipal.ruleZero": "{name}, senza addizionale",
  "inverse.ledger.municipal.explain":
    "L’imposta del tuo comune sul reddito imponibile. Si paga solo se l’IRPEF netta è maggiore di zero.",
  "inverse.ledger.somma": "Somma aggiuntiva",
  "inverse.ledger.somma.rule": "taglio del cuneo fiscale",
  "inverse.ledger.somma.explain":
    "Con il taglio del cuneo fiscale, chi ha un reddito da lavoro fino a {max} riceve in busta paga una somma in più. Non è tassata.",
  "inverse.ledger.trattamento": "Trattamento integrativo",
  "inverse.ledger.trattamento.rule": "fino a {max} all’anno",
  "inverse.ledger.trattamento.explain":
    "Un credito in busta paga per i redditi più bassi, fino a {max} all’anno. Si aggiunge al netto.",
  "inverse.ledger.net": "Netto",
  "inverse.ledger.net.rule": "imponibile meno IRPEF e addizionali",
  "inverse.ledger.net.ruleCredits": "imponibile meno imposte, più crediti",
  "inverse.ledger.net.explain":
    "Quello che ricevi: {annual} in un anno, cioè in media {monthly} per ognuna delle {count} mensilità.",

  "inverse.action.print": "Stampa la busta paga con questa RAL",
  "inverse.action.employerCost": "Calcola quanto costa all’azienda",
} as const;

export type MessageKey = keyof typeof it;

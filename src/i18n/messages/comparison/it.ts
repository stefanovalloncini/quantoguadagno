export const it = {
  "comparison.title": "Confronto tra due offerte",
  "comparison.lede":
    "Metti a confronto due offerte di lavoro e scopri quale ti lascia più netto in un anno e in ogni busta paga.",

  "comparison.conditions.title": "Le tue condizioni",
  "comparison.conditions.hint": "Valgono per entrambe le offerte.",
  "comparison.group.residence": "Anno e residenza",
  "comparison.group.contract": "Contratto e INPS",
  "comparison.group.dependents": "Familiari a carico",
  "comparison.recap.residence": "{year}, {region}, {local}",
  "comparison.recap.comune": "{name} ({rate})",
  "comparison.recap.rate": "addizionale comunale {rate}",
  "comparison.recap.contract": "{contract}, contributi {rate}",
  "comparison.recap.none": "Nessuno",

  "comparison.year.legend": "Anno fiscale",
  "comparison.region.label": "Regione di residenza",
  "comparison.contract.legend": "Tipo di contratto",
  "comparison.contract.hint":
    "Con l’apprendistato i contributi INPS scendono {article, select, lo {allo } l {all’} other {al }}{rate}; tempo determinato e indeterminato danno lo stesso netto.",
  "comparison.contract.option":
    "{type, select, determinato {Tempo determinato} apprendistato {Apprendistato} other {Tempo indeterminato}}",
  "comparison.public.label": "Dipendente pubblico",
  "comparison.public.hint":
    "I contributi sono {article, select, lo {lo } l {l’} other {il }}{publicRate} invece {baseArticle, select, lo {dello } l {dell’} other {del }}{rate}.",
  "comparison.before1996.label": "Iscritto all’INPS prima del 1996",
  "comparison.before1996.hint":
    "Non hai il massimale, quindi paghi i contributi su tutto il lordo, anche oltre {massimale}.",
  "comparison.spouse.label": "Coniuge a carico",
  "comparison.spouse.hint": "Se nel {year} il coniuge ha un reddito fino a {limit}.",
  "comparison.children.label":
    "{from2025, select, yes {Figli a carico dai 21 ai 29 anni} other {Figli a carico dai 21 anni in su}}",
  "comparison.children.hint":
    "{from2025, select, yes {Oltre i 29 anni solo con una disabilità; il} other {Il}} reddito di ogni figlio non deve superare {young} fino a 24 anni, {limit} dopo.",
  "comparison.others.label": "Altri familiari a carico",
  "comparison.others.hint":
    "{from2025, select, yes {Solo genitori o nonni che vivono con te.} other {Genitori, fratelli e altri familiari che vivono con te o ricevono da te un assegno alimentare.}}",

  "comparison.offer.title": "{offer, select, a {Offerta A} other {Offerta B}}",
  "comparison.offer.of": "{offer, select, a {dell’offerta A} other {dell’offerta B}}",
  "comparison.gross.label": "Stipendio lordo annuo (RAL)",
  "comparison.gross.unit": "{of}, in euro",
  "comparison.gross.readAs": "Letto come {amount}",
  "comparison.gross.monthly": "{amount} lordi al mese su {count} mensilità",
  "comparison.gross.monthlyNote":
    "È un importo mensile? La RAL è il lordo di un anno: {monthly} al mese su {count} mensilità sono {annual}.",
  "comparison.frequency.legend": "Mensilità",
  "comparison.offer.net": "Netto annuo",
  "comparison.offer.detail": "Netto mensile {amount}, su {count} mensilità",
  "comparison.offer.empty": "Inserisci la RAL per vedere il netto.",
  "comparison.offer.stale": "Non aggiornato: correggi la RAL per ricalcolare.",
  "comparison.offer.staleShared": "Non aggiornato: correggi i valori segnati per ricalcolare.",

  "comparison.verdict.winner":
    "{winner, select, a {Con l’offerta A ti resta di più} other {Con l’offerta B ti resta di più}}",
  "comparison.verdict.tie": "Le due offerte ti lasciano lo stesso netto",
  "comparison.verdict.pending": "Quale offerta ti lascia di più",
  "comparison.verdict.basis": "netti all’anno",
  "comparison.verdict.basisTie": "netti all’anno con entrambe",
  "comparison.verdict.basisTieRounded": "netti all’anno con entrambe, arrotondati all’euro",
  "comparison.verdict.monthly": "In media {amount} in più al mese, su 12 mesi",
  "comparison.verdict.tieFrequencies":
    "Cambia solo come lo ricevi: {countA} buste paga con A, {countB} con B.",
  "comparison.verdict.empty": "Inserisci la RAL di entrambe le offerte per confrontarle.",
  "comparison.verdict.fix": "Correggi i valori segnati per confrontare le offerte.",
  "comparison.verdict.stale":
    "Non aggiornato: è il confronto di prima. Correggi i valori segnati per ricalcolare.",
  "comparison.verdict.payslipLower":
    "Ogni busta paga di {winner} è più bassa, {winnerAmount} contro {otherAmount}, perché {winner} divide lo stipendio in {winnerCount} mensilità invece di {otherCount}: in un anno però ricevi di più.",
  "comparison.verdict.payslipHigherFewer":
    "Ogni busta paga di {winner} è anche più alta, {winnerAmount} contro {otherAmount}: il lordo è più alto e {winner} lo divide in {winnerCount} mensilità invece di {otherCount}.",
  "comparison.verdict.payslipHigher":
    "Ogni busta paga di {winner} è anche più alta: {winnerAmount} contro {otherAmount}.",
  "comparison.verdict.payslipSame":
    "Ogni busta paga vale {amount} con entrambe, ma {winner} ne paga {winnerCount} invece di {otherCount}.",
  "comparison.verdict.kept":
    "Dei {gross} lordi in più di {winner} ti restano {net} netti, cioè {article, select, lo {lo } l {l’} other {il }}{share}.",
  "comparison.verdict.keptLowerGross":
    "Il lordo di {winner} non è più alto, ma tra trattenute e crediti ti restano {net} netti in più all’anno.",
  "comparison.verdict.tiePayslip":
    "Con {more} ogni busta paga è più bassa, {moreAmount} contro {fewerAmount}, perché {sameGross, select, yes {lo stesso lordo è diviso} other {il lordo è diviso}} in {moreCount} mensilità invece di {fewerCount}.",
  "comparison.verdict.tieSamePayslip":
    "Anche le buste paga sono quasi uguali: {amountA} con A, {amountB} con B.",
  "comparison.verdict.tieRule":
    "Consideriamo pari due offerte che si distanziano di meno di 1 € al mese.",
  "comparison.verdict.tieGap":
    "La differenza è di {amount} all’anno: consideriamo pari due offerte che si distanziano di meno di 1 € al mese.",
  "comparison.announce.winner": "{verdict}: {amount} netti all’anno, in media {monthly} al mese.",
  "comparison.announce.tie": "{verdict}: {amount} netti all’anno.",

  "comparison.part.contractType":
    "{type, select, determinato {tempo determinato} apprendistato {apprendistato} other {tempo indeterminato}}",
  "comparison.part.sector": "{public, select, yes {settore pubblico} other {settore privato}}",
  "comparison.part.before1996": "iscritto all’INPS prima del 1996",
  "comparison.part.spouse": "coniuge",
  "comparison.part.children": "{count, plural, one {# figlio} other {# figli}}",
  "comparison.part.others": "{count, plural, one {# altro familiare} other {# altri familiari}}",

  "comparison.estimate":
    "la busta paga resta il riferimento. Confrontiamo lordo e mensilità, senza benefit per nessuna delle due.",
  "comparison.verified": "Dati controllati {dateArticle, select, l {l’} other {il }}{date}",
  "comparison.trust":
    "{checked}{pending, select, yes {: {count, plural, one {un valore usato in questo calcolo è ancora da verificare} other {# valori usati in questo calcolo sono ancora da verificare}}} other {}}.",

  "comparison.table.caption": "Le due offerte voce per voce",
  "comparison.table.note": "Nell’ultima colonna il segno dice quanto cambia il tuo netto con B.",
  "comparison.table.item": "Voce",
  "comparison.table.delta": "B rispetto ad A",
  "comparison.row.gross": "Lordo annuo",
  "comparison.row.inps": "Contributi INPS, {rate}{relief, select, yes {, meno l’esonero} other {}}",
  "comparison.row.irpef": "IRPEF netta, a scaglioni meno detrazioni",
  "comparison.row.regional": "Addizionale regionale, {region} {rate}",
  "comparison.row.municipal": "Addizionale comunale, {place}",
  "comparison.row.municipalPlace": "{name} {rate}",
  "comparison.row.credits": "Crediti in busta paga",
  "comparison.row.netAnnual": "Netto annuo",
  "comparison.row.netMonthly": "Netto mensile (A su {countA} mensilità, B su {countB})",
  "comparison.row.netMonthlySame": "Netto mensile, su {count} mensilità",
  "comparison.row.average": "Media su 12 mesi",
} as const;

export type MessageKey = keyof typeof it;

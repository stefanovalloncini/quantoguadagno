export const it = {
  "employee.title": "Stipendio netto",
  "employee.lede": "Il netto in busta paga, dal {first} al {last}.",

  "employee.gross.label": "Stipendio lordo annuo (RAL)",
  "employee.gross.hint": "Lo trovi nel contratto o nella lettera di assunzione.",
  "employee.gross.readAs": "Letto come {amount}",
  "employee.gross.monthly": "{amount} lordi al mese su {count} mensilità",
  "employee.gross.monthlyNote":
    "È un importo mensile? La RAL è il lordo di un anno: {monthly} al mese su {count} mensilità sono {annual}.",
  "employee.gross.netQuestion": "Conosci solo il netto?",
  "employee.gross.netLink": "Calcola il lordo dal netto",
  "employee.year.legend": "Anno fiscale",
  "employee.region.label": "Regione di residenza",

  "employee.result.label": "Netto mensile",
  "employee.result.basis": "media su {count} mensilità",
  "employee.result.annual": "Netto annuo {amount}",
  "employee.result.split":
    "Mese normale {ordinary}, {count, plural, =1 {tredicesima {extra}} =2 {tredicesima e quattordicesima {extra} ciascuna} other {mensilità aggiuntive {extra} ciascuna}}",
  "employee.result.withheld": "Trattenute: {share} del lordo ({amount} su {gross}).",
  "employee.result.withheldCredits":
    "Trattenute: {share} del lordo ({amount} su {gross}). Crediti in busta paga: {credits}, già compresi nel netto.",
  "employee.result.empty": "Inserisci la RAL per vedere il netto.",
  "employee.result.fix": "Correggi i valori segnati per vedere il netto.",
  "employee.result.staleGross":
    "Non aggiornato: è il risultato per {gross} lordi. Correggi la RAL per ricalcolare.",
  "employee.result.staleOther":
    "Non aggiornato: è il risultato di prima. Correggi i valori segnati per ricalcolare.",
  "employee.result.announce": "Netto mensile {amount}, media su {count} mensilità.",
  "employee.result.estimate": "la busta paga resta il riferimento.",
  "employee.result.verified": "Dati controllati il {date}",

  "employee.result.trust":
    "{checked}{pending, select, yes {: {count, plural, one {un valore usato in questo calcolo è ancora da verificare} other {# valori usati in questo calcolo sono ancora da verificare}}} other {}}.",

  "employee.assumption.year": "Anno fiscale {year}",
  "employee.assumption.region":
    "{region, select, bolzano {Provincia autonoma di Bolzano} trento {Provincia autonoma di Trento} other {Regione {name}}}",
  "employee.assumption.comune": "Comune di {name}, addizionale {rate}",
  "employee.assumption.comuneZero": "Comune di {name}, senza addizionale",
  "employee.assumption.rateDefault": "Addizionale comunale {rate}, comune non scelto",
  "employee.assumption.rateManual": "Addizionale comunale {rate}, inserita a mano",
  "employee.assumption.frequency": "{count} mensilità",
  "employee.assumption.noDependents": "Nessun familiare a carico",
  "employee.assumption.dependents": "{list} a carico",
  "employee.assumption.noExpenses": "Nessuna spesa detraibile",
  "employee.assumption.noBenefits": "Nessun benefit o welfare",
  "employee.change.year": "anno fiscale",
  "employee.change.region": "regione",
  "employee.change.comune": "comune",
  "employee.change.frequency": "mensilità",
  "employee.change.contract": "contratto",
  "employee.change.dependents": "familiari a carico",
  "employee.change.expenses": "spese detraibili",
  "employee.change.special": "condizioni particolari",
  "employee.change.benefits": "benefit e welfare",

  "employee.part.spouse": "coniuge",
  "employee.part.children": "{count, plural, one {# figlio} other {# figli}}",
  "employee.part.others": "{count, plural, one {# altro familiare} other {# altri familiari}}",
  "employee.part.mortgage": "interessi sul mutuo {amount}",
  "employee.part.medical": "spese sanitarie {amount}",
  "employee.part.otherExpenses": "altre spese {amount}",
  "employee.part.pensionFund": "previdenza complementare {amount}",
  "employee.part.impatriati": "regime impatriati",
  "employee.part.impatriatiChildren": "regime impatriati con figli minorenni",
  "employee.part.madre": "esonero per madri lavoratrici",
  "employee.part.vouchers": "buoni pasto {amount} al giorno",
  "employee.part.welfare": "welfare {amount}",
  "employee.part.health": "polizza sanitaria {amount}",
  "employee.part.car": "auto aziendale {amount}",
  "employee.part.premio": "premio di risultato {amount}",
  "employee.part.contractType":
    "{type, select, determinato {Tempo determinato} apprendistato {Apprendistato} other {Tempo indeterminato}}",
  "employee.part.sector": "{public, select, yes {settore pubblico} other {settore privato}}",
  "employee.part.largeCompany": "azienda con più di 15 dipendenti",
  "employee.part.before1996": "iscritto all’INPS prima del 1996",
  "employee.part.inpsRate": "contributi {rate}",
  "employee.part.inpsCustom": "contributi {rate}, inseriti a mano",

  "employee.ledger.title": "Dettaglio del calcolo",
  "employee.ledger.caption": "Dettaglio del calcolo {year}, importi in euro",
  "employee.ledger.column.term": "Voce",
  "employee.ledger.column.monthly": "Media mensile",
  "employee.ledger.column.annual": "Annuo",
  "employee.ledger.gross": "Lordo",
  "employee.ledger.gross.rule": "RAL",
  "employee.ledger.gross.explain":
    "La retribuzione annua lorda (RAL) del contratto: quello che guadagni in un anno prima di contributi e tasse.",
  "employee.ledger.inps": "Contributi INPS",
  "employee.ledger.inps.rule": "{rate} del lordo",
  "employee.ledger.inps.ruleRelief": "{rate} del lordo, meno l’esonero",
  "employee.ledger.inps.explain":
    "I contributi per la tua pensione, versati all’Istituto nazionale della previdenza sociale (INPS) e trattenuti in busta paga: {article, select, lo {lo } l {l’} other {il }}{rate} del lordo{above, select, yes {, {aboveArticle, select, lo {lo } l {l’} other {il }}{aboveRate} sulla parte oltre {ceiling}} other {}}.",
  "employee.ledger.inps.massimale":
    "Oltre il massimale di {massimale} all’anno i contributi non si pagano.",
  "employee.ledger.inps.base": "Contributi {rate}",
  "employee.ledger.inps.exemption2024": "Esonero contributivo 2024",
  "employee.ledger.inps.madre": "Esonero per madri lavoratrici",
  "employee.ledger.taxable": "Reddito imponibile",
  "employee.ledger.taxable.rule": "lordo meno contributi",
  "employee.ledger.taxable.ruleAdjusted": "lordo meno contributi, con benefit e deduzioni",
  "employee.ledger.taxable.explain":
    "Il lordo meno i contributi: su questa cifra si calcolano l’imposta sul reddito delle persone fisiche (IRPEF) e le addizionali.",
  "employee.ledger.taxable.explainAdjusted":
    "Su questa cifra si calcolano l’imposta sul reddito delle persone fisiche (IRPEF) e le addizionali. I benefit tassabili si sommano al reddito ma non li ricevi in busta paga; la previdenza complementare si toglie dal reddito.",
  "employee.ledger.taxable.benefits": "Benefit tassabili",
  "employee.ledger.taxable.pensionFund": "Previdenza complementare",
  "employee.ledger.impatriatiExempt": "Quota esente, regime impatriati ({rate})",
  "employee.ledger.impatriatiExempt.rule": "non tassata, resta nel netto",
  "employee.ledger.impatriatiExempt.explain":
    "Con il regime impatriati il {rate} del reddito da lavoro non è tassato, fino a {max} di reddito. IRPEF, detrazioni e addizionali si calcolano sul resto; il taglio del cuneo fiscale e il trattamento integrativo guardano invece al reddito intero.",
  "employee.ledger.irpefBase": "Reddito imponibile IRPEF",
  "employee.ledger.irpefBase.rule": "base di IRPEF e addizionali",
  "employee.ledger.irpef": "IRPEF netta",
  "employee.ledger.irpef.rule": "a scaglioni, meno detrazioni",
  "employee.ledger.irpef.ruleImpatriati": "a scaglioni sul {share} del reddito, meno detrazioni",
  "employee.ledger.irpef.ruleImpatriatiCapped": "a scaglioni sulla parte tassata, meno detrazioni",
  "employee.ledger.irpef.explain":
    "L’IRPEF si calcola a scaglioni sul reddito imponibile; poi si tolgono le detrazioni che ti spettano.",
  "employee.ledger.irpef.gross": "IRPEF lorda: {bands}",
  "employee.ledger.irpef.bandUpTo": "{rate} fino a {max}",
  "employee.ledger.irpef.bandAbove": "{rate} oltre",
  "employee.ledger.irpef.work":
    "Detrazione per lavoro dipendente, art. 13 del Testo unico delle imposte sui redditi (TUIR)",
  "employee.ledger.irpef.dependents": "Detrazioni per familiari a carico",
  "employee.ledger.irpef.expenses": "Detrazioni per spese",
  "employee.ledger.irpef.wedge": "Detrazione aggiuntiva del taglio del cuneo fiscale",
  "employee.ledger.irpef.wedgeNote":
    "La detrazione aggiuntiva vale {max} fino a {full} di reddito imponibile e cala fino a zero a {end}: {whole, select, yes {nel tuo caso spetta per intero} other {nel tuo caso ne spettano {amount}}}.",
  "employee.ledger.irpef.incapiente":
    "Le detrazioni superano l’IRPEF lorda: l’IRPEF netta è zero e la parte in più non si recupera.",
  "employee.ledger.irpef.impatriati":
    "Con il regime impatriati l’IRPEF si calcola solo su una parte del reddito imponibile: risparmi {amount}.",
  "employee.ledger.ruleNotDue": "{name}, non dovuta",
  "employee.ledger.ruleExempt": "{name}, esente fino a {amount}",
  "employee.ledger.regional": "Addizionale regionale",
  "employee.ledger.regional.explain": "L’imposta della tua regione sul reddito imponibile.",
  "employee.ledger.regional.range":
    "{regionIn} va {fromArticle, select, lo {dallo } l {dall’} other {dal }}{min} {toArticle, select, lo {allo } l {all’} other {al }}{max}, a scaglioni come l’IRPEF.",
  "employee.ledger.regional.single":
    "{regionIn} è {article, select, lo {lo } l {l’} other {il }}{rate}.",
  "employee.ledger.regional.exempt": "Non si paga con un reddito imponibile fino a {amount}.",
  "employee.ledger.regional.flat":
    "Fino a {limit} di reddito imponibile si applica {article, select, lo {lo } l {l’} other {il }}{rate} su tutto il reddito.",
  "employee.ledger.regional.deductions":
    "Il calcolo applica anche le detrazioni previste dalla regione.",
  "employee.ledger.municipal": "Addizionale comunale",
  "employee.ledger.municipal.ruleNone": "comune non scelto, {rate}",
  "employee.ledger.municipal.ruleManual": "aliquota inserita, {rate}",
  "employee.ledger.municipal.ruleZero": "{name}, senza addizionale",
  "employee.ledger.municipal.explain": "L’imposta del tuo comune sul reddito imponibile.",
  "employee.ledger.municipal.flat":
    "A {name} è {article, select, lo {lo } l {l’} other {il }}{rate}{exempt, select, yes {, con esenzione fino a {amount}: sopra la soglia si paga su tutto il reddito imponibile} other {}}.",
  "employee.ledger.municipal.range":
    "A {name} va {fromArticle, select, lo {dallo } l {dall’} other {dal }}{min} {toArticle, select, lo {allo } l {all’} other {al }}{max}, a scaglioni{exempt, select, yes {, con esenzione fino a {amount}} other {}}.",
  "employee.ledger.municipal.zero": "Il comune di {name} non applica l’addizionale.",
  "employee.ledger.municipal.underThreshold":
    "Il tuo reddito imponibile è sotto la soglia, quindi non la paghi.",
  "employee.ledger.municipal.none":
    "Non hai scelto il comune: usiamo {article, select, lo {lo } l {l’} other {il }}{rate}, senza soglia di esenzione. Sceglilo per un calcolo più preciso.",
  "employee.ledger.municipal.manual":
    "Usiamo l’aliquota che hai inserito, {article, select, lo {lo } l {l’} other {il }}{rate}, senza soglia di esenzione.",
  "employee.ledger.surchargesNotDue":
    "Non la paghi: le addizionali sono dovute solo quando l’IRPEF netta è maggiore di zero.",
  "employee.ledger.somma": "Somma aggiuntiva",
  "employee.ledger.somma.rule": "taglio del cuneo fiscale",
  "employee.ledger.somma.explain":
    "Con il taglio del cuneo fiscale, chi ha un reddito da lavoro fino a {max} riceve in busta paga una somma in più, calcolata come percentuale del reddito. Non è tassata.",
  "employee.ledger.trattamento": "Trattamento integrativo",
  "employee.ledger.trattamento.rule": "fino a {max} all’anno",
  "employee.ledger.trattamento.explain":
    "Un credito fino a {max} all’anno per chi ha un reddito imponibile fino a {full}; tra {full} e {partial} spetta solo se le detrazioni superano l’imposta. Si aggiunge al netto.",
  "employee.ledger.premio": "Premio di risultato",
  "employee.ledger.premio.rule": "netto, tassato a parte",
  "employee.ledger.premio.explain":
    "Il premio di risultato ha una tassazione sua: al posto dell’IRPEF si paga un’imposta sostitutiva.",
  "employee.ledger.premio.gross": "Premio lordo",
  "employee.ledger.premio.inps": "Contributi INPS sul premio",
  "employee.ledger.premio.tax": "Imposta sostitutiva {rate}",
  "employee.ledger.premio.net": "Premio netto",
  "employee.ledger.net": "Netto",
  "employee.ledger.net.rule": "imponibile meno IRPEF e addizionali",
  "employee.ledger.net.ruleCredits": "imponibile meno imposte, più crediti",
  "employee.ledger.net.ruleAdjusted":
    "lordo meno contributi e imposte{credits, select, yes {, più crediti} other {}}",
  "employee.ledger.net.explain":
    "Quello che ricevi: {annual} in un anno, cioè in media {monthly} per ognuna delle {count} mensilità.",

  "employee.action.print": "Stampa la busta paga",
  "employee.action.employerCost": "Calcola quanto costi all’azienda",

  "employee.frequency.legend": "Mensilità",
  "employee.frequency.hint":
    "Quante buste paga ricevi in un anno: 13 con la tredicesima, 14 con anche la quattordicesima.",
  "employee.extras.title": "Personalizza il calcolo",
  "employee.extras.hint":
    "Comune, mensilità e i gruppi qui sotto cambiano il netto; ogni gruppo mostra i valori che stai usando.",

  "employee.group.contract": "Contratto e INPS",
  "employee.group.dependents": "Familiari a carico",
  "employee.group.expenses": "Spese detraibili",
  "employee.group.special": "Condizioni particolari",
  "employee.group.benefits": "Benefit e welfare",
  "employee.recap.none.masculine": "Nessuno",
  "employee.recap.none.feminine": "Nessuna",

  "employee.contract.legend": "Tipo di contratto",
  "employee.contract.hint":
    "Con l’apprendistato i contributi INPS scendono {article, select, lo {allo } l {all’} other {al }}{rate}; tempo determinato e indeterminato danno lo stesso netto.",
  "employee.contract.indeterminato": "Tempo indeterminato",
  "employee.contract.determinato": "Tempo determinato",
  "employee.contract.apprendistato": "Apprendistato",
  "employee.ccnl.label": "Contratto collettivo nazionale (CCNL)",
  "employee.ccnl.hint": "Facoltativo: imposta le mensilità previste dal tuo contratto collettivo.",
  "employee.ccnl.none": "Nessuno",
  "employee.ccnl.option":
    "{ccnl, select, commercio {Commercio} metalmeccanici {Metalmeccanici} logistica {Logistica} cooperative_sociali {Cooperative sociali} other {}}, {count} mensilità",
  "employee.public.label": "Dipendente pubblico",
  "employee.public.hint":
    "I contributi sono {article, select, lo {lo } l {l’} other {il }}{publicRate} invece {baseArticle, select, lo {dello } l {dell’} other {del }}{rate}.",
  "employee.large.label": "Azienda con più di 15 dipendenti",
  "employee.large.hint":
    "I contributi salgono {article, select, lo {allo } l {all’} other {al }}{rate} per la cassa integrazione straordinaria.",
  "employee.before1996.label": "Iscritto all’INPS prima del 1996",
  "employee.before1996.hint":
    "Non hai il massimale, quindi paghi i contributi su tutto il lordo, anche oltre {massimale}.",
  "employee.override.label": "Aliquote INPS diverse",
  "employee.override.hint": "Solo se il tuo contratto prevede aliquote diverse da quelle standard.",
  "employee.override.employee": "Aliquota INPS a tuo carico",
  "employee.override.employer": "Aliquota INPS a carico dell’azienda",
  "employee.override.employerHint": "Serve per il costo aziendale; non cambia il tuo netto.",

  "employee.spouse.label": "Coniuge a carico",
  "employee.spouse.hint": "Se nel {year} il coniuge ha un reddito fino a {limit}.",
  "employee.children.label":
    "{from2025, select, yes {Figli a carico dai 21 ai 29 anni} other {Figli a carico dai 21 anni in su}}",
  "employee.children.hint":
    "{from2025, select, yes {Oltre i 29 anni solo con una disabilità; il} other {Il}} reddito di ogni figlio non deve superare {young} fino a 24 anni, {limit} dopo. Per i figli sotto i 21 anni c’è l’assegno unico, non una detrazione in busta paga.",
  "employee.others.label": "Altri familiari a carico",
  "employee.others.hint":
    "{from2025, select, yes {Solo genitori o nonni che vivono con te.} other {Genitori, fratelli e altri familiari che vivono con te o ricevono da te un assegno alimentare.}}",

  "employee.mortgage.label": "Interessi sul mutuo della prima casa",
  "employee.mortgage.hint": "Detraibili al 19% fino a {max} di interessi all’anno.",
  "employee.medical.label": "Spese sanitarie",
  "employee.medical.hint": "Detraibili al 19% per la parte oltre {floor}.",
  "employee.medical.after": "Detrazione di {amount}: il 19% di {base}.",
  "employee.otherExpenses.label": "Altre spese al 19%",
  "employee.otherExpenses.hint": "Per esempio istruzione e assicurazioni.",
  "employee.pensionFund.label": "Previdenza complementare",
  "employee.pensionFund.hint":
    "I versamenti al fondo pensione si tolgono dal reddito, fino a {max} all’anno.",

  "employee.impatriati.label": "Regime impatriati (rientro in Italia)",
  "employee.impatriati.hint":
    "Per chi trasferisce la residenza in Italia con i requisiti del D.Lgs. 209/2023: {standard} del reddito da lavoro non è tassato, {withChildren} con figli minorenni.",
  "employee.impatriatiChildren.label": "Hai figli minorenni",
  "employee.impatriatiChildren.hint":
    "La parte non tassata sale {article, select, lo {allo } l {all’} other {al }}{rate}.",
  "employee.madre.label": "Esonero contributivo per madri lavoratrici",
  "employee.madre.hint": "Contributi INPS ridotti per le madri con più figli, se hai i requisiti.",
  "employee.madreChildren.label": "Numero di figli",
  "employee.madreAge.label": "Età del figlio più piccolo",
  "employee.madre.eligible": "Con questi dati l’esonero spetta, fino a {max} all’anno.",
  "employee.madre.notEnoughChildren": "L’esonero completo spetta con almeno {min} figli.",
  "employee.madre.childTooOld": "L’esonero finisce quando il figlio più piccolo compie {age} anni.",

  "employee.vouchers.label": "Buoni pasto, valore di un buono",
  "employee.vouchers.hint":
    "Nel {year} sono esenti fino a {electronic} al giorno se elettronici e fino a {paper} se cartacei.",
  "employee.voucherDays.label": "Buoni pasto al mese",
  "employee.voucherDays.hint": "Di solito uno per ogni giorno lavorato.",
  "employee.voucherType.legend": "Tipo di buoni pasto",
  "employee.voucherType.electronic": "Elettronici",
  "employee.voucherType.paper": "Cartacei",
  "employee.welfare.label": "Welfare aziendale all’anno",
  "employee.welfare.hint":
    "Esente fino a {general} ({children} con figli a carico): oltre la soglia è tassato tutto.",
  "employee.welfareChildren.label": "Hai figli a carico",
  "employee.welfareChildren.hint": "La soglia di esenzione sale a {amount}.",
  "employee.health.label": "Polizza sanitaria all’anno",
  "employee.health.hint": "Esente fino a {amount} all’anno.",
  "employee.car.label": "Auto aziendale, valore annuo",
  "employee.car.hint": "Il valore tassabile che ti comunica il datore di lavoro.",
  "employee.premio.label": "Premio di risultato",
  "employee.premio.hint":
    "Nel {year} è tassato {article, select, lo {allo } l {all’} other {al }}{rate} invece che con l’IRPEF, fino a {max}, se hai i requisiti.",

  "employee.bracket.title": "Scaglione IRPEF",
  "employee.bracket.range": "da {min} a {max}",
  "employee.bracket.upTo": "fino a {max}",
  "employee.bracket.above": "oltre {min}",
  "employee.bracket.first":
    "{subject, select, impatriati {La parte tassata del tuo reddito} other {Il tuo reddito imponibile}}, {income}, è nel primo scaglione, {article, select, lo {allo } l {all’} other {al }}{rate}. Mancano {distance} allo scaglione successivo.",
  "employee.bracket.middle":
    "{subject, select, impatriati {La parte tassata del tuo reddito} other {Il tuo reddito imponibile}}, {income}, arriva nello scaglione {article, select, lo {dello } l {dell’} other {del }}{rate}, che vale solo per la parte sopra {min}. Mancano {distance} allo scaglione successivo.",
  "employee.bracket.top":
    "{subject, select, impatriati {La parte tassata del tuo reddito} other {Il tuo reddito imponibile}}, {income}, arriva nello scaglione più alto, {article, select, lo {allo } l {all’} other {al }}{rate}, che vale solo per la parte sopra {min}.",
  "employee.raise.title": "Se il lordo aumenta di {amount}",
  "employee.raise.unit": "netti all’anno",
  "employee.raise.gain":
    "Cioè {monthly} in più al mese, su {count} mensilità. Di ogni euro lordo in più ti {cents, plural, one {resta # centesimo} other {restano # centesimi}}{taper, select, detrazioni {: oltre a contributi e IRPEF {article, select, lo {allo } l {all’} other {al }}{rate}, a questo reddito le detrazioni iniziano a calare} crediti {: oltre a contributi e IRPEF {article, select, lo {allo } l {all’} other {al }}{rate}, a questo reddito calano i crediti in busta paga} other {}}.",
  "employee.raise.loss":
    "Cioè {monthly} in meno al mese: con questo aumento superi una soglia e perdi parte dei crediti o delle detrazioni.",
  "employee.raise.note":
    "Aliquota marginale {rate}, cioè la parte di ogni euro lordo in più che va in trattenute.",
  "employee.years.title": "Stesso lordo, altri anni",
  "employee.years.caption": "Netto annuo con {gross} lordi, per anno fiscale",
  "employee.years.column.year": "Anno",
  "employee.years.column.net": "Netto annuo",
  "employee.years.column.delta": "Rispetto al {year}",
  "employee.years.selected": "anno scelto",
  "employee.years.same": "uguale",
  "employee.years.bracketChange":
    "Nel {year} l’aliquota da {min} a {max} è {direction, select, down {scesa} other {salita}} {fromArticle, select, lo {dallo } l {dall’} other {dal }}{from} {toArticle, select, lo {allo } l {all’} other {al }}{to}.",

  "employee.topics.title": "Per capire il calcolo",
  "employee.topic.steps": "Dal lordo al netto: i passaggi",
  "employee.topic.steps.body":
    "Dal lordo annuo si tolgono i contributi a tuo carico, versati all’Istituto nazionale della previdenza sociale (INPS). Sul reddito imponibile che resta si calcola l’imposta sul reddito delle persone fisiche (IRPEF) a scaglioni e si sottraggono le detrazioni che ti spettano. Poi si tolgono le addizionali regionale e comunale e si aggiungono i crediti in busta paga, se ti spettano.",
  "employee.topic.steps.link": "Leggi come calcoliamo il netto",
  "employee.topic.brackets": "Scaglioni IRPEF dal {first} al {last}",
  "employee.topic.brackets.body":
    "Nel 2026: 23% fino a 28.000 €, 33% da 28.000 a 50.000 €, 43% oltre. Nel 2024 e nel 2025 lo scaglione intermedio era al 35%. Ogni aliquota vale solo per la parte di reddito che cade nel suo scaglione.",
  "employee.topic.wedge": "Taglio del cuneo fiscale",
  "employee.topic.wedge.body":
    "Il cuneo fiscale è la distanza tra quanto costi all’azienda e quanto ricevi in busta paga. Il taglio funziona in due modi: una somma aggiuntiva in busta paga fino a 20.000 € di reddito e una detrazione aggiuntiva fino a 1.000 € tra 20.000 e 40.000 €. Nel 2024 al loro posto c’era uno sconto sui contributi INPS.",
  "employee.topic.surcharges": "Addizionali di regione e comune",
  "employee.topic.surcharges.body":
    "Regione e comune di residenza aggiungono ciascuno un’imposta all’IRPEF, calcolata sul tuo reddito imponibile con aliquote diverse da un posto all’altro. Usiamo le aliquote pubblicate dal Dipartimento delle Finanze per ogni regione e per ogni comune.",
  "employee.topic.payslip": "Differenze con la busta paga",
  "employee.topic.payslip.body":
    "Il calcolo usa le regole generali: indennità del tuo contratto collettivo, straordinari, premi o trattenute particolari cambiano il netto. Conta anche il mese, perché tredicesima e conguaglio di fine anno sono tassati in modo diverso.",
} as const;

export type MessageKey = keyof typeof it;

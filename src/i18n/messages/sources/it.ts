export const it = {
  "sources.title": "Fonti e dati",
  "sources.lede":
    "Ogni aliquota e ogni soglia usata nei calcoli, con il documento ufficiale da cui viene e la data in cui l’abbiamo controllata l’ultima volta.",
  "sources.meta":
    "{total, plural, one {# parametro} other {# parametri}} per il {year}, {verified, plural, one {# già verificato} other {# già verificati}}. Ultimo controllo: {date}.",

  "sources.toc": "In questa pagina",

  "sources.todo.title": "Da verificare",
  "sources.todo.lede":
    "Questi valori non sono ancora confermati dalla fonte ufficiale: li usiamo come sono e li segnaliamo qui finché non lo sono.",
  "sources.todo.others.title": "{count, plural, one {Un altro valore} other {Altri # valori}}",
  "sources.todo.others.body":
    "{count, plural, one {Non è ancora stato ricontrollato sul documento ufficiale: è segnato} other {Non sono ancora stati ricontrollati sul documento ufficiale: sono segnati}} «Da verificare» nelle tabelle qui sotto.",
  "sources.todo.show": "Mostra l’elenco",
  "sources.todo.hide": "Nascondi l’elenco",
  "sources.todo.years": "{years}:",

  "sources.question.taxWedgeCut.title": "Trattamento integrativo tra {from} e {to}",
  "sources.question.taxWedgeCut.body":
    "Non è scritto in modo esplicito se la detrazione aggiuntiva del taglio del cuneo fiscale conta tra le detrazioni che danno diritto al trattamento integrativo: il calcolo la conta.",
  "sources.question.pdr.title": "Premio di risultato nel {year}",
  "sources.question.pdr.body":
    "Il calcolo usa l’imposta sostitutiva {rate} fino a {amount}: il valore non è ancora stato ricontrollato sul testo della legge.",
  "sources.question.employer.title": "Contributi a carico del datore di lavoro",
  "sources.question.employer.body":
    "Per queste aliquote non è ancora indicata una fonte. Il calcolo considera il contributo {contribution} sul trattamento di fine rapporto (TFR) già compreso {employerRate} di contributi dell’azienda, ma nessuna circolare INPS lo dice in chiaro. Riguarda solo il costo del lavoro.",
  "sources.question.naspi.title": "Settimane per mese nella NASpI",
  "sources.question.naspi.body":
    "Il calcolo usa {weeks} settimane diviso {months} mesi, cioè {coefficient}; la legge dice «moltiplicata per il numero {legal}».",

  "sources.parameters.title": "Tutti i parametri",
  "sources.parameters.hint":
    "Valori in vigore nel {year}. Ogni riga porta al documento ufficiale da cui viene il valore, quando è pubblicato in rete.",
  "sources.parameters.caption":
    "Parametri usati nei calcoli del {year}, con fonte, data del controllo e stato",
  "sources.data.title": "Dati e contratti collettivi",
  "sources.data.hint":
    "Le tabelle che il calcolo legge per intero: l’indice dei prezzi dell’Istituto nazionale di statistica (ISTAT), le addizionali dei comuni, il preavviso e le mensilità dei contratti collettivi nazionali di lavoro (CCNL).",
  "sources.data.caption":
    "Serie di dati e contratti collettivi usati nei calcoli, con fonte, data del controllo e stato",
  "sources.previous.title": "Anni precedenti",
  "sources.previous.hint":
    "Il calcolo copre anche {years}. Qui trovi solo i valori che in quegli anni erano diversi da quelli del {latest}.",
  "sources.previous.show":
    "Mostra i valori del {year} ({count, plural, one {# parametro} other {# parametri}})",
  "sources.previous.hide": "Nascondi i valori del {year}",
  "sources.previous.caption":
    "Parametri del {year} diversi da quelli del {latest}, con fonte, data del controllo e stato",

  "sources.column.parameter": "Parametro",
  "sources.column.data": "Dati",
  "sources.column.value": "Valore",
  "sources.column.years": "Anni",
  "sources.column.source": "Fonte",
  "sources.column.checked": "Controllato il",
  "sources.check.inline": "controllato il",
  "sources.check.missing": "non ancora",
  "sources.check.retrieved": "scaricato il {date}",
  "sources.status.todo": "Da verificare",
  "sources.status.provisional": "Provvisorio",
  "sources.source.none": "Nessuna fonte indicata",

  "sources.value.upTo": "fino a {amount}",
  "sources.value.notInForce": "non in vigore",
  "sources.value.perDay": "{amount} al giorno",
  "sources.value.perMonth": "{amount} al mese",
  "sources.value.perYear": "{amount} all’anno",
  "sources.value.km": "{km} km",
  "sources.value.divided": "retribuzione ÷ {divisor}",
  "sources.value.revaluation": "{fixed} + {share} dell’inflazione",
  "sources.value.rateUpTo": "{rate} fino a {amount}",
  "sources.value.weeks": "{weeks, plural, one {# settimana} other {# settimane}}",

  "sources.group.irpef": "Imposta sul reddito (IRPEF)",
  "sources.group.inpsEmployee": "Contributi INPS dei dipendenti",
  "sources.group.deductions": "Detrazioni e oneri deducibili",
  "sources.group.regional": "Addizionali regionali",
  "sources.group.benefits": "Premi e benefit",
  "sources.group.special": "Agevolazioni",
  "sources.group.employer": "Costo del lavoro e TFR",
  "sources.group.selfEmployed": "Partita IVA e contributi degli autonomi",
  "sources.group.naspi": "Indennità di disoccupazione (NASpI)",
  "sources.group.data": "Serie di dati",
  "sources.group.contracts": "Contratti collettivi nazionali (CCNL)",

  "sources.name.irpef.brackets": "Scaglioni IRPEF",
  "sources.name.irpef.workDeduction": "Detrazione per lavoro dipendente",
  "sources.name.irpef.trattamentoIntegrativo": "Trattamento integrativo",
  "sources.name.irpef.taxWedgeCut": "Taglio del cuneo fiscale",
  "sources.name.inps.firstBand": "Prima fascia di retribuzione",
  "sources.name.inps.massimale": "Massimale contributivo, per chi è iscritto dal 1996",
  "sources.name.inps.aboveFirstBandSurcharge": "Punto in più oltre la prima fascia",
  "sources.name.inps.employee.rate": "Aliquota a carico del lavoratore",
  "sources.name.inps.employee.rateAboveFirstBand": "Aliquota oltre la prima fascia",
  "sources.name.inps.employee.apprenticeRate": "Aliquota degli apprendisti",
  "sources.name.inps.employee.cigsRate":
    "Contributo per la cassa integrazione straordinaria, grandi aziende industriali",
  "sources.name.inps.employee.publicRate": "Aliquota dei dipendenti pubblici",
  "sources.name.inps.employee.publicRateAboveFirstBand":
    "Aliquota dei dipendenti pubblici oltre la prima fascia",
  "sources.name.inps.employee.exemption2024": "Esonero contributivo del 2024",
  "sources.name.inps.autonomi.minimale":
    "Reddito minimo per i contributi di artigiani e commercianti",
  "sources.name.inps.artigiani.rate": "Aliquota degli artigiani",
  "sources.name.inps.artigiani.rateAboveFirstBand":
    "Aliquota degli artigiani oltre la prima fascia",
  "sources.name.inps.commercianti.rate": "Aliquota dei commercianti",
  "sources.name.inps.commercianti.rateAboveFirstBand":
    "Aliquota dei commercianti oltre la prima fascia",
  "sources.name.inps.autonomi.maternity": "Contributo di maternità di artigiani e commercianti",
  "sources.name.inps.autonomi.forfettarioReduction":
    "Riduzione dei contributi nel regime forfettario",
  "sources.name.inps.autonomi.newRegistrantReduction":
    "Riduzione dei contributi per chi si iscrive per la prima volta",
  "sources.name.inps.gestioneSeparata.rates": "Aliquote della Gestione separata",
  "sources.name.inps.gestioneSeparata.minimale": "Reddito minimo della Gestione separata",
  "sources.name.inps.artigiani.minimumContribution": "Contributo minimo degli artigiani",
  "sources.name.inps.commercianti.minimumContribution": "Contributo minimo dei commercianti",
  "sources.name.inps.autonomi.massimaleAnte1996": "Massimale per chi ha contributi prima del 1996",
  "sources.name.deductions.spouse": "Detrazione per il coniuge a carico",
  "sources.name.deductions.children": "Detrazione per ogni figlio a carico dai 21 anni",
  "sources.name.deductions.otherFamily": "Detrazione per altri familiari a carico",
  "sources.name.deductions.dependentIncomeLimit": "Limiti di reddito per essere a carico",
  "sources.name.deductions.expenses": "Detrazioni per spese",
  "sources.name.deductions.pensionFund": "Contributi alla previdenza complementare deducibili",
  "sources.name.deductions.expensePhaseOut": "Detrazioni per spese ridotte con un reddito tra",
  "sources.name.deductions.expenseCap": "Tetto alle detrazioni per spese",
  "sources.name.deductions.expenseReduction": "Taglio delle detrazioni per spese sui redditi alti",
  "sources.name.fringe.mealVouchers.electronic": "Buoni pasto elettronici esenti",
  "sources.name.fringe.mealVouchers.paper": "Buoni pasto cartacei esenti",
  "sources.name.fringe.healthInsurance": "Contributi esenti per l’assistenza sanitaria integrativa",
  "sources.name.fringe.welfare": "Soglie dei fringe benefit esenti",
  "sources.name.fringe.companyCar.co2":
    "Auto aziendale, quota tassata secondo le emissioni (contratti fino al 2024)",
  "sources.name.fringe.companyCar.powertrain":
    "Auto aziendale, quota tassata secondo l’alimentazione (contratti dal 2025)",
  "sources.name.fringe.companyCar.conventionalKm": "Percorrenza convenzionale dell’auto aziendale",
  "sources.name.employer.inps": "Contributi INPS a carico del datore di lavoro",
  "sources.name.employer.otherCosts": "Altri contributi a carico del datore di lavoro",
  "sources.name.tfr": "Trattamento di fine rapporto (TFR)",
  "sources.name.madreLavoratrice": "Esonero contributivo per le madri lavoratrici",
  "sources.name.madreLavoratrice.maxMonthlyExemption": "Esonero per le madri lavoratrici, al mese",
  "sources.name.impatriati": "Regime per i lavoratori impatriati",
  "sources.name.pdr": "Imposta sostitutiva sul premio di risultato",
  "sources.name.forfettario.taxRates": "Imposta sostitutiva del regime forfettario",
  "sources.name.forfettario.limits": "Limiti del regime forfettario",
  "sources.name.forfettario.coefficients": "Coefficiente di redditività, secondo l’attività",
  "sources.name.forfettario.concurrentEmployeeIncomeLimit":
    "Reddito da lavoro dipendente compatibile con il regime forfettario",
  "sources.name.naspi.soglia": "Soglia della retribuzione mensile",
  "sources.name.naspi.massimale": "Importo massimo mensile",
  "sources.name.naspi.rules": "Regole di calcolo della NASpI",
  "sources.name.regional": "Addizionale regionale, {region}",

  "sources.part.bracket.first": "Aliquota fino a {max}",
  "sources.part.bracket.middle": "Aliquota da {min} a {max}",
  "sources.part.bracket.last": "Aliquota oltre {min}",
  "sources.part.workDeduction.base": "Detrazione per lavoro dipendente con reddito fino a {limit}",
  "sources.part.workDeduction.end": "Reddito oltre il quale la detrazione si azzera",
  "sources.part.taxWedgeCut.somma":
    "Somma aggiuntiva del taglio del cuneo fiscale, reddito fino a {limit}",
  "sources.part.taxWedgeCut.detrazione":
    "Detrazione aggiuntiva del taglio del cuneo fiscale, reddito fino a {limit}",
  "sources.part.exemption2024.bracket":
    "Esonero contributivo del 2024, retribuzione fino a {limit} al mese",
  "sources.part.gestioneSeparata.full": "Gestione separata, aliquota piena",
  "sources.part.gestioneSeparata.reduced":
    "Gestione separata, aliquota ridotta per chi ha già un’altra copertura",
  "sources.part.dependentIncomeLimit.general": "Limite di reddito per essere a carico",
  "sources.part.dependentIncomeLimit.young": "Limite di reddito per i figli fino a 24 anni",
  "sources.part.expenses.rate": "Detrazione sulle spese sanitarie e sulle altre spese",
  "sources.part.expenses.medicalRate": "Detrazione sulle spese sanitarie",
  "sources.part.expenses.standardRate": "Detrazione sulle altre spese",
  "sources.part.expenses.medicalFloor": "Franchigia sulle spese sanitarie",
  "sources.part.expenses.mortgage": "Interessi del mutuo detraibili",
  "sources.part.expenseCap.bands": "Tetto alle detrazioni per spese, reddito oltre {limit}",
  "sources.part.expenseReduction.amount":
    "Taglio delle detrazioni per spese, reddito oltre {limit}",
  "sources.part.welfare.general": "Soglia dei fringe benefit esenti",
  "sources.part.welfare.children": "Soglia dei fringe benefit esenti, con figli a carico",
  "sources.part.powertrain.bev": "Auto aziendale elettrica, quota tassata",
  "sources.part.powertrain.phev": "Auto aziendale ibrida ricaricabile, quota tassata",
  "sources.part.powertrain.other": "Altre auto aziendali, quota tassata",
  "sources.part.employerInps.rate": "Contributi INPS a carico del datore di lavoro",
  "sources.part.employerInps.apprentice":
    "Contributi INPS del datore di lavoro per gli apprendisti",
  "sources.part.otherCosts.inail": "Assicurazione contro gli infortuni sul lavoro (INAIL)",
  "sources.part.otherCosts.maternity": "Contributo di maternità",
  "sources.part.otherCosts.naspi": "Contributo per la NASpI",
  "sources.part.otherCosts.naspiFixedTerm":
    "Contributo aggiuntivo per la NASpI, contratti a termine",
  "sources.part.otherCosts.cig": "Contributo per la cassa integrazione",
  "sources.part.otherCosts.other": "Altri contributi minori",
  "sources.part.tfr.accrual": "Quota annua del TFR",
  "sources.part.tfr.revaluation": "Rivalutazione annua del TFR",
  "sources.part.tfr.tax": "Imposta sulla rivalutazione del TFR",
  "sources.part.tfr.contribution": "Contributo pensionistico recuperato sul TFR",
  "sources.part.impatriati.standard": "Regime impatriati, parte del reddito esente",
  "sources.part.impatriati.children": "Regime impatriati con figli minorenni, parte esente",
  "sources.part.forfettario.standard": "Imposta sostitutiva del regime forfettario",
  "sources.part.forfettario.startup": "Imposta sostitutiva nei primi {years} anni di attività",
  "sources.part.forfettario.revenue": "Fatturato annuo massimo nel regime forfettario",
  "sources.part.forfettario.employeeCosts": "Spese massime per lavoro dipendente",
  "sources.part.naspi.base": "Indennità sulla retribuzione fino alla soglia",
  "sources.part.naspi.marginal": "Indennità sulla parte oltre la soglia",
  "sources.part.naspi.decalage": "Riduzione ogni mese, dal {month}° mese",
  "sources.part.naspi.weeksPerMonth": "Settimane per mese nella retribuzione di riferimento",
  "sources.part.naspi.minWeeks": "Contributi minimi negli ultimi {years} anni",
  "sources.part.naspi.maxDuration": "Durata massima",

  "sources.dataset.foi": "Indice dei prezzi al consumo per le famiglie di operai e impiegati (FOI)",
  "sources.dataset.foi.value": "base {base} = 100",
  "sources.dataset.comuni": "Addizionale comunale di ogni comune",
  "sources.dataset.comuni.value": "{count} comuni",
  "sources.dataset.ccnl.preavviso": "Preavviso di dimissioni, CCNL {contract}",
  "sources.dataset.ccnl.preavviso.value": "giorni per livello e anzianità",
  "sources.dataset.ccnl.mensilita": "Mensilità, CCNL {contract}",
  "sources.dataset.ccnl.mensilita.value": "{count} mensilità",
} as const;

export type MessageKey = keyof typeof it;

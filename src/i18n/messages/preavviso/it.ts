export const it = {
  "preavviso.faq.title": "Per capire il preavviso",
  "preavviso.faq.obbligatorio.q": "Sono obbligato a dare il preavviso?",
  "preavviso.faq.obbligatorio.a":
    "Sì, salvo dimissioni per giusta causa (Art. 2119 c.c., per esempio mancato pagamento dello stipendio o molestie) o in periodo di prova. I giorni dipendono dal CCNL, dal livello e dall’anzianità di servizio.",
  "preavviso.faq.mancato.q": "Cosa succede se non lo do?",
  "preavviso.faq.mancato.a":
    "Il datore di lavoro può trattenere un’indennità sostitutiva del preavviso pari alla retribuzione che avresti percepito durante quei giorni. Viene scalata dal TFR e dalle competenze finali.",
  "preavviso.faq.calendarOrWork.q": "I giorni di preavviso sono calendariali o lavorativi?",
  "preavviso.faq.calendarOrWork.a":
    "Di default sono calendariali: si contano sabato, domenica e festivi. Alcuni CCNL prevedono giorni lavorativi per specifici livelli (il calcolatore segnala questo caso quando è applicabile).",
  "preavviso.faq.ferie.q": "Le ferie residue contano nel preavviso?",
  "preavviso.faq.ferie.a":
    "No. Le ferie godute durante il preavviso non ne sospendono il decorso. Le ferie residue non godute vengono liquidate nella busta paga finale e non accorciano i giorni di preavviso.",
  "preavviso.faq.malattia.q": "Posso dimettermi durante la malattia?",
  "preavviso.faq.malattia.a":
    "Sì, la malattia non impedisce di dimettersi. Quasi tutti i CCNL sospendono il decorso del preavviso finché dura la malattia e lo fanno riprendere alla guarigione: controlla il tuo contratto, perché il calcolatore non tiene conto delle assenze.",
  "preavviso.faq.prova.q": "Cosa cambia durante il periodo di prova?",
  "preavviso.faq.prova.a":
    "Durante il periodo di prova entrambe le parti possono recedere senza preavviso e senza dover motivare la decisione (Art. 2096 c.c.). Il calcolatore considera questo come un caso a sé.",
  "preavviso.title": "Preavviso di dimissioni",
  "preavviso.lede":
    "Quanti giorni di preavviso devi dare e qual è il tuo ultimo giorno di lavoro, in base al CCNL, al livello e all’anzianità di servizio.",
  "preavviso.form.ccnl": "CCNL applicato",
  "preavviso.form.livello": "Livello di inquadramento",
  "preavviso.form.hireDate": "Data di assunzione",
  "preavviso.form.hireDate.hint": "Il primo giorno di lavoro con il contratto attuale.",
  "preavviso.form.resignationDate": "Data di comunicazione delle dimissioni",
  "preavviso.form.resignationDate.hint": "Il giorno in cui comunichi le dimissioni, oggi di norma.",
  "preavviso.form.error.invalidDates":
    "La data delle dimissioni deve essere successiva all’assunzione.",
  "preavviso.form.ccnl.error": "Scegli un CCNL valido.",
  "preavviso.form.livello.error": "Scegli un livello valido per il CCNL selezionato.",
  "preavviso.result.noticeDays": "Giorni di preavviso",
  "preavviso.result.fix": "Correggi le date per calcolare il preavviso.",
  "preavviso.result.exitDate": "Ultimo giorno di lavoro: {date}",
  "preavviso.result.band": "Anzianità {band}, livello {livello}",
  "preavviso.result.band.lt-5y": "meno di 5 anni",
  "preavviso.result.band.5-10y": "da 5 a 10 anni",
  "preavviso.result.band.gt-10y": "più di 10 anni",
  "preavviso.result.band.lte-3y": "fino a 3 anni",
  "preavviso.result.band.gt-3y": "più di 3 anni",
  "preavviso.result.workingDays.note":
    "I giorni indicati sono giorni lavorativi (esclusi sabato e domenica).",
  "preavviso.result.calendarDays.note": "I giorni indicati sono giorni di calendario.",
  "preavviso.result.source": "Fonte: {ref}.",
  "preavviso.days": "{count, plural, one {# giorno} other {# giorni}}",
  "preavviso.assumptions.ccnl": "{ccnl}, {livello}",
  "preavviso.assumptions.dates": "Assunzione il {hire}, dimissioni comunicate il {resignation}",
  "preavviso.assumptions.change.ccnl": "il CCNL e il livello",
  "preavviso.assumptions.change.dates": "le date",
  "preavviso.table.title": "Giorni di preavviso per livello e anzianità",
  "preavviso.table.caption":
    "Giorni di preavviso previsti dal CCNL selezionato, per livello e fascia di anzianità",
  "preavviso.table.livello": "Livello",
  "preavviso.table.workingDaysSuffix": ", giorni lavorativi",
} as const;

export type MessageKey = keyof typeof it;

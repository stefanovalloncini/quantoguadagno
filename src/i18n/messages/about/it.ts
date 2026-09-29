export const it = {
  "about.title": "Informazioni",
  "about.lede":
    "Quanto guadagno stima lo stipendio netto e altre cifre del lavoro in Italia. È gratuito, non chiede un account e non raccoglie dati su di te.",
  "about.toc": "In questa pagina",

  "about.what.title": "Cosa calcola",
  "about.what.body":
    "Parte dal lordo e segue la busta paga: contributi INPS, imposta sul reddito (IRPEF), detrazioni, addizionali regionale e comunale, crediti. Ci sono anche calcolatori per tredicesima, trattamento di fine rapporto (TFR), NASpI, preavviso di dimissioni, costo del lavoro, regime forfettario e inflazione. Le regole coprono {years}.",
  "about.what.link": "Leggi come calcoliamo il netto",

  "about.limits.title": "Cosa non è",
  "about.limits.estimate":
    "È una stima: la busta paga resta il riferimento. Il calcolo non conosce il tuo contratto collettivo, i tuoi altri redditi né il conguaglio di fine anno.",
  "about.limits.advice":
    "Non è una consulenza fiscale. Per una decisione importante chiedi a un consulente del lavoro, a un commercialista o a un centro di assistenza fiscale (CAF).",

  "about.data.title": "Da dove vengono i dati",
  "about.data.body":
    "Aliquote e soglie vengono da leggi, circolari INPS e dati pubblici del Dipartimento delle Finanze e dell’Istituto nazionale di statistica (ISTAT). Ogni valore ha la sua fonte e la data dell’ultimo controllo: dei {total} parametri usati per il {year}, {verified} sono verificati e {toVerify} sono ancora da verificare.",
  "about.data.link": "Vedi fonti e dati",

  "about.privacy.title": "I tuoi dati",
  "about.privacy.calculation":
    "Lo stipendio e gli altri valori che inserisci restano nel tuo browser: i calcoli avvengono lì. Il sito non imposta cookie e non usa strumenti di statistica.",
  "about.privacy.storage":
    "Il browser ricorda solo il tema e la lingua che scegli e, se lo usi, lo storico stipendi. Puoi cancellarli dalle impostazioni del browser.",
  "about.privacy.links":
    "Se condividi il link di un calcolo, i valori principali sono scritti nell’indirizzo: chi lo apre li vede.",

  "about.code.title": "Codice aperto",
  "about.code.body":
    "Il codice è pubblico, con licenza MIT: puoi leggerlo, controllare ogni calcolo e segnalare un errore.",
  "about.code.link": "Leggi il codice su GitHub",
} as const;

export type MessageKey = keyof typeof it;

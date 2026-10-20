export const it = {
  "apprenticeship.title": "Progressione apprendistato",
  "apprenticeship.lede":
    "La retribuzione dell’apprendista cresce per percentuali del livello di destinazione, anno dopo anno.",
  "apprenticeship.form.target": "Retribuzione di destinazione (RAL)",
  "apprenticeship.form.target.hint":
    "Lo stipendio annuo lordo del livello finale, dopo l’apprendistato.",
  "apprenticeship.form.years": "Durata in anni",
  "apprenticeship.form.years.hint": "Tipicamente 3 anni; alcuni CCNL prevedono fino a 5.",
  "apprenticeship.form.region": "Regione per la stima del netto",
  "apprenticeship.form.region.hint":
    "Cambia la regione per aggiornare la stima; l’addizionale comunale resta fissa allo 0,80%.",
  "apprenticeship.col.year": "Anno",
  "apprenticeship.col.percent": "% della destinazione",
  "apprenticeship.col.gross": "Lordo annuo",
  "apprenticeship.col.net": "Netto mensile (stima)",
  "apprenticeship.schedule.title": "Anno per anno",
  "apprenticeship.schedule.caption": "Progressione della retribuzione per anno di apprendistato",
  "apprenticeship.result.label": "Netto mensile al primo anno",
  "apprenticeship.result.firstYear": "Netto mensile al primo anno",
  "apprenticeship.result.sub": "All’anno {year} arrivi a circa {amount} al mese",
  "apprenticeship.result.empty": "Scrivi la retribuzione di destinazione per vedere la stima.",
  "apprenticeship.result.fix": "Correggi i valori per vedere la stima.",
  "apprenticeship.result.staleTarget":
    "Ultima stima valida per {amount} lordi l’anno: correggi la retribuzione di destinazione.",
  "apprenticeship.result.staleYears": "Correggi la durata per aggiornare la stima.",
  "apprenticeship.result.announce": "Circa {amount} netti al mese nel primo anno.",
  "apprenticeship.row.link": "Calcola il netto",
  "apprenticeship.row.openLink": "Calcola il netto dell’anno {year}",
  "apprenticeship.assumptions.fixed":
    "Contratto di apprendistato, addizionale comunale {rate}, {count} mensilità",
  "apprenticeship.result.estimate":
    "la busta paga resta il riferimento. Addizionale comunale e mensilità si cambiano nel calcolatore: apri un anno dalla tabella.",
  "apprenticeship.result.verified": "Dati controllati il {date}",
  "apprenticeship.result.trust":
    "{checked}{pending, select, yes {: {count, plural, one {un valore usato in questo calcolo è ancora da verificare} other {# valori usati in questo calcolo sono ancora da verificare}}} other {}}.",
} as const;

export type MessageKey = keyof typeof it;

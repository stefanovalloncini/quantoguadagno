export const IDS = {
  form: "aggiungi",
  formHeading: "aggiungi-titolo",
  year: "anno",
  gross: "ral",
  note: "nota",
  netGroup: "gruppo-netto",
  contract: "contratto",
  frequency: "mensilita",
  region: "regione",
  municipal: "aliquota-comunale",
  largeCompany: "azienda-grande",
  familyGroup: "gruppo-familiari",
  spouse: "coniuge",
  children: "figli",
  others: "altri-familiari",
  submit: "aggiungi-anno",
  result: "risultato",
  resultHeading: "risultato-titolo",
  entriesHeading: "anni-titolo",
  clear: "rimuovi-tutti",
  clearQuestion: "rimuovi-tutti-domanda",
  trendHeading: "andamento-titolo",
  projectionHeading: "proiezione-titolo",
  growth: "crescita",
  horizon: "orizzonte",
  projectionTable: "tabella-proiezione",
} as const;

export function removeButtonId(entryId: string): string {
  return `rimuovi-${entryId}`;
}

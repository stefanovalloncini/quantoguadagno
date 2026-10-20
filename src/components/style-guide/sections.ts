export const SECTIONS = [
  { id: "colori", title: "Colori" },
  { id: "tipografia", title: "Tipografia" },
  { id: "spazi", title: "Spazi e misure" },
  { id: "griglia", title: "Griglia e punti di rottura" },
  { id: "intestazione", title: "Intestazione, menu e piè di pagina" },
  { id: "testo", title: "Testo lungo" },
  { id: "tabelle", title: "Tabelle" },
  { id: "pulsanti", title: "Pulsanti e link" },
  { id: "avvisi", title: "Avvisi" },
  { id: "stati", title: "Stato dei valori" },
  { id: "controlli", title: "Scelte in linea" },
  { id: "campi", title: "Campi del modulo" },
  { id: "comune", title: "Ricerca del comune" },
  { id: "risultato", title: "Risultato e dettaglio" },
  { id: "esito", title: "Esito senza cifra" },
  { id: "grafici", title: "Grafici" },
  { id: "confronto", title: "Confronto tra offerte" },
  { id: "cedolino", title: "Busta paga da stampare" },
  { id: "lordo-netto", title: "Tabella lordo netto" },
  { id: "icone", title: "Icone" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export function sectionTitle(id: SectionId): string {
  const section = SECTIONS.find((candidate) => candidate.id === id);
  if (!section) throw new Error(`Unknown style guide section ${id}`);
  return section.title;
}

export type RegionCode =
  | "piemonte"
  | "valle-daosta"
  | "lombardia"
  | "bolzano"
  | "trento"
  | "veneto"
  | "friuli-venezia-giulia"
  | "liguria"
  | "emilia-romagna"
  | "toscana"
  | "umbria"
  | "marche"
  | "lazio"
  | "abruzzo"
  | "molise"
  | "campania"
  | "puglia"
  | "basilicata"
  | "calabria"
  | "sicilia"
  | "sardegna";

export interface RegionInfo {
  readonly name: string;
  readonly mefCode: string;
}

export const REGION_INFO: Readonly<Record<RegionCode, RegionInfo>> = {
  piemonte: { name: "Piemonte", mefCode: "13" },
  "valle-daosta": { name: "Valle d'Aosta", mefCode: "20" },
  lombardia: { name: "Lombardia", mefCode: "10" },
  bolzano: { name: "Provincia Autonoma di Bolzano", mefCode: "03" },
  trento: { name: "Provincia Autonoma di Trento", mefCode: "18" },
  veneto: { name: "Veneto", mefCode: "21" },
  "friuli-venezia-giulia": { name: "Friuli-Venezia Giulia", mefCode: "07" },
  liguria: { name: "Liguria", mefCode: "09" },
  "emilia-romagna": { name: "Emilia-Romagna", mefCode: "06" },
  toscana: { name: "Toscana", mefCode: "17" },
  umbria: { name: "Umbria", mefCode: "19" },
  marche: { name: "Marche", mefCode: "11" },
  lazio: { name: "Lazio", mefCode: "08" },
  abruzzo: { name: "Abruzzo", mefCode: "01" },
  molise: { name: "Molise", mefCode: "12" },
  campania: { name: "Campania", mefCode: "05" },
  puglia: { name: "Puglia", mefCode: "14" },
  basilicata: { name: "Basilicata", mefCode: "02" },
  calabria: { name: "Calabria", mefCode: "04" },
  sicilia: { name: "Sicilia", mefCode: "16" },
  sardegna: { name: "Sardegna", mefCode: "15" },
};

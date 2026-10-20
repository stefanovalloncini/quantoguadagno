import type { RegionCode } from "./regionInfo.ts";

export interface Capoluogo {
  readonly id: string;
  readonly name: string;
}

// The capoluogo of each region and autonomous province, by codice catastale in the
// Dipartimento delle Finanze dataset of src/data/comuni, with the name as that dataset spells it.
export const CAPOLUOGHI: Readonly<Record<RegionCode, Capoluogo>> = {
  piemonte: { id: "L219", name: "Torino" },
  "valle-daosta": { id: "A326", name: "Aosta" },
  lombardia: { id: "F205", name: "Milano" },
  bolzano: { id: "A952", name: "Bolzano" },
  trento: { id: "L378", name: "Trento" },
  veneto: { id: "L736", name: "Venezia" },
  "friuli-venezia-giulia": { id: "L424", name: "Trieste" },
  liguria: { id: "D969", name: "Genova" },
  "emilia-romagna": { id: "A944", name: "Bologna" },
  toscana: { id: "D612", name: "Firenze" },
  umbria: { id: "G478", name: "Perugia" },
  marche: { id: "A271", name: "Ancona" },
  lazio: { id: "H501", name: "Roma" },
  abruzzo: { id: "A345", name: "L'Aquila" },
  molise: { id: "B519", name: "Campobasso" },
  campania: { id: "F839", name: "Napoli" },
  puglia: { id: "A662", name: "Bari" },
  basilicata: { id: "G942", name: "Potenza" },
  calabria: { id: "C352", name: "Catanzaro" },
  sicilia: { id: "G273", name: "Palermo" },
  sardegna: { id: "B354", name: "Cagliari" },
};

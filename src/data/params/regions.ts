import { revaluedYearly, verifiedInPhase0 } from "../define.ts";
import { REGION_INFO, type RegionCode } from "../regionInfo.ts";
import type { Bracket, Entry } from "../types.ts";

export type { RegionCode } from "../regionInfo.ts";

export type RegionalTaxBracket = Bracket;

// Comes off the tax the brackets produce, not off the taxable base, and never
// turns into a credit. Bolzano grants one; Trento deducts from the base instead,
// which is what exemptionThreshold models.
export interface RegionalTaxDeduction {
  readonly amount: number;
  readonly above?: number;
  readonly upTo?: number;
  readonly phaseInOver?: number;
}

export interface RegionalFlatRate {
  readonly upToIncome: number;
  readonly rate: number;
}

export interface RegionalTaxRules {
  readonly taxBrackets: readonly RegionalTaxBracket[];
  readonly exemptionThreshold?: number;
  readonly flatRate?: RegionalFlatRate;
  readonly taxDeductions?: readonly RegionalTaxDeduction[];
}

const MEF_REGIONAL_URL =
  "https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/addregirpef/addregirpef.php";

const CHILDREN_NOT_MODELLED = "Detrazioni per figli a carico non modellate";
const DISABILITY_NOT_MODELLED = "Aliquote ridotte per disabilità non modellate";

function mef<Y extends number>(
  region: RegionCode,
  year: Y,
  rules: RegionalTaxRules,
  ...notes: readonly string[]
): Entry<RegionalTaxRules, `${Y}-01-01`> {
  const { name, mefCode } = REGION_INFO[region];
  return {
    from: `${String(year)}-01-01` as `${Y}-01-01`,
    value: rules,
    source: verifiedInPhase0({
      ref: `Dipartimento delle Finanze, addizionale regionale all'IRPEF: ${name} ${String(year)}`,
      url: `${MEF_REGIONAL_URL}?reg=${mefCode}&anno=${String(year)}`,
      ...(notes.length > 0 ? { note: notes.join("; ") } : {}),
    }),
  };
}

const PIEMONTE_2024: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0162 },
    { min: 15_000, max: 28_000, rate: 0.0213 },
    { min: 28_000, max: 50_000, rate: 0.0275 },
    { min: 50_000, max: null, rate: 0.0333 },
  ],
};

const PIEMONTE_2026: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0162 },
    { min: 15_000, max: 28_000, rate: 0.0268 },
    { min: 28_000, max: 50_000, rate: 0.0331 },
    { min: 50_000, max: null, rate: 0.0333 },
  ],
};

const VALLE_DAOSTA: RegionalTaxRules = {
  taxBrackets: [{ min: 0, max: null, rate: 0.0123 }],
  exemptionThreshold: 15_000,
};

const LOMBARDIA: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0123 },
    { min: 15_000, max: 28_000, rate: 0.0158 },
    { min: 28_000, max: 50_000, rate: 0.0172 },
    { min: 50_000, max: null, rate: 0.0173 },
  ],
};

const BOLZANO_2024: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 50_000, rate: 0.0123 },
    { min: 50_000, max: null, rate: 0.0173 },
  ],
  taxDeductions: [{ amount: 430.5 }, { amount: 125, above: 50_000, phaseInOver: 25_000 }],
};

const BOLZANO_2025: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 50_000, rate: 0.0123 },
    { min: 50_000, max: null, rate: 0.0173 },
  ],
  taxDeductions: [
    { amount: 430.5, upTo: 90_000 },
    { amount: 125, above: 50_000, phaseInOver: 25_000 },
  ],
};

const TRENTO: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 50_000, rate: 0.0123 },
    { min: 50_000, max: null, rate: 0.0173 },
  ],
  exemptionThreshold: 30_000,
};

const VENETO: RegionalTaxRules = {
  taxBrackets: [{ min: 0, max: null, rate: 0.0123 }],
};

const FRIULI_VENEZIA_GIULIA: RegionalTaxRules = {
  taxBrackets: [{ min: 0, max: null, rate: 0.0123 }],
  flatRate: { upToIncome: 15_000, rate: 0.007 },
};

const LIGURIA: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 28_000, rate: 0.0123 },
    { min: 28_000, max: 50_000, rate: 0.0318 },
    { min: 50_000, max: null, rate: 0.0323 },
  ],
};

const EMILIA_ROMAGNA_2024: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0133 },
    { min: 15_000, max: 28_000, rate: 0.0193 },
    { min: 28_000, max: 50_000, rate: 0.0203 },
    { min: 50_000, max: null, rate: 0.0227 },
  ],
};

const EMILIA_ROMAGNA_2025: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0133 },
    { min: 15_000, max: 28_000, rate: 0.0193 },
    { min: 28_000, max: 50_000, rate: 0.0293 },
    { min: 50_000, max: null, rate: 0.0333 },
  ],
};

const EMILIA_ROMAGNA_2026: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0133 },
    { min: 15_000, max: 28_000, rate: 0.0193 },
    { min: 28_000, max: 50_000, rate: 0.0278 },
    { min: 50_000, max: null, rate: 0.0333 },
  ],
};

const TOSCANA: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0142 },
    { min: 15_000, max: 28_000, rate: 0.0143 },
    { min: 28_000, max: 50_000, rate: 0.0332 },
    { min: 50_000, max: null, rate: 0.0333 },
  ],
};

const UMBRIA_2024: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0123 },
    { min: 15_000, max: 28_000, rate: 0.0162 },
    { min: 28_000, max: 50_000, rate: 0.0167 },
    { min: 50_000, max: null, rate: 0.0183 },
  ],
};

const UMBRIA_2025: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0173 },
    { min: 15_000, max: 28_000, rate: 0.0302 },
    { min: 28_000, max: 50_000, rate: 0.0312 },
    { min: 50_000, max: null, rate: 0.0333 },
  ],
  flatRate: { upToIncome: 28_000, rate: 0.0123 },
  taxDeductions: [{ amount: 150, above: 28_000, upTo: 50_000 }],
};

const MARCHE: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0123 },
    { min: 15_000, max: 28_000, rate: 0.0153 },
    { min: 28_000, max: 50_000, rate: 0.017 },
    { min: 50_000, max: null, rate: 0.0173 },
  ],
};

const LAZIO_2024: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0173 },
    { min: 15_000, max: null, rate: 0.0333 },
  ],
  flatRate: { upToIncome: 28_000, rate: 0.0173 },
  taxDeductions: [{ amount: 60, above: 28_000, upTo: 35_000 }],
};

const LAZIO_2026: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0173 },
    { min: 15_000, max: null, rate: 0.0333 },
  ],
  flatRate: { upToIncome: 28_000, rate: 0.0173 },
  taxDeductions: [{ amount: 60, above: 28_000, upTo: 30_000 }],
};

const ABRUZZO_2024: RegionalTaxRules = {
  taxBrackets: [{ min: 0, max: null, rate: 0.0173 }],
};

const ABRUZZO_2025: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 28_000, rate: 0.0167 },
    { min: 28_000, max: 50_000, rate: 0.0287 },
    { min: 50_000, max: null, rate: 0.0333 },
  ],
};

const MOLISE: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0203 },
    { min: 15_000, max: 28_000, rate: 0.0223 },
    { min: 28_000, max: null, rate: 0.0363 },
  ],
};

const CAMPANIA: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0173 },
    { min: 15_000, max: 28_000, rate: 0.0296 },
    { min: 28_000, max: 50_000, rate: 0.032 },
    { min: 50_000, max: null, rate: 0.0333 },
  ],
};

const PUGLIA_2024: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0133 },
    { min: 15_000, max: 28_000, rate: 0.0143 },
    { min: 28_000, max: 50_000, rate: 0.0163 },
    { min: 50_000, max: null, rate: 0.0185 },
  ],
};

const PUGLIA_2026: RegionalTaxRules = {
  taxBrackets: [
    { min: 0, max: 15_000, rate: 0.0133 },
    { min: 15_000, max: 28_000, rate: 0.0213 },
    { min: 28_000, max: 50_000, rate: 0.0323 },
    { min: 50_000, max: null, rate: 0.0333 },
  ],
};

const BASILICATA: RegionalTaxRules = {
  taxBrackets: [{ min: 0, max: null, rate: 0.0123 }],
};

const CALABRIA: RegionalTaxRules = {
  taxBrackets: [{ min: 0, max: null, rate: 0.0173 }],
};

const SICILIA: RegionalTaxRules = {
  taxBrackets: [{ min: 0, max: null, rate: 0.0123 }],
};

const SARDEGNA: RegionalTaxRules = {
  taxBrackets: [{ min: 0, max: null, rate: 0.0123 }],
};

export const REGIONAL_PARAMS = {
  "regions.piemonte": revaluedYearly(
    mef("piemonte", 2024, PIEMONTE_2024, CHILDREN_NOT_MODELLED),
    mef("piemonte", 2025, PIEMONTE_2024, CHILDREN_NOT_MODELLED),
    mef("piemonte", 2026, PIEMONTE_2026, CHILDREN_NOT_MODELLED),
  ),
  "regions.valle-daosta": revaluedYearly(
    mef("valle-daosta", 2024, VALLE_DAOSTA),
    mef("valle-daosta", 2025, VALLE_DAOSTA),
    mef("valle-daosta", 2026, VALLE_DAOSTA, "L.R. 32/2022; art. 1 L.R. 23 dicembre 2025, n. 29"),
  ),
  "regions.lombardia": revaluedYearly(
    mef("lombardia", 2024, LOMBARDIA),
    mef("lombardia", 2025, LOMBARDIA),
    mef("lombardia", 2026, LOMBARDIA),
  ),
  "regions.bolzano": revaluedYearly(
    mef("bolzano", 2024, BOLZANO_2024, CHILDREN_NOT_MODELLED),
    mef("bolzano", 2025, BOLZANO_2025, CHILDREN_NOT_MODELLED),
    mef(
      "bolzano",
      2026,
      BOLZANO_2025,
      "Art. 21/sexiesdecies L.P. 11 agosto 1998, n. 9",
      CHILDREN_NOT_MODELLED,
    ),
  ),
  "regions.trento": revaluedYearly(
    mef("trento", 2024, TRENTO, CHILDREN_NOT_MODELLED),
    mef("trento", 2025, TRENTO, CHILDREN_NOT_MODELLED),
    mef(
      "trento",
      2026,
      TRENTO,
      "Art. 1 c. 2 quater, 2 sexies e 3 bis L.P. 23 dicembre 2019, n. 13, come modificato dalla L.P. 29 dicembre 2025, n. 11",
      CHILDREN_NOT_MODELLED,
    ),
  ),
  "regions.veneto": revaluedYearly(
    mef("veneto", 2024, VENETO, DISABILITY_NOT_MODELLED),
    mef("veneto", 2025, VENETO, DISABILITY_NOT_MODELLED),
    mef("veneto", 2026, VENETO, DISABILITY_NOT_MODELLED),
  ),
  "regions.friuli-venezia-giulia": revaluedYearly(
    mef("friuli-venezia-giulia", 2024, FRIULI_VENEZIA_GIULIA),
    mef("friuli-venezia-giulia", 2025, FRIULI_VENEZIA_GIULIA),
    mef("friuli-venezia-giulia", 2026, FRIULI_VENEZIA_GIULIA),
  ),
  "regions.liguria": revaluedYearly(
    mef("liguria", 2024, LIGURIA, CHILDREN_NOT_MODELLED),
    mef("liguria", 2025, LIGURIA, CHILDREN_NOT_MODELLED),
    mef("liguria", 2026, LIGURIA, CHILDREN_NOT_MODELLED),
  ),
  "regions.emilia-romagna": revaluedYearly(
    mef("emilia-romagna", 2024, EMILIA_ROMAGNA_2024),
    mef("emilia-romagna", 2025, EMILIA_ROMAGNA_2025),
    mef("emilia-romagna", 2026, EMILIA_ROMAGNA_2026),
  ),
  "regions.toscana": revaluedYearly(
    mef("toscana", 2024, TOSCANA),
    mef("toscana", 2025, TOSCANA),
    mef("toscana", 2026, TOSCANA, "Art. 1 L.R. Toscana 28 dicembre 2023, n. 48"),
  ),
  "regions.umbria": revaluedYearly(
    mef("umbria", 2024, UMBRIA_2024),
    mef("umbria", 2025, UMBRIA_2025, "L.R. Umbria 2/2025"),
    mef("umbria", 2026, UMBRIA_2025),
  ),
  "regions.marche": revaluedYearly(
    mef("marche", 2024, MARCHE, DISABILITY_NOT_MODELLED),
    mef("marche", 2025, MARCHE, DISABILITY_NOT_MODELLED),
    mef("marche", 2026, MARCHE, DISABILITY_NOT_MODELLED),
  ),
  "regions.lazio": revaluedYearly(
    mef("lazio", 2024, LAZIO_2024),
    mef("lazio", 2025, LAZIO_2024),
    mef("lazio", 2026, LAZIO_2026, "L.R. Lazio 20/2025"),
  ),
  "regions.abruzzo": revaluedYearly(
    mef("abruzzo", 2024, ABRUZZO_2024),
    mef("abruzzo", 2025, ABRUZZO_2025),
    mef("abruzzo", 2026, ABRUZZO_2025),
  ),
  "regions.molise": revaluedYearly(
    mef("molise", 2024, MOLISE),
    mef("molise", 2025, MOLISE),
    mef("molise", 2026, MOLISE),
  ),
  "regions.campania": revaluedYearly(
    mef("campania", 2024, CAMPANIA, CHILDREN_NOT_MODELLED),
    mef("campania", 2025, CAMPANIA, CHILDREN_NOT_MODELLED),
    mef("campania", 2026, CAMPANIA, CHILDREN_NOT_MODELLED),
  ),
  "regions.puglia": revaluedYearly(
    mef("puglia", 2024, PUGLIA_2024, CHILDREN_NOT_MODELLED),
    mef("puglia", 2025, PUGLIA_2024, CHILDREN_NOT_MODELLED),
    mef(
      "puglia",
      2026,
      PUGLIA_2026,
      "Decreto Regione Puglia n. 3 del 28/5/2026",
      CHILDREN_NOT_MODELLED,
    ),
  ),
  "regions.basilicata": revaluedYearly(
    mef("basilicata", 2024, BASILICATA),
    mef("basilicata", 2025, BASILICATA),
    mef("basilicata", 2026, BASILICATA),
  ),
  "regions.calabria": revaluedYearly(
    mef("calabria", 2024, CALABRIA),
    mef("calabria", 2025, CALABRIA),
    mef("calabria", 2026, CALABRIA),
  ),
  "regions.sicilia": revaluedYearly(
    mef("sicilia", 2024, SICILIA),
    mef("sicilia", 2025, SICILIA),
    mef("sicilia", 2026, SICILIA),
  ),
  "regions.sardegna": revaluedYearly(
    mef("sardegna", 2024, SARDEGNA, CHILDREN_NOT_MODELLED),
    mef("sardegna", 2025, SARDEGNA, CHILDREN_NOT_MODELLED),
    mef("sardegna", 2026, SARDEGNA, CHILDREN_NOT_MODELLED),
  ),
};

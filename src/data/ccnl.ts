import type { PaymentFrequency, Source } from "./types.ts";

// Notice periods for voluntary resignation (dimissioni) by CCNL, livello, and seniority.
// All days are calendar days unless `workingDays` is true on the livello.
// Sources cited in docs/data-verification/preavviso.md.

export type CcnlId = "commercio" | "metalmeccanici" | "logistica" | "cooperative-sociali";

export type SeniorityBand = "lt-5y" | "5-10y" | "gt-10y" | "lte-3y" | "gt-3y";

export interface CcnlLivello {
  readonly id: string;
  readonly label: string;
  readonly workingDays?: boolean;
}

export interface CcnlNoticeEntry {
  readonly band: SeniorityBand;
  readonly days: number;
}

export interface CcnlNoticeRow {
  readonly livelloId: string;
  readonly notice: readonly CcnlNoticeEntry[];
}

export interface CcnlDefinition {
  readonly id: CcnlId;
  readonly label: string;
  readonly bands: readonly SeniorityBand[];
  readonly livelli: readonly CcnlLivello[];
  readonly rows: readonly CcnlNoticeRow[];
}

const COMMERCIO: CcnlDefinition = {
  id: "commercio",
  label: "Commercio e Terziario (Confcommercio)",
  bands: ["lt-5y", "5-10y", "gt-10y"],
  livelli: [
    { id: "quadro-1", label: "Quadro / 1° livello" },
    { id: "2-3", label: "2° / 3° livello" },
    { id: "4-5", label: "4° / 5° livello" },
    { id: "6-7", label: "6° / 7° livello" },
  ],
  rows: [
    {
      livelloId: "quadro-1",
      notice: [
        { band: "lt-5y", days: 45 },
        { band: "5-10y", days: 60 },
        { band: "gt-10y", days: 90 },
      ],
    },
    {
      livelloId: "2-3",
      notice: [
        { band: "lt-5y", days: 20 },
        { band: "5-10y", days: 30 },
        { band: "gt-10y", days: 45 },
      ],
    },
    {
      livelloId: "4-5",
      notice: [
        { band: "lt-5y", days: 15 },
        { band: "5-10y", days: 20 },
        { band: "gt-10y", days: 30 },
      ],
    },
    {
      livelloId: "6-7",
      notice: [
        { band: "lt-5y", days: 10 },
        { band: "5-10y", days: 15 },
        { band: "gt-10y", days: 15 },
      ],
    },
  ],
};

const METALMECCANICI: CcnlDefinition = {
  id: "metalmeccanici",
  label: "Metalmeccanici Industria (Federmeccanica)",
  bands: ["lt-5y", "5-10y", "gt-10y"],
  livelli: [
    { id: "a1", label: "A1 — quadri" },
    { id: "b1-b3", label: "B1 / B2 / B3 — impiegati direttivi" },
    { id: "c1-c3", label: "C1 / C2 / C3 — intermedi" },
    { id: "d1-d2", label: "D1 / D2 — operai" },
  ],
  rows: [
    {
      livelloId: "a1",
      notice: [
        { band: "lt-5y", days: 60 },
        { band: "5-10y", days: 90 },
        { band: "gt-10y", days: 120 },
      ],
    },
    {
      livelloId: "b1-b3",
      notice: [
        { band: "lt-5y", days: 60 },
        { band: "5-10y", days: 90 },
        { band: "gt-10y", days: 120 },
      ],
    },
    {
      livelloId: "c1-c3",
      notice: [
        { band: "lt-5y", days: 45 },
        { band: "5-10y", days: 60 },
        { band: "gt-10y", days: 75 },
      ],
    },
    {
      livelloId: "d1-d2",
      notice: [
        { band: "lt-5y", days: 10 },
        { band: "5-10y", days: 20 },
        { band: "gt-10y", days: 30 },
      ],
    },
  ],
};

const LOGISTICA: CcnlDefinition = {
  id: "logistica",
  label: "Logistica, Trasporto Merci e Spedizione",
  bands: ["lt-5y", "5-10y", "gt-10y"],
  livelli: [
    { id: "quadri-1", label: "Quadri / Impiegati 1° livello" },
    { id: "impiegati-2", label: "Impiegati 2° livello" },
    { id: "impiegati-3-4", label: "Impiegati 3°S / 3° / 4° livello" },
    { id: "viaggiante", label: "Personale viaggiante (3°S, 3°SJ, 3°)" },
    { id: "operai", label: "Operai non viaggianti", workingDays: true },
  ],
  rows: [
    {
      livelloId: "quadri-1",
      notice: [
        { band: "lt-5y", days: 37 },
        { band: "5-10y", days: 52 },
        { band: "gt-10y", days: 67 },
      ],
    },
    {
      livelloId: "impiegati-2",
      notice: [
        { band: "lt-5y", days: 22 },
        { band: "5-10y", days: 30 },
        { band: "gt-10y", days: 37 },
      ],
    },
    {
      livelloId: "impiegati-3-4",
      notice: [
        { band: "lt-5y", days: 15 },
        { band: "5-10y", days: 22 },
        { band: "gt-10y", days: 30 },
      ],
    },
    {
      livelloId: "viaggiante",
      notice: [
        { band: "lt-5y", days: 15 },
        { band: "5-10y", days: 15 },
        { band: "gt-10y", days: 15 },
      ],
    },
    {
      livelloId: "operai",
      notice: [
        { band: "lt-5y", days: 6 },
        { band: "5-10y", days: 6 },
        { band: "gt-10y", days: 6 },
      ],
    },
  ],
};

const COOPERATIVE_SOCIALI: CcnlDefinition = {
  id: "cooperative-sociali",
  label: "Cooperative Sociali",
  bands: ["lte-3y", "gt-3y"],
  livelli: [
    { id: "a1-c1", label: "A1 / A2 / B1 / C1" },
    { id: "c2", label: "C2" },
    { id: "c3-e1", label: "C3 / D1 / D2 / D3 / E1" },
    { id: "e2-f2", label: "E2 / F1 / F2" },
  ],
  rows: [
    {
      livelloId: "a1-c1",
      notice: [
        { band: "lte-3y", days: 15 },
        { band: "gt-3y", days: 30 },
      ],
    },
    {
      livelloId: "c2",
      notice: [
        { band: "lte-3y", days: 30 },
        { band: "gt-3y", days: 45 },
      ],
    },
    {
      livelloId: "c3-e1",
      notice: [
        { band: "lte-3y", days: 45 },
        { band: "gt-3y", days: 60 },
      ],
    },
    {
      livelloId: "e2-f2",
      notice: [
        { band: "lte-3y", days: 90 },
        { band: "gt-3y", days: 120 },
      ],
    },
  ],
};

export const CCNL_TABLE: Record<CcnlId, CcnlDefinition> = {
  commercio: COMMERCIO,
  metalmeccanici: METALMECCANICI,
  logistica: LOGISTICA,
  "cooperative-sociali": COOPERATIVE_SOCIALI,
};

export const CCNL_IDS: readonly CcnlId[] = [
  "commercio",
  "metalmeccanici",
  "logistica",
  "cooperative-sociali",
];

export interface CcnlPreset {
  readonly paymentFrequency: PaymentFrequency;
}

// Mensilità tipiche per i quattro CCNL coperti dal calcolatore preavviso.
// Fonti in docs/data-verification/ccnl-mensilita.md.
export const CCNL_PRESETS: Readonly<Record<CcnlId, CcnlPreset>> = {
  commercio: { paymentFrequency: 14 },
  metalmeccanici: { paymentFrequency: 13 },
  logistica: { paymentFrequency: 14 },
  "cooperative-sociali": { paymentFrequency: 13 },
};

export const CCNL_PRESET_IDS: readonly CcnlId[] = [
  "commercio",
  "metalmeccanici",
  "logistica",
  "cooperative-sociali",
];

export interface CcnlSources {
  readonly preavviso: Source;
  readonly mensilita: Source;
}

export const CCNL_SOURCES: Readonly<Record<CcnlId, CcnlSources>> = {
  commercio: {
    preavviso: {
      ref: "Art. 254 CCNL Terziario Confcommercio",
      url: "https://contrattocommercio.it/art-254-dimissioni-e-preavviso/",
      note: "Giorni di calendario; la decorrenza dal 1° o dal 16 del mese non è modellata",
    },
    mensilita: { ref: "Art. 218 CCNL Terziario Confcommercio" },
  },
  metalmeccanici: {
    preavviso: {
      ref: "CCNL Federmeccanica, Tit. VI, art. 1",
      url: "https://contrattometalmeccanici.it/art-1-preavviso-di-licenziamento-e-di-dimissioni/",
    },
    mensilita: { ref: "Art. 7 Sez. 4 Tit. III CCNL Federmeccanica" },
  },
  logistica: {
    preavviso: {
      ref: "Art. 113 CCNL Logistica, Trasporto Merci e Spedizione",
      url: "https://contrattotrasporti.it/art-113-preavviso-licenziamento-dimissioni/",
      note: "Operai non viaggianti in giorni lavorativi",
    },
    mensilita: { ref: "Art. 38 CCNL Logistica, Trasporto Merci e Spedizione" },
  },
  "cooperative-sociali": {
    preavviso: {
      ref: "Art. 33 CCNL Cooperative Sociali",
      url: "https://ccnlcooperative.it/art-33-preavviso-licenziamento-dimissioni/",
    },
    mensilita: { ref: "Art. 50 CCNL Cooperative Sociali" },
  },
};

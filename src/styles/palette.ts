export const THEMES = ["light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

export const TOKEN_NAMES = [
  "carta",
  "inchiostro",
  "grigio",
  "filetto",
  "velo",
  "blu",
  "su-blu",
  "errore",
  "foglio",
  "tavolo",
] as const;

export type TokenName = (typeof TOKEN_NAMES)[number];

export const PALETTE: Readonly<Record<Theme, Readonly<Record<TokenName, string>>>> = {
  light: {
    carta: "#ffffff",
    inchiostro: "#000000",
    grigio: "#5c5c5c",
    filetto: "#d4d4d4",
    velo: "#f3f3f1",
    blu: "#1d3bcb",
    "su-blu": "#ffffff",
    errore: "#b3261e",
    foglio: "#ffffff",
    tavolo: "#f3f3f1",
  },
  dark: {
    carta: "#101010",
    inchiostro: "#f5f5f5",
    grigio: "#a6a6a6",
    filetto: "#333333",
    velo: "#1a1a1a",
    blu: "#8fa3ff",
    "su-blu": "#101010",
    errore: "#ff7b6e",
    foglio: "#1a1a1a",
    tavolo: "#101010",
  },
};

export type ContrastUse = "text" | "decorative";

export interface ContrastPair {
  readonly foreground: TokenName;
  readonly background: TokenName;
  readonly use: ContrastUse;
}

export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  { foreground: "inchiostro", background: "carta", use: "text" },
  { foreground: "inchiostro", background: "velo", use: "text" },
  { foreground: "carta", background: "inchiostro", use: "text" },
  { foreground: "grigio", background: "carta", use: "text" },
  { foreground: "grigio", background: "velo", use: "text" },
  { foreground: "blu", background: "carta", use: "text" },
  { foreground: "blu", background: "velo", use: "text" },
  { foreground: "su-blu", background: "blu", use: "text" },
  { foreground: "errore", background: "carta", use: "text" },
  { foreground: "errore", background: "velo", use: "text" },
  { foreground: "inchiostro", background: "foglio", use: "text" },
  { foreground: "grigio", background: "foglio", use: "text" },
  { foreground: "filetto", background: "carta", use: "decorative" },
];

export const MINIMUM_CONTRAST: Readonly<Record<ContrastUse, number>> = {
  text: 4.5,
  decorative: 1,
};

function channel(value: number): number {
  const scaled = value / 255;
  return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`Not a six-digit hex colour: ${hex}`);
  const [red, green, blue] = [match[1], match[2], match[3]].map((part) =>
    channel(Number.parseInt(part ?? "0", 16)),
  );
  return 0.2126 * (red ?? 0) + 0.7152 * (green ?? 0) + 0.0722 * (blue ?? 0);
}

export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (a, b) => b - a,
  );
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

export function contrastOf(pair: ContrastPair, theme: Theme): number {
  return contrastRatio(PALETTE[theme][pair.foreground], PALETTE[theme][pair.background]);
}

export type QuerySpec = Readonly<Record<string, readonly string[]>>;

export const EMPLOYEE_PARAMS = {
  l: ["lordo"],
  y: ["anno"],
  r: ["regione"],
  k: [],
  c: ["comune"],
  m: ["mens"],
  t: ["contratto"],
  a: ["az15"],
  p: ["pubblico"],
  e: ["inpsEmp"],
  d: ["inpsDat"],
  s: ["partenza"],
  n: ["netto"],
} as const satisfies QuerySpec;

export const INVERSE_PARAMS = {
  n: [],
  y: [],
  r: [],
  k: [],
  c: [],
  m: [],
  t: [],
  a: [],
  p: [],
} as const satisfies QuerySpec;

export const EMPLOYER_COST_PARAMS = {
  l: [],
  y: [],
  t: [],
  r: [],
  k: [],
  c: [],
  m: [],
} as const satisfies QuerySpec;

export const ORDINARIO_PARAMS = {
  f: [],
  s: [],
  y: [],
  r: [],
  k: [],
  c: [],
  g: [],
  o: [],
  m: [],
  q: [],
  a: [],
  n: [],
} as const satisfies QuerySpec;

export const APPRENTICESHIP_PARAMS = {
  l: ["lordo"],
} as const satisfies QuerySpec;

export const COMPOUND_INTEREST_PARAMS = {
  p: [],
  r: [],
  y: [],
  c: [],
  cf: [],
  f: [],
  i: [],
} as const satisfies QuerySpec;

export function queryNamesOf(spec: QuerySpec): string[] {
  return Object.entries(spec).flatMap(([key, legacy]) => [key, ...legacy]);
}

import type { QuerySpec } from "@/queryParams.ts";

export type QueryValues = Readonly<Record<string, string | undefined>>;

export function readQuery(search: string, spec: QuerySpec): QueryValues {
  const params = new URLSearchParams(search);
  const values: Record<string, string> = {};
  for (const [key, legacy] of Object.entries(spec)) {
    const name = [key, ...legacy].find((candidate) => params.has(candidate));
    const value = name === undefined ? null : params.get(name);
    if (value !== null) values[key] = value;
  }
  return values;
}

export function writeQuery(values: QueryValues, spec: QuerySpec): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(spec)) {
    const value = values[key];
    if (value !== undefined) params.set(key, value);
  }
  return params.toString();
}

export function hasQueryValues(values: QueryValues): boolean {
  return Object.values(values).some((value) => value !== undefined);
}

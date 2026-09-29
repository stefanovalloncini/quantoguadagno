import type { Comune } from "@/data/index.ts";

const APOSTROPHES = /['’]/g;
const SEPARATORS = /[\s-]+/g;
const DIACRITICS = /\p{M}/gu;

export function comuneSearchKey(text: string): string {
  return text
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(APOSTROPHES, "")
    .replace(SEPARATORS, " ")
    .trim();
}

export const COMUNE_SEARCH_MIN_LENGTH = 2;

function searchRank(comune: Comune, query: string): number | null {
  const name = comuneSearchKey(comune.name);
  if (name === query || comuneSearchKey(`${comune.name} (${comune.province})`) === query) {
    return 0;
  }
  if (name.startsWith(query)) return 1;
  if (name.split(" ").some((word) => word.startsWith(query))) return 2;
  if (name.includes(query)) return 3;
  return null;
}

export function searchComuni(comuni: readonly Comune[], query: string): readonly Comune[] {
  const key = comuneSearchKey(query);
  if (key.length < COMUNE_SEARCH_MIN_LENGTH) return [];
  return comuni
    .map((comune) => ({ comune, rank: searchRank(comune, key) }))
    .filter((match): match is { comune: Comune; rank: number } => match.rank !== null)
    .sort((a, b) => a.rank - b.rank || a.comune.name.localeCompare(b.comune.name, "it"))
    .map((match) => match.comune);
}

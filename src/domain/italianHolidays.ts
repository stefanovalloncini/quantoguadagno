// Italian national holidays. Source: Decreto del Presidente della Repubblica 28/12/1985 n. 792.
// Pasqua and Pasquetta are movable; computed via the anonymous Gregorian algorithm.

function easter(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function isoFor(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${String(year)}-${mm}-${dd}`;
}

function addOneDayIso(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Returns ISO date strings (YYYY-MM-DD) for all 12 Italian national holidays in the given year. */
export function italianHolidaysFor(year: number): readonly string[] {
  const e = easter(year);
  const easterIso = isoFor(year, e.month, e.day);
  const easterMonday = addOneDayIso(easterIso);

  return [
    isoFor(year, 1, 1), // Capodanno
    isoFor(year, 1, 6), // Epifania
    easterIso,
    easterMonday, // Pasquetta
    isoFor(year, 4, 25), // Festa della Liberazione
    isoFor(year, 5, 1), // Festa dei Lavoratori
    isoFor(year, 6, 2), // Festa della Repubblica
    isoFor(year, 8, 15), // Ferragosto
    isoFor(year, 11, 1), // Tutti i Santi
    isoFor(year, 12, 8), // Immacolata Concezione
    isoFor(year, 12, 25), // Natale
    isoFor(year, 12, 26), // Santo Stefano
  ];
}

/** Lazy cache of holiday sets per year for fast `has()` checks. */
const HOLIDAY_CACHE = new Map<number, Set<string>>();

export function isItalianHoliday(date: Date): boolean {
  const year = date.getUTCFullYear();
  let set = HOLIDAY_CACHE.get(year);
  if (!set) {
    set = new Set(italianHolidaysFor(year));
    HOLIDAY_CACHE.set(year, set);
  }
  return set.has(date.toISOString().slice(0, 10));
}

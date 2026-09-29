import type { CcnlDefinition, SeniorityBand } from "@/data/index.ts";
import { isItalianHoliday } from "./italianHolidays.ts";

export interface PreavvisoInput {
  readonly ccnl: CcnlDefinition;
  readonly livelloId: string;
  readonly hireDate: Date;
  readonly resignationDate: Date;
}

export interface PreavvisoBreakdown {
  readonly seniorityYears: number;
  readonly band: SeniorityBand;
  readonly livelloLabel: string;
  readonly noticeDays: number;
  readonly workingDays: boolean;
  readonly exitDate: Date;
}

const MS_PER_YEAR = 365.2425 * 24 * 3600 * 1000;

function diffYears(hire: Date, resignation: Date): number {
  const ms = resignation.getTime() - hire.getTime();
  return ms / MS_PER_YEAR;
}

function classifyBand(years: number, bands: readonly SeniorityBand[]): SeniorityBand {
  if (bands.includes("lt-5y")) {
    if (years < 5) return "lt-5y";
    if (years <= 10) return "5-10y";
    return "gt-10y";
  }
  return years <= 3 ? "lte-3y" : "gt-3y";
}

function addCalendarDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function addWorkingDays(date: Date, days: number): Date {
  const d = new Date(date);
  let added = 0;
  while (added < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    const wd = d.getUTCDay();
    if (wd === 0 || wd === 6) continue;
    if (isItalianHoliday(d)) continue;
    added += 1;
  }
  return d;
}

export function calculatePreavviso(input: PreavvisoInput): PreavvisoBreakdown {
  const { ccnl, livelloId, hireDate, resignationDate } = input;
  const seniorityYears = diffYears(hireDate, resignationDate);
  const band = classifyBand(seniorityYears, ccnl.bands);

  const livello = ccnl.livelli.find((l) => l.id === livelloId);
  if (!livello) throw new Error(`Unknown livello: ${livelloId}`);

  const row = ccnl.rows.find((r) => r.livelloId === livelloId);
  if (!row) throw new Error(`No notice row for livello: ${livelloId}`);

  const entry = row.notice.find((n) => n.band === band);
  if (!entry) {
    throw new Error(`No notice for band ${band} at livello ${livelloId}`);
  }

  const workingDays = livello.workingDays === true;
  const exitDate = workingDays
    ? addWorkingDays(resignationDate, entry.days)
    : addCalendarDays(resignationDate, entry.days);

  return {
    seniorityYears,
    band,
    livelloLabel: livello.label,
    noticeDays: entry.days,
    workingDays,
    exitDate,
  };
}

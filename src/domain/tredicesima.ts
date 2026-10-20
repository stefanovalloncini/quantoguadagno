import type { IrpefBracket } from "./irpef.ts";
import { applyProgressiveBrackets } from "./irpef.ts";
import { round } from "./_math.ts";

const MONTHS_PER_YEAR = 12;

export interface TredicesimaInput {
  readonly ral: number;
  readonly mensilita: number;
  readonly inpsRate: number;
  readonly brackets: readonly IrpefBracket[];
}

export interface TredicesimaResult {
  readonly gross: number;
  readonly inps: number;
  readonly taxable: number;
  readonly monthlyBrackets: readonly IrpefBracket[];
  readonly irpef: number;
  readonly net: number;
  readonly effectiveRate: number;
  readonly extraMonths: number;
  readonly grossTotal: number;
  readonly netTotal: number;
}

const EMPTY: TredicesimaResult = {
  gross: 0,
  inps: 0,
  taxable: 0,
  monthlyBrackets: [],
  irpef: 0,
  net: 0,
  effectiveRate: 0,
  extraMonths: 0,
  grossTotal: 0,
  netTotal: 0,
};

export function monthlyBrackets(brackets: readonly IrpefBracket[]): readonly IrpefBracket[] {
  return brackets.map((bracket) => ({
    min: bracket.min / MONTHS_PER_YEAR,
    max: bracket.max === null ? null : bracket.max / MONTHS_PER_YEAR,
    rate: bracket.rate,
  }));
}

// Each extra month (tredicesima, quattordicesima) is one month's gross. Payroll
// withholds IRPEF on it alone, with the annual brackets divided by 12 and no
// detrazioni (art. 23 c. 2 lett. b DPR 600/1973), and withholds no addizionali.
// The year-end conguaglio then settles the annual IRPEF.
export function calculateTredicesima(input: TredicesimaInput): TredicesimaResult {
  const { ral, mensilita, inpsRate, brackets } = input;
  if (ral <= 0 || mensilita <= MONTHS_PER_YEAR) return EMPTY;

  const gross = round(ral / mensilita);
  const inps = round(gross * inpsRate);
  const taxable = round(gross - inps);

  const perMonth = monthlyBrackets(brackets);
  const irpef = round(applyProgressiveBrackets(taxable, perMonth));

  const net = round(gross - inps - irpef);
  const effectiveRate = round((inps + irpef) / gross, 4);
  const extraMonths = mensilita - MONTHS_PER_YEAR;

  return {
    gross,
    inps,
    taxable,
    monthlyBrackets: perMonth,
    irpef,
    net,
    effectiveRate,
    extraMonths,
    grossTotal: round(gross * extraMonths),
    netTotal: round(net * extraMonths),
  };
}

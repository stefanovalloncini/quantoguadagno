import type { IrpefBracket } from "./irpef.ts";
import { getMarginalRate } from "./irpef.ts";
import { round } from "./_math.ts";

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
  readonly irpef: number;
  readonly net: number;
  readonly marginalRate: number;
  readonly effectiveRate: number;
  readonly extraMonths: number;
  readonly grossTotal: number;
  readonly netTotal: number;
}

const EMPTY: TredicesimaResult = {
  gross: 0,
  inps: 0,
  taxable: 0,
  irpef: 0,
  net: 0,
  marginalRate: 0,
  effectiveRate: 0,
  extraMonths: 0,
  grossTotal: 0,
  netTotal: 0,
};

// The tredicesima is one month's gross, taxed with INPS and IRPEF at the
// taxpayer's marginal rate. Unlike an ordinary month it carries no detrazioni
// (lavoro dipendente, carichi di famiglia) and no addizionali regionali/comunali
// — that is why it nets less than a normal month.
export function calculateTredicesima(input: TredicesimaInput): TredicesimaResult {
  const { ral, mensilita, inpsRate, brackets } = input;
  if (ral <= 0 || mensilita <= 12) return EMPTY;

  const gross = round(ral / mensilita);
  const inps = round(gross * inpsRate);
  const taxable = round(gross - inps);

  const annualTaxable = ral - round(ral * inpsRate);
  const marginalRate = getMarginalRate(annualTaxable, brackets);
  const irpef = round(taxable * marginalRate);

  const net = round(gross - inps - irpef);
  const effectiveRate = round((inps + irpef) / gross, 4);
  const extraMonths = mensilita - 12;

  return {
    gross,
    inps,
    taxable,
    irpef,
    net,
    marginalRate,
    effectiveRate,
    extraMonths,
    grossTotal: round(gross * extraMonths),
    netTotal: round(net * extraMonths),
  };
}

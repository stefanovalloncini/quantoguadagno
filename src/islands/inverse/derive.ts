import type { PaymentFrequency, RegionCode, SupportedYear } from "@/data/index.ts";
import { contractAssumption, type ContractAssumption } from "@/islands/home/contract.ts";
import { localAssumption, type LocalAssumption } from "@/islands/home/localAssumption.ts";
import { roundTo } from "@/islands/home/fields.ts";
import type { InverseResult } from "./compute.ts";

export interface InverseSummary {
  readonly targetNetAnnual: number;
  readonly grossAnnual: number;
  readonly grossMonthly: number;
  readonly netAnnual: number;
  readonly netMonthly: number;
  readonly gap: number;
  readonly converged: boolean;
}

export function inverseSummary(result: InverseResult): InverseSummary {
  const { breakdown } = result;
  return {
    targetNetAnnual: result.values.targetNetAnnual,
    grossAnnual: result.grossAnnual,
    grossMonthly: breakdown.grossMonthly,
    netAnnual: breakdown.netAnnual,
    netMonthly: breakdown.netMonthly,
    gap: roundTo(breakdown.netAnnual - result.values.targetNetAnnual, 2),
    converged: result.converged,
  };
}

export type InverseLineId =
  | "gross"
  | "inps"
  | "taxable"
  | "irpef"
  | "regional"
  | "municipal"
  | "sommaAggiuntiva"
  | "trattamento"
  | "net";

export type InverseLineKind = "plain" | "deducted" | "credited" | "subtotal" | "total";

export interface InverseLine {
  readonly id: InverseLineId;
  readonly kind: InverseLineKind;
  readonly amount: number;
  readonly rate?: number;
}

export function inverseLines(result: InverseResult): readonly InverseLine[] {
  const { breakdown: b } = result;
  const credits: InverseLine[] = [
    ...(b.sommaAggiuntiva > 0
      ? [{ id: "sommaAggiuntiva" as const, kind: "credited" as const, amount: b.sommaAggiuntiva }]
      : []),
    ...(b.trattamentoIntegrativo > 0
      ? [
          {
            id: "trattamento" as const,
            kind: "credited" as const,
            amount: b.trattamentoIntegrativo,
          },
        ]
      : []),
  ];
  return [
    { id: "gross", kind: "plain", amount: b.grossAnnual },
    { id: "inps", kind: "deducted", amount: b.inpsContribution, rate: b.inpsRate },
    { id: "taxable", kind: "subtotal", amount: b.taxableIncome },
    { id: "irpef", kind: "deducted", amount: b.irpefNet },
    { id: "regional", kind: "deducted", amount: b.regionalTax },
    { id: "municipal", kind: "deducted", amount: b.municipalTax },
    ...credits,
    { id: "net", kind: "total", amount: b.netAnnual },
  ];
}

export type InverseAssumption =
  | { readonly id: "year"; readonly value: SupportedYear; readonly fieldToEdit: "year" }
  | { readonly id: "region"; readonly value: RegionCode; readonly fieldToEdit: "region" }
  | LocalAssumption
  | {
      readonly id: "paymentFrequency";
      readonly value: PaymentFrequency;
      readonly fieldToEdit: "paymentFrequency";
    }
  | {
      readonly id: "contract";
      readonly value: ContractAssumption;
      readonly fieldToEdit: "contractType";
    };

export function inverseAssumptions(result: InverseResult): readonly InverseAssumption[] {
  const { values } = result;
  return [
    { id: "year", value: values.taxYear, fieldToEdit: "year" },
    { id: "region", value: values.regionCode, fieldToEdit: "region" },
    localAssumption(result),
    { id: "paymentFrequency", value: values.paymentFrequency, fieldToEdit: "paymentFrequency" },
    {
      id: "contract",
      value: contractAssumption({ ...values, insuredBefore1996: false, inpsOverride: null }),
      fieldToEdit: "contractType",
    },
  ];
}

export interface InverseDerived {
  readonly summary: InverseSummary;
  readonly lines: readonly InverseLine[];
  readonly assumptions: readonly InverseAssumption[];
}

export function deriveInverse(result: InverseResult): InverseDerived {
  return {
    summary: inverseSummary(result),
    lines: inverseLines(result),
    assumptions: inverseAssumptions(result),
  };
}

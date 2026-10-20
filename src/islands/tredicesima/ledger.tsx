import type { ReactNode } from "react";
import type { LedgerRow } from "@/components/result/Ledger.tsx";
import type { Bracket, SupportedYear } from "@/data/index.ts";
import { getTaxConfig, type TredicesimaResult } from "@/domain/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import { formatMoney, formatPercent } from "@/i18n/numbers.ts";
import type { TranslateFn } from "@/i18n/react.tsx";

export interface TredicesimaLedgerContext {
  readonly result: TredicesimaResult;
  readonly mensilita: number;
  readonly taxYear: SupportedYear;
  readonly t: TranslateFn;
  readonly locale: Locale;
}

export interface TredicesimaLedger {
  readonly rows: readonly LedgerRow[];
  readonly total: LedgerRow;
}

function paragraph(text: ReactNode): ReactNode {
  return <p>{text}</p>;
}

export function bandsText(
  brackets: readonly Bracket[],
  taxable: number,
  t: TranslateFn,
  locale: Locale,
): string {
  const reached = brackets.filter((bracket, index) => index === 0 || taxable > bracket.min);
  return reached
    .map((bracket, index) => {
      const rate = formatPercent(bracket.rate, locale, 0);
      const last = index === reached.length - 1;
      if ((last && index > 0) || bracket.max === null) {
        return t("tredicesima.ledger.irpef.bandAbove", { rate });
      }
      return t("tredicesima.ledger.irpef.bandUpTo", {
        rate,
        max: formatMoney(bracket.max, locale),
      });
    })
    .join(", ");
}

export function buildTredicesimaLedger({
  result,
  mensilita,
  taxYear,
  t,
  locale,
}: TredicesimaLedgerContext): TredicesimaLedger {
  const cfg = getTaxConfig(taxYear);
  const inpsRate = result.gross > 0 ? result.inps / result.gross : 0;
  const exemption2024 = cfg.inpsExemption2024 !== null;
  const sommaLimit = cfg.taxWedgeCut?.sommaAggiuntiva.at(-1)?.maxIncome ?? 0;
  const withSomma = result.somma > 0;
  const rows: LedgerRow[] = [
    {
      id: "gross",
      name: t("tredicesima.breakdown.gross"),
      kind: "plain",
      rule: t("tredicesima.ledger.gross.rule", { mensilita }),
      annual: formatMoney(result.gross, locale),
      explanation: paragraph(t("tredicesima.ledger.gross.explain", { mensilita })),
    },
    {
      id: "inps",
      name: t("tredicesima.breakdown.inps"),
      kind: "deducted",
      rule: t("tredicesima.ledger.inps.rule", { rate: formatPercent(inpsRate, locale, 2) }),
      annual: formatMoney(-result.inps, locale),
      explanation: paragraph(
        t("tredicesima.ledger.inps.explain", { exemption: exemption2024 ? "yes" : "no" }),
      ),
    },
    {
      id: "taxable",
      name: t("tredicesima.ledger.taxable"),
      kind: "subtotal",
      rule: t("tredicesima.ledger.taxable.rule"),
      annual: formatMoney(result.taxable, locale),
      explanation: paragraph(t("tredicesima.ledger.taxable.explain")),
    },
    {
      id: "irpef",
      name: t("tredicesima.breakdown.irpef"),
      kind: "deducted",
      rule: t("tredicesima.ledger.irpef.rule"),
      annual: formatMoney(-result.irpef, locale),
      explanation: paragraph(
        t("tredicesima.ledger.irpef.explain", {
          bands: bandsText(result.monthlyBrackets, result.taxable, t, locale),
        }),
      ),
    },
    ...(withSomma
      ? [
          {
            id: "somma",
            name: t("tredicesima.ledger.somma"),
            kind: "credited" as const,
            rule: t("tredicesima.ledger.somma.rule", {
              rate: formatPercent(result.sommaRate, locale, 1),
            }),
            annual: formatMoney(result.somma, locale, { sign: "always" }),
            explanation: paragraph(
              t("tredicesima.ledger.somma.explain", {
                max: formatMoney(sommaLimit, locale, { integer: true }),
              }),
            ),
          },
        ]
      : []),
  ];

  const total: LedgerRow = {
    id: "net",
    name: t("tredicesima.breakdown.net"),
    kind: "total",
    rule: t("tredicesima.ledger.net.rule", { somma: withSomma ? "yes" : "no" }),
    annual: formatMoney(result.net, locale),
  };
  return { rows, total };
}

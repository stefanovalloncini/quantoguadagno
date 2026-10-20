import type { ReactNode } from "react";
import { NoteLine } from "@/components/result/Assumptions.tsx";
import { LiveStatus } from "@/components/result/LiveStatus.tsx";
import { ResultFigure, type FigureState } from "@/components/result/ResultFigure.tsx";
import { formatPercent } from "@/i18n/numbers.ts";
import { useRichT, useT, type RichTranslateFn, type TranslateFn } from "@/i18n/react.tsx";
import { Amount, type ViewFormat } from "@/islands/home/viewFormat.tsx";
import type { ComparedOffers } from "./compute.ts";
import { otherOffer, type ComparisonRow, type ComparisonVerdict } from "./derive.ts";
import { rowLabel, type SummaryContext } from "./summaries.ts";
import { IDS, offerLetter } from "./viewIds.ts";

export interface VerifiedLine {
  readonly date: string;
  readonly href: string;
  readonly pending: number;
}

export interface VerdictPanelProps {
  readonly offers: ComparedOffers | null;
  readonly verdict: ComparisonVerdict | null;
  readonly rows: readonly ComparisonRow[];
  readonly figureState: FigureState;
  readonly prompt: string;
  readonly announcement: string;
  readonly verified: VerifiedLine | null;
  readonly context: SummaryContext;
}

export function verdictLabel(verdict: ComparisonVerdict, t: TranslateFn): string {
  return verdict.winner === "equal"
    ? t("comparison.verdict.tie")
    : t("comparison.verdict.winner", { winner: verdict.winner });
}

export function verdictValue(verdict: ComparisonVerdict, f: ViewFormat): string {
  if (verdict.winner !== "equal") return f.signed(verdict.netAnnualGap);
  return verdict.exactTie ? f.money(verdict.sharedNet) : f.whole(verdict.sharedNet);
}

function money(value: number, f: ViewFormat) {
  return <Amount>{f.money(value)}</Amount>;
}

function winnerParagraphs(
  offers: ComparedOffers,
  verdict: ComparisonVerdict,
  rt: RichTranslateFn,
  f: ViewFormat,
): readonly ReactNode[] {
  const winnerId = verdict.winner === "a" ? "a" : "b";
  const winner = offers[winnerId];
  const other = offers[otherOffer(winnerId)];
  const letter = offerLetter(winnerId);
  const winnerMonthly = winner.breakdown.netMonthly;
  const otherMonthly = other.breakdown.netMonthly;
  const counts = {
    winnerCount: winner.values.paymentFrequency,
    otherCount: other.values.paymentFrequency,
  };
  const amounts = {
    winnerAmount: money(winnerMonthly, f),
    otherAmount: money(otherMonthly, f),
  };
  const payslip =
    winnerMonthly < otherMonthly
      ? rt("comparison.verdict.payslipLower", { winner: letter, ...amounts, ...counts })
      : winnerMonthly === otherMonthly
        ? rt("comparison.verdict.payslipSame", {
            winner: letter,
            amount: money(winnerMonthly, f),
            ...counts,
          })
        : counts.winnerCount < counts.otherCount && verdict.grossGap > 0
          ? rt("comparison.verdict.payslipHigherFewer", { winner: letter, ...amounts, ...counts })
          : rt("comparison.verdict.payslipHigher", { winner: letter, ...amounts });
  const kept =
    verdict.keptShare === null
      ? rt("comparison.verdict.keptLowerGross", {
          winner: letter,
          net: money(verdict.netAnnualGap, f),
        })
      : rt("comparison.verdict.kept", {
          winner: letter,
          gross: money(verdict.grossGap, f),
          net: money(verdict.netAnnualGap, f),
          article: f.article(verdict.keptShare),
          share: <Amount>{formatPercent(verdict.keptShare, f.locale, 2)}</Amount>,
        });
  return [payslip, kept];
}

function tieParagraphs(
  offers: ComparedOffers,
  verdict: ComparisonVerdict,
  rt: RichTranslateFn,
  t: TranslateFn,
  f: ViewFormat,
): readonly ReactNode[] {
  const { a, b } = offers;
  const countA = a.values.paymentFrequency;
  const countB = b.values.paymentFrequency;
  const rule = verdict.exactTie
    ? t("comparison.verdict.tieRule")
    : rt("comparison.verdict.tieGap", { amount: money(verdict.netAnnualGap, f) });
  if (countA === countB) {
    return [
      rt("comparison.verdict.tieSamePayslip", {
        amountA: money(a.breakdown.netMonthly, f),
        amountB: money(b.breakdown.netMonthly, f),
      }),
      rule,
    ];
  }
  const [more, fewer] = countA > countB ? (["a", "b"] as const) : (["b", "a"] as const);
  return [
    rt("comparison.verdict.tiePayslip", {
      more: offerLetter(more),
      moreAmount: money(offers[more].breakdown.netMonthly, f),
      fewerAmount: money(offers[fewer].breakdown.netMonthly, f),
      sameGross: a.breakdown.grossAnnual === b.breakdown.grossAnnual ? "yes" : "no",
      moreCount: offers[more].values.paymentFrequency,
      fewerCount: offers[fewer].values.paymentFrequency,
    }),
    rule,
  ];
}

function ComparisonTable({
  rows,
  offers,
  context,
}: {
  readonly rows: readonly ComparisonRow[];
  readonly offers: ComparedOffers;
  readonly context: SummaryContext;
}) {
  const t = useT();
  const { f } = context;
  const columns = {
    a: t("comparison.offer.title", { offer: "a" }),
    b: t("comparison.offer.title", { offer: "b" }),
    delta: t("comparison.table.delta"),
  };
  const amount = (row: ComparisonRow, value: number) =>
    row.kind === "credited" && value > 0 ? f.signed(value) : f.money(value);
  const suffix = (row: ComparisonRow) =>
    row.kind === "deducted"
      ? t("ledger.deducted")
      : row.kind === "credited"
        ? t("ledger.credited")
        : null;
  return (
    <table className="qg-table qg-table--stack" role="table">
      <caption>
        {t("comparison.table.caption")}
        <span className="qg-table__caption-note">{t("comparison.table.note")}</span>
      </caption>
      <thead role="rowgroup">
        <tr role="row">
          <th scope="col" role="columnheader">
            {t("comparison.table.item")}
          </th>
          <th scope="col" role="columnheader" className="qg-table__num">
            {columns.a}
          </th>
          <th scope="col" role="columnheader" className="qg-table__num">
            {columns.b}
          </th>
          <th scope="col" role="columnheader" className="qg-table__num">
            {columns.delta}
          </th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        {rows.map((row) => {
          const extra = suffix(row);
          return (
            <tr
              role="row"
              key={row.key}
              className={row.kind === "total" ? "qg-table__total" : undefined}
            >
              <th scope="row" role="rowheader" className="qg-table__primary">
                {rowLabel(row, offers, context)}
                {extra !== null && <span className="qg-visually-hidden">{extra}</span>}
              </th>
              <td role="cell" className="qg-table__num qg-table__pair" data-label={columns.a}>
                {amount(row, row.a)}
              </td>
              <td role="cell" className="qg-table__num qg-table__pair" data-label={columns.b}>
                {amount(row, row.b)}
              </td>
              <td role="cell" className="qg-table__num qg-table__pair" data-label={columns.delta}>
                {f.signed(row.delta)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

interface Translators {
  readonly t: TranslateFn;
  readonly rt: RichTranslateFn;
  readonly f: ViewFormat;
}

function verdictFigure(
  offers: ComparedOffers,
  verdict: ComparisonVerdict,
  state: FigureState,
  { t, rt, f }: Translators,
) {
  const tie = verdict.winner === "equal";
  const countA = offers.a.values.paymentFrequency;
  const countB = offers.b.values.paymentFrequency;
  const sub = tie
    ? countA === countB
      ? undefined
      : t("comparison.verdict.tieFrequencies", { countA, countB })
    : rt("comparison.verdict.monthly", {
        amount: <strong>{f.money(verdict.averageMonthlyGap)}</strong>,
      });
  const basis = tie
    ? t(verdict.exactTie ? "comparison.verdict.basisTie" : "comparison.verdict.basisTieRounded")
    : t("comparison.verdict.basis");
  return (
    <ResultFigure
      headingId={IDS.verdictHeading}
      labelTone="answer"
      label={verdictLabel(verdict, t)}
      state={state}
      value={verdictValue(verdict, f)}
      basis={basis}
      staleNote={t("comparison.verdict.stale")}
      {...(sub === undefined ? {} : { sub })}
    />
  );
}

export function VerdictPanel({
  offers,
  verdict,
  rows,
  figureState,
  prompt,
  announcement,
  verified,
  context,
}: VerdictPanelProps) {
  const t = useT();
  const rt = useRichT();
  const { f } = context;
  const shown =
    figureState !== "empty" && offers !== null && verdict !== null ? { offers, verdict } : null;

  return (
    <section className="qg-verdict" id={IDS.result} aria-labelledby={IDS.verdictHeading}>
      {shown === null ? (
        <ResultFigure
          headingId={IDS.verdictHeading}
          label={t("comparison.verdict.pending")}
          state="empty"
          prompt={prompt}
        />
      ) : (
        verdictFigure(shown.offers, shown.verdict, figureState, { t, rt, f })
      )}
      <LiveStatus message={announcement} />
      {shown !== null && (
        <>
          {figureState === "ready" && (
            <div className="qg-verdict__text">
              {(shown.verdict.winner === "equal"
                ? tieParagraphs(shown.offers, shown.verdict, rt, t, f)
                : winnerParagraphs(shown.offers, shown.verdict, rt, f)
              ).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
          <NoteLine term={t("result.estimate.term")}>
            {t("comparison.estimate")}
            {verified !== null && (
              <>
                {" "}
                {rt("comparison.trust", {
                  checked: (
                    <a href={verified.href}>{t("comparison.verified", { date: verified.date })}</a>
                  ),
                  pending: verified.pending > 0 ? "yes" : "no",
                  count: verified.pending,
                })}
              </>
            )}
          </NoteLine>
          <ComparisonTable rows={rows} offers={shown.offers} context={context} />
        </>
      )}
    </section>
  );
}

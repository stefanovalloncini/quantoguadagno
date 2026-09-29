import type { ReactNode } from "react";
import type { RegionText } from "@/components/form/regionText.ts";
import type { SalaryBreakdown } from "@/domain/composer.ts";
import { formatPercent } from "@/i18n/numbers.ts";
import { useRichT, useT, type TranslateFn } from "@/i18n/react.tsx";
import type { EmployeeResult } from "@/islands/home/compute.ts";
import type { ComuneLookup } from "@/islands/home/useComune.ts";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";
import type { PayslipSummary } from "./derive.ts";
import { comuneRates, rangeText, regionalRangeText, standardInpsRate } from "./rateText.ts";

export interface PayslipSheetProps {
  readonly result: EmployeeResult;
  readonly summary: PayslipSummary;
  readonly comune: ComuneLookup;
  readonly created: string;
  readonly checked: { readonly date: string; readonly pending: number } | null;
  readonly site: string;
  readonly sourcesText: string;
  readonly recalculate: { readonly href: string; readonly text: string };
  readonly regions: RegionText;
  readonly f: ViewFormat;
}

const IDS = {
  sheet: "cedolino-titolo",
  inputs: "dati-titolo",
  linesNarrow: "voci-stretto-titolo",
  lines: "voci-titolo",
  tax: "fiscali-titolo",
} as const;

interface Cell {
  readonly id: string;
  readonly term: string;
  readonly value: ReactNode;
}

interface PayslipLine {
  readonly id: string;
  readonly name: string;
  readonly base: string;
  readonly rate: string;
  readonly rule: string;
  readonly earning: number | null;
  readonly withholding: number | null;
}

function Cells({
  cells,
  extraClass,
}: {
  readonly cells: readonly Cell[];
  readonly extraClass?: string;
}) {
  const odd = cells.length % 2 === 1;
  return (
    <dl
      className={extraClass === undefined ? "qg-payslip__cells" : `qg-payslip__cells ${extraClass}`}
    >
      {cells.map((cell, index) => (
        <div
          className={
            odd && index === cells.length - 1
              ? "qg-payslip__cell qg-payslip__cell--wide"
              : "qg-payslip__cell"
          }
          key={cell.id}
        >
          <dt>{cell.term}</dt>
          <dd>{cell.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function localRate(result: EmployeeResult, f: ViewFormat): string {
  const { municipal } = result;
  return municipal.kind === "manual"
    ? f.percent(municipal.rate)
    : rangeText(comuneRates(municipal.rule), f);
}

function comuneValue(result: EmployeeResult, lookup: ComuneLookup, t: TranslateFn, f: ViewFormat) {
  const rate = localRate(result, f);
  const { municipal } = result;
  if (municipal.kind === "comune") {
    return t("print.inputs.comuneValue", { name: municipal.comune.name, rate });
  }
  return t(lookup.status === "missing" ? "print.inputs.comuneMissing" : "print.inputs.comuneNone", {
    rate,
  });
}

function dependentsValue(result: EmployeeResult, t: TranslateFn, f: ViewFormat): string {
  const dependents = result.values.dependents;
  if (dependents === null) return t("print.inputs.dependentsNone");
  const parts = [
    ...(dependents.hasSpouse ? [t("print.part.spouse")] : []),
    ...(dependents.childrenOver21 > 0
      ? [t("print.part.children", { count: dependents.childrenOver21 })]
      : []),
    ...(dependents.otherDependents > 0
      ? [t("print.part.others", { count: dependents.otherDependents })]
      : []),
  ];
  return f.capitalize(f.list(parts));
}

function expensesValue(result: EmployeeResult, t: TranslateFn, f: ViewFormat): string {
  const expenses = result.values.expenseDeductions;
  if (expenses === null) return t("print.inputs.expensesNone");
  const total =
    expenses.mortgageInterest +
    expenses.medicalExpenses +
    expenses.otherDeductions +
    (expenses.pensionFund ?? 0);
  return f.money(total);
}

function payslipLines(
  result: EmployeeResult,
  t: TranslateFn,
  f: ViewFormat,
): readonly PayslipLine[] {
  const b: SalaryBreakdown = result.breakdown;
  const taxable = f.money(b.taxableIncome);
  const due = b.irpefNet > 0;
  const relief = b.inpsExemption + b.madreLavoratriceExemption > 0 ? "yes" : "no";
  const inpsRate = f.percent(standardInpsRate(result.values));
  const regionalRate = regionalRangeText(result.values, f);
  const municipalRate = localRate(result, f);
  const credit = (id: string, name: string, amount: number): readonly PayslipLine[] =>
    amount > 0
      ? [
          {
            id,
            name,
            base: "",
            rate: "",
            rule: t("print.line.creditRule"),
            earning: amount,
            withholding: null,
          },
        ]
      : [];
  return [
    {
      id: "gross",
      name: t("print.line.gross"),
      base: "",
      rate: "",
      rule: t("print.line.grossRule"),
      earning: b.grossAnnual,
      withholding: null,
    },
    ...credit("somma", t("print.line.somma"), b.sommaAggiuntiva),
    ...credit("trattamento", t("print.line.trattamento"), b.trattamentoIntegrativo),
    ...credit("pdr", t("print.line.pdr"), b.pdrNet),
    {
      id: "inps",
      name: t("print.line.inps"),
      base: f.money(b.grossAnnual),
      rate: t("print.line.inpsRate", { rate: inpsRate, relief }),
      rule: t("print.line.inpsRule", { rate: inpsRate, base: f.money(b.grossAnnual), relief }),
      earning: null,
      withholding: b.inpsContribution,
    },
    {
      id: "irpef",
      name: t("print.line.irpef"),
      base: taxable,
      rate: t("print.line.irpefRate"),
      rule: t("print.line.irpefRule", { base: taxable }),
      earning: null,
      withholding: b.irpefNet,
    },
    {
      id: "regional",
      name: t("print.line.regional"),
      base: taxable,
      rate: due ? regionalRate : t("print.line.notDue"),
      rule: due
        ? t("print.line.localRule", { rate: regionalRate, base: taxable })
        : t("print.line.notDue"),
      earning: null,
      withholding: b.regionalTax,
    },
    {
      id: "municipal",
      name: t("print.line.municipal"),
      base: taxable,
      rate: due ? municipalRate : t("print.line.notDue"),
      rule: due
        ? t("print.line.localRule", { rate: municipalRate, base: taxable })
        : t("print.line.notDue"),
      earning: null,
      withholding: b.municipalTax,
    },
  ];
}

function taxCells(b: SalaryBreakdown, t: TranslateFn, f: ViewFormat): readonly Cell[] {
  const optional = (id: string, term: string, amount: number): readonly Cell[] =>
    amount > 0 ? [{ id, term, value: f.money(amount) }] : [];
  return [
    { id: "taxable", term: t("print.tax.taxable"), value: f.money(b.taxableIncome) },
    { id: "irpefGross", term: t("print.tax.irpefGross"), value: f.money(b.irpefGross) },
    { id: "work", term: t("print.tax.work"), value: f.money(b.irpefDeduction) },
    ...optional("wedge", t("print.tax.wedge"), b.detrazioneAggiuntiva),
    ...optional("dependents", t("print.tax.dependents"), b.dependentsDeduction),
    ...optional("expenses", t("print.tax.expenses"), b.expenseDeduction),
    { id: "irpefNet", term: t("print.tax.irpefNet"), value: f.money(b.irpefNet) },
  ];
}

export function PayslipSheet({
  result,
  summary,
  comune,
  created,
  checked,
  site,
  sourcesText,
  recalculate,
  regions,
  f,
}: PayslipSheetProps) {
  const t = useT();
  const rt = useRichT();
  const { values, breakdown: b } = result;
  const lines = payslipLines(result, t, f);
  const tax = taxCells(b, t, f);
  const solvedFrom =
    result.solve === null ? null : result.solve.targetNetAnnual / values.paymentFrequency;
  const inputs: readonly Cell[] = [
    {
      id: "gross",
      term: t("print.inputs.gross"),
      value:
        solvedFrom === null ? (
          f.money(result.input.grossAnnual)
        ) : (
          <>
            {f.money(result.input.grossAnnual)}
            <span className="qg-payslip__cell-note">
              {t("print.inputs.fromNet", { amount: f.money(solvedFrom) })}
            </span>
          </>
        ),
    },
    { id: "frequency", term: t("print.inputs.frequency"), value: values.paymentFrequency },
    {
      id: "contract",
      term: t("print.inputs.contract"),
      value: t("print.inputs.contractValue", {
        type: values.contractType,
        large: values.companySize === "large" ? "yes" : "no",
      }),
    },
    {
      id: "sector",
      term: t("print.inputs.sector"),
      value: t("print.inputs.sectorValue", { public: values.isPublicEmployee ? "yes" : "no" }),
    },
    { id: "region", term: t("print.inputs.region"), value: regions.name(values.regionCode) },
    { id: "comune", term: t("print.inputs.comune"), value: comuneValue(result, comune, t, f) },
    { id: "dependents", term: t("print.inputs.dependents"), value: dependentsValue(result, t, f) },
    { id: "expenses", term: t("print.inputs.expenses"), value: expensesValue(result, t, f) },
  ];
  const amount = (value: number | null) => (value === null ? "" : f.money(value));
  const signed = (line: PayslipLine) =>
    line.withholding === null ? f.money(line.earning ?? 0) : f.money(-line.withholding);

  return (
    <article className="qg-payslip" aria-labelledby={IDS.sheet}>
      <div className="qg-payslip__head">
        <div>
          <p className="qg-payslip__brand">{t("print.sheet.brand")}</p>
          <p className="qg-payslip__site">{site}</p>
        </div>
        <div className="qg-payslip__doc">
          <h2 className="qg-payslip__doc-title" id={IDS.sheet}>
            {t("print.sheet.title")}
          </h2>
          <p className="qg-payslip__doc-meta">{t("print.sheet.year", { year: values.taxYear })}</p>
          <p className="qg-payslip__doc-meta">{t("print.sheet.created", { date: created })}</p>
        </div>
      </div>

      <section className="qg-payslip__section" aria-labelledby={IDS.inputs}>
        <h3 className="qg-payslip__section-title" id={IDS.inputs}>
          {t("print.inputs.title")}
        </h3>
        <Cells cells={inputs} />
      </section>

      <section className="qg-payslip__section qg-payslip__narrow" aria-labelledby={IDS.linesNarrow}>
        <h3 className="qg-payslip__section-title" id={IDS.linesNarrow}>
          {t("print.lines.title")}
        </h3>
        <table className="qg-ledger">
          <caption className="qg-visually-hidden">
            {t("print.lines.caption", { year: values.taxYear })}
          </caption>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id}>
                <th scope="row">
                  <span className="qg-ledger__term">
                    <span className="qg-ledger__name">
                      {line.name}
                      {line.withholding !== null && (
                        <span className="qg-visually-hidden">{t("ledger.deducted")}</span>
                      )}
                    </span>
                    <span className="qg-ledger__rule">{line.rule}</span>
                  </span>
                </th>
                <td className="qg-ledger__num">{signed(line)}</td>
              </tr>
            ))}
            <tr className="qg-ledger__row--subtotal">
              <th scope="row">
                <span className="qg-ledger__term">
                  <span className="qg-ledger__name">{t("print.lines.totalWithheld")}</span>
                </span>
              </th>
              <td className="qg-ledger__num">{f.money(-summary.withholdings)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="qg-payslip__section qg-payslip__wide" aria-labelledby={IDS.lines}>
        <h3 className="qg-payslip__section-title" id={IDS.lines}>
          {t("print.lines.title")}
        </h3>
        <table className="qg-payslip__table">
          <caption className="qg-visually-hidden">
            {t("print.lines.caption", { year: values.taxYear })}
          </caption>
          <thead>
            <tr>
              <th scope="col">{t("print.lines.item")}</th>
              <th scope="col" className="qg-payslip__num">
                {t("print.lines.base")}
              </th>
              <th scope="col" className="qg-payslip__num">
                {t("print.lines.rate")}
              </th>
              <th scope="col" className="qg-payslip__num">
                {t("print.lines.earnings")}
              </th>
              <th scope="col" className="qg-payslip__num">
                {t("print.lines.withholdings")}
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id}>
                <th scope="row">{line.name}</th>
                <td className="qg-payslip__num">{line.base}</td>
                <td className="qg-payslip__num qg-payslip__rate">{line.rate}</td>
                <td className="qg-payslip__num">{amount(line.earning)}</td>
                <td className="qg-payslip__num">{amount(line.withholding)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">{t("print.lines.totals")}</th>
              <td className="qg-payslip__num" />
              <td className="qg-payslip__num" />
              <td className="qg-payslip__num">{f.money(summary.earnings)}</td>
              <td className="qg-payslip__num">{f.money(summary.withholdings)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="qg-payslip__section" aria-labelledby={IDS.tax}>
        <h3 className="qg-payslip__section-title" id={IDS.tax}>
          {t("print.tax.title")}
        </h3>
        <Cells cells={tax} extraClass="qg-payslip__cells--row" />
      </section>

      <div className="qg-payslip__summary">
        <dl className="qg-payslip__facts">
          <div className="qg-payslip__fact">
            <dt>{t("print.summary.monthly", { count: values.paymentFrequency })}</dt>
            <dd>{f.money(summary.netMonthly)}</dd>
          </div>
          <div className="qg-payslip__fact">
            <dt>{t("print.summary.tfr")}</dt>
            <dd>{f.money(b.tfrAnnual)}</dd>
          </div>
          <div className="qg-payslip__fact">
            <dt>{t("print.summary.withheld")}</dt>
            <dd>
              {b.grossAnnual > 0 ? formatPercent(b.totalTaxes / b.grossAnnual, f.locale, 2) : "0%"}
            </dd>
          </div>
        </dl>
        <div className="qg-payslip__net">
          <p className="qg-payslip__net-label">{t("print.summary.net")}</p>
          <p className="qg-payslip__net-value">{f.money(summary.netAnnual)}</p>
        </div>
      </div>

      <div className="qg-payslip__foot">
        <p>{t("print.foot.estimate")}</p>
        {checked !== null && (
          <p>
            {t("print.foot.checked", {
              date: checked.date,
              pending: checked.pending > 0 ? "yes" : "no",
              count: checked.pending,
              sources: sourcesText,
            })}
          </p>
        )}
        <p>
          {rt("print.foot.recalculate", {
            link: (
              <a className="qg-payslip__link" href={recalculate.href}>
                {recalculate.text}
              </a>
            ),
          })}
        </p>
      </div>
    </article>
  );
}

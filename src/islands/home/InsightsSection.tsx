import {
  BracketIndicator,
  InsightList,
  RaiseImpact,
  YearComparison,
} from "@/components/result/Insights.tsx";
import { Topics } from "@/components/result/Topics.tsx";
import { SUPPORTED_YEARS, type SupportedYear } from "@/data/index.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import { useLocale, useRichT, useT } from "@/i18n/react.tsx";
import { hrefFor } from "@/routePaths.ts";
import type { EmployeeResult } from "./compute.ts";
import { contractAssumption, type EmployeeDerived } from "./derive.ts";
import { impatriatiBase } from "./impatriati.ts";
import { Amount, type ViewFormat } from "./viewFormat.tsx";
import { IDS } from "./viewIds.ts";

export interface InsightsSectionProps {
  readonly result: EmployeeResult;
  readonly derived: EmployeeDerived;
  readonly f: ViewFormat;
}

const TAPER_TOLERANCE = 0.01;

function bracketChange(year: SupportedYear) {
  const previous = SUPPORTED_YEARS.find((candidate) => candidate === year - 1);
  if (previous === undefined) return null;
  const now = getTaxConfig(year).irpefBrackets;
  const before = getTaxConfig(previous).irpefBrackets;
  if (now.length !== before.length) return null;
  const index = now.findIndex((bracket, position) => bracket.rate !== before[position]?.rate);
  const bracket = now[index];
  const old = before[index];
  if (bracket === undefined || old === undefined || bracket.max === null) return null;
  return { min: bracket.min, max: bracket.max, from: old.rate, to: bracket.rate };
}

export function InsightsSection({ result, derived, f }: InsightsSectionProps) {
  const t = useT();
  const rt = useRichT();
  const locale = useLocale();
  const { bracket, raise, yearComparison } = derived;
  const year = result.values.taxYear;
  const count = result.values.paymentFrequency;
  const reduced = impatriatiBase(result);
  const income = <Amount>{f.money(reduced?.taxed ?? result.breakdown.taxableIncome)}</Amount>;
  const subject = reduced === null ? "taxable" : "impatriati";
  const change = bracketChange(year);

  const bracketText = () => {
    if (bracket === null) return "";
    const current = bracket.brackets[bracket.currentIndex];
    if (current === undefined) return "";
    const rate = <Amount>{f.percent(current.rate)}</Amount>;
    const article = f.article(current.rate);
    const distance = <Amount>{f.money(bracket.distanceToNext ?? 0)}</Amount>;
    const min = <Amount>{f.whole(current.min)}</Amount>;
    if (bracket.currentIndex === 0)
      return rt("employee.bracket.first", { subject, income, article, rate, distance });
    if (bracket.distanceToNext === null)
      return rt("employee.bracket.top", { subject, income, article, rate, min });
    return rt("employee.bracket.middle", { subject, income, article, rate, min, distance });
  };

  const keptCents = Math.round(raise.keptShare * 100);
  const inpsRate = contractAssumption(result.values).employeeInpsRate;
  const expectedWithheld = inpsRate + (1 - inpsRate) * raise.marginalTaxRate;
  const tapers = raise.withheldShare - expectedWithheld > TAPER_TOLERANCE;
  const hasCredits =
    result.breakdown.sommaAggiuntiva > 0 || result.breakdown.trattamentoIntegrativo > 0;
  const bracketRate = bracket?.brackets[bracket.currentIndex]?.rate ?? 0;

  return (
    <>
      <InsightList>
        {bracket !== null && (
          <BracketIndicator
            headingId={IDS.bracketHeading}
            title={t("employee.bracket.title")}
            bands={bracket.brackets.map((band, index) => ({
              id: String(index),
              rate: f.percent(band.rate),
              range:
                band.max === null
                  ? t("employee.bracket.above", { min: f.whole(band.min) })
                  : band.min === 0
                    ? t("employee.bracket.upTo", { max: f.whole(band.max) })
                    : t("employee.bracket.range", {
                        min: f.whole(band.min).replace(/\s?€/, ""),
                        max: f.whole(band.max),
                      }),
            }))}
            currentIndex={bracket.currentIndex}
            progress={bracket.progress}
            text={bracketText()}
          />
        )}
        <RaiseImpact
          headingId={IDS.raiseHeading}
          title={t("employee.raise.title", { amount: f.whole(raise.increment) })}
          figure={f.signed(raise.netGainAnnual)}
          unit={t("employee.raise.unit")}
          text={
            raise.netGainAnnual >= 0
              ? rt("employee.raise.gain", {
                  monthly: <Amount>{f.money(raise.netGainMonthly)}</Amount>,
                  count,
                  cents: keptCents,
                  taper: tapers ? (hasCredits ? "crediti" : "detrazioni") : "none",
                  article: f.article(bracketRate),
                  rate: <Amount>{f.percent(bracketRate)}</Amount>,
                })
              : rt("employee.raise.loss", {
                  monthly: <Amount>{f.money(-raise.netGainMonthly)}</Amount>,
                })
          }
          note={rt("employee.raise.note", {
            rate: <Amount>{f.percent(Math.round(raise.withheldShare * 10_000) / 10_000)}</Amount>,
          })}
        />
        <YearComparison
          headingId={IDS.yearsHeading}
          title={t("employee.years.title")}
          caption={t("employee.years.caption", { gross: f.money(result.breakdown.grossAnnual) })}
          columns={{
            year: t("employee.years.column.year"),
            net: t("employee.years.column.net"),
            delta: t("employee.years.column.delta", { year }),
          }}
          rows={yearComparison.map((row) => ({
            year: row.year,
            net: f.money(row.netAnnual),
            delta: row.selected
              ? t("employee.years.selected")
              : Math.abs(row.deltaAnnual) < 0.005
                ? t("employee.years.same")
                : f.signed(row.deltaAnnual),
            selected: row.selected,
          }))}
          {...(change === null
            ? {}
            : {
                note: rt("employee.years.bracketChange", {
                  year,
                  min: <Amount>{f.whole(change.min).replace(/\s?€/, "")}</Amount>,
                  max: <Amount>{f.whole(change.max)}</Amount>,
                  direction: change.to < change.from ? "down" : "up",
                  fromArticle: f.article(change.from),
                  from: <Amount>{f.percent(change.from)}</Amount>,
                  toArticle: f.article(change.to),
                  to: <Amount>{f.percent(change.to)}</Amount>,
                }),
              })}
        />
      </InsightList>
      <Topics
        headingId={IDS.topicsHeading}
        title={t("employee.topics.title")}
        topics={[
          {
            id: "passaggi",
            summary: t("employee.topic.steps"),
            body: (
              <>
                <p>{t("employee.topic.steps.body")}</p>
                <p>
                  <a className="qg-topic__link" href={hrefFor("method", locale)}>
                    {t("employee.topic.steps.link")}
                  </a>
                </p>
              </>
            ),
          },
          {
            id: "scaglioni",
            summary: t("employee.topic.brackets", {
              first: SUPPORTED_YEARS[0] ?? year,
              last: SUPPORTED_YEARS.at(-1) ?? year,
            }),
            body: <p>{t("employee.topic.brackets.body")}</p>,
          },
          {
            id: "cuneo",
            summary: t("employee.topic.wedge"),
            body: <p>{t("employee.topic.wedge.body")}</p>,
          },
          {
            id: "addizionali",
            summary: t("employee.topic.surcharges"),
            body: <p>{t("employee.topic.surcharges.body")}</p>,
          },
          {
            id: "busta-paga",
            summary: t("employee.topic.payslip"),
            body: <p>{t("employee.topic.payslip.body")}</p>,
          },
        ]}
      />
    </>
  );
}

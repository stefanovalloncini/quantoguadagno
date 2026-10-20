import { PageIntro } from "@/components/page/PageIntro.tsx";
import { Pager, type PagerLink } from "@/components/page/Pager.tsx";
import { NoteLine } from "@/components/result/Assumptions.tsx";
import { ResultFigure } from "@/components/result/ResultFigure.tsx";
import { latestVerification } from "@/data/index.ts";
import { splitSalaryYear } from "@/domain/tredicesima.ts";
import type { Namespace } from "@/i18n/messages/index.ts";
import { formatDate } from "@/i18n/numbers.ts";
import { I18nProvider, useLocale, useRichT, useT } from "@/i18n/react.tsx";
import { valuesToVerify } from "@/islands/home/trust.ts";
import { Amount, useViewFormat } from "@/islands/home/viewFormat.tsx";
import { netTablePath } from "@/islands/netTable/amounts.ts";
import { calculatorResult } from "@/islands/netTable/calculatorView.ts";
import { CityTable } from "@/islands/netTable/CityTable.tsx";
import { LedgerBand } from "@/islands/netTable/LedgerBand.tsx";
import { calculatorHref, employerCostHref } from "@/islands/netTable/links.ts";
import {
  MONTH_COUNTS,
  monthlyOf,
  REFERENCE_FREQUENCY,
  type AmountPage,
} from "@/islands/netTable/model.ts";
import { placeName, scenarioText } from "@/islands/netTable/present.ts";
import { UnderstandBand } from "@/islands/netTable/UnderstandBand.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";
import { hrefFor } from "@/routePaths.ts";

/** The catalogs an amount page reads: the calculator's result strings and its own. */
export const NET_AMOUNT_NAMESPACES: readonly Namespace[] = [
  "layout",
  "form",
  "employee",
  "netTable",
];

const IDS = {
  figure: "netto-titolo",
  ledger: "dettaglio-titolo",
  months: "mensilita-titolo",
  cities: "capoluoghi-titolo",
  raise: "aumento-titolo",
  employer: "costo-titolo",
  understand: "capire-titolo",
} as const;

interface ContentProps {
  readonly page: AmountPage;
}

function NetAmountContent({ page }: ContentProps) {
  const t = useT();
  const rt = useRichT();
  const f = useViewFormat();
  const locale = useLocale();
  const result = calculatorResult(page, locale);
  const split = splitSalaryYear(result.input, result.breakdown);
  const { breakdown: b, residence, year, raise } = page;
  const city = placeName(residence.comuneName);
  const gross = f.whole(page.gross);
  const money = (value: number) => <Amount>{f.money(value)}</Amount>;
  const checked = latestVerification();
  const pending = valuesToVerify(result.values);
  const amountLink = (amount: number | null): PagerLink | null =>
    amount === null
      ? null
      : {
          href: netTablePath(amount, locale),
          label: t("netTable.page.crumb", { gross: f.whole(amount) }),
        };
  const cityNames = (rows: typeof page.lowest) =>
    f.list(rows.map((row) => placeName(row.residence.comuneName)));
  const [low] = page.lowest;
  const [high] = page.highest;
  const raiseKey = raise.netGainAnnual >= 0 ? "netTable.raise.gain" : "netTable.raise.loss";

  return (
    <div className="qg-netpage">
      <PageIntro
        title={t("netTable.page.title", { gross, year })}
        lede={scenarioText(t, residence)}
      />
      <div className="qg-netpage__result">
        <ResultFigure
          headingId={IDS.figure}
          label={t("employee.result.label")}
          state="ready"
          value={f.money(b.netMonthly)}
          basis={t("employee.result.basis", { count: REFERENCE_FREQUENCY })}
          subLines={[
            ...(split === null
              ? []
              : [
                  rt("employee.result.split", {
                    ordinary: <strong>{f.money(split.ordinaryMonth)}</strong>,
                    extra: <strong>{f.money(split.extraMonth)}</strong>,
                    count: split.extraMonths,
                  }),
                ]),
            rt("employee.result.annual", { amount: <strong>{f.money(b.netAnnual)}</strong> }),
          ]}
        />
        <p className="qg-netpage__action">
          <a className="qg-button" href={calculatorHref(locale, year, residence, page.gross)}>
            {t("netTable.action")}
          </a>
        </p>
        <div className="qg-netpage__notes">
          <NoteLine term={t("result.estimate.term")}>
            {t("employee.result.estimate")}
            {checked !== null && (
              <>
                {" "}
                {rt("employee.result.trust", {
                  checked: (
                    <a href={hrefFor("sources", locale)}>
                      {t("employee.result.verified", {
                        date: formatDate(new Date(checked), locale),
                      })}
                    </a>
                  ),
                  pending: pending > 0 ? "yes" : "no",
                  count: pending,
                })}
              </>
            )}
          </NoteLine>
          <NoteLine>
            {t("netTable.page.comuneSource", {
              city,
              ruleYear: residence.ruleYear,
              carried: residence.ruleYear < year ? "yes" : "no",
              year,
            })}
          </NoteLine>
        </div>
      </div>

      <LedgerBand page={page} result={result} headingId={IDS.ledger} />

      <section className="qg-section qg-band" aria-labelledby={IDS.months}>
        <h2 className="qg-heading" id={IDS.months}>
          {t("netTable.months.title")}
        </h2>
        <p className="qg-netpage__text">
          {rt("netTable.months.lead", { net: money(page.row.netAnnual) })}
        </p>
        <table className="qg-table qg-netpage__narrow">
          <caption className="qg-visually-hidden">
            {t("netTable.months.caption", { gross })}
          </caption>
          <thead>
            <tr>
              <th scope="col">{t("netTable.months.column.count")}</th>
              <th scope="col" className="qg-table__num">
                {t("netTable.months.column.net")}
              </th>
            </tr>
          </thead>
          <tbody>
            {MONTH_COUNTS.map((count) => (
              <tr key={count}>
                <th scope="row">{t("netTable.months.row", { count })}</th>
                <td className="qg-table__num">{f.money(monthlyOf(page.row, count))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="qg-section qg-band" aria-labelledby={IDS.cities}>
        <h2 className="qg-heading" id={IDS.cities}>
          {t("netTable.cities.title")}
        </h2>
        {low !== undefined && high !== undefined && (
          <p className="qg-netpage__text">
            {rt("netTable.cities.lead", {
              gross: <Amount>{gross}</Amount>,
              low: money(low.netAnnual),
              lowCities: cityNames(page.lowest),
              high: money(high.netAnnual),
              highCities: cityNames(page.highest),
            })}
          </p>
        )}
        <CityTable
          caption={t("netTable.cities.caption", { year, gross })}
          cities={page.cities}
          count={REFERENCE_FREQUENCY}
          hrefOf={(row) => calculatorHref(locale, year, row.residence, page.gross)}
        />
        <NoteLine>{t("netTable.cities.note", { city })}</NoteLine>
      </section>

      <section className="qg-section qg-band" aria-labelledby={IDS.raise}>
        <h2 className="qg-heading" id={IDS.raise}>
          {t("netTable.raise.title", { amount: f.whole(raise.increment) })}
        </h2>
        <p className="qg-netpage__text">
          {rt(raiseKey, {
            gross: <Amount>{f.whole(page.gross + raise.increment)}</Amount>,
            annual: money(Math.abs(raise.netGainAnnual)),
            monthly: money(raise.netGainMonthly),
            count: REFERENCE_FREQUENCY,
            cents: Math.round(raise.keptShare * 100),
          })}
        </p>
      </section>

      <section className="qg-section qg-band" aria-labelledby={IDS.employer}>
        <h2 className="qg-heading" id={IDS.employer}>
          {t("netTable.employer.title")}
        </h2>
        <p className="qg-netpage__text">
          {rt("netTable.employer.body", {
            gross: <Amount>{gross}</Amount>,
            cost: money(page.employerCost),
            inps: money(b.employerInps),
            tfr: money(b.tfrAnnual),
            other: money(b.totalOtherEmployerCosts),
          })}
        </p>
        <p className="qg-netpage__text">
          <a href={employerCostHref(locale, year, residence, page.gross)}>
            {t("netTable.employer.link")}
          </a>
        </p>
      </section>

      <Pager
        label={t("netTable.pager.label")}
        previousTitle={t("netTable.pager.previous")}
        nextTitle={t("netTable.pager.next")}
        previous={amountLink(page.previous)}
        next={amountLink(page.next)}
        all={{ href: hrefFor("netTable", locale), label: t("netTable.pager.all") }}
      />

      <UnderstandBand headingId={IDS.understand} />
    </div>
  );
}

export interface NetAmountPageProps extends IslandProps {
  readonly page: AmountPage;
}

export default function NetAmountPage({ locale, messages, page }: NetAmountPageProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <NetAmountContent page={page} />
    </I18nProvider>
  );
}

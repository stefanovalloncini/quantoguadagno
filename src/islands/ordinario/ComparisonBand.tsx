import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon.tsx";
import { NoteLine } from "@/components/result/Assumptions.tsx";
import { getAutonomiConfig, getTaxConfig } from "@/domain/taxConfig.ts";
import { useRichT, useT } from "@/i18n/react.tsx";
import { Amount, type ViewFormat } from "@/islands/home/viewFormat.tsx";
import { hrefFor } from "@/routePaths.ts";
import type { OrdinarioResult } from "./compute.ts";
import { hasMinimum } from "./state.ts";
import { IDS } from "./viewIds.ts";

const SAME_NET = 0.005;

interface Row {
  readonly id: string;
  readonly label: string;
  readonly ordinario: number;
  readonly forfettario: number;
  readonly deducted: boolean;
}

export interface ComparisonBandProps {
  readonly result: OrdinarioResult;
  readonly f: ViewFormat;
}

function ComparisonTable({ result, f }: ComparisonBandProps) {
  const t = useT();
  const { breakdown: b, comparison: c, values } = result;
  const columns = {
    ordinario: t("ordinario.compare.column.ordinario"),
    forfettario: t("ordinario.compare.column.forfettario"),
    difference: t("ordinario.compare.column.difference"),
  };
  const rows: readonly Row[] = [
    {
      id: "revenue",
      label: t("ordinario.compare.row.revenue"),
      ordinario: b.revenue,
      forfettario: c.forfettario.revenue,
      deducted: false,
    },
    {
      id: "costs",
      label: t("ordinario.compare.row.costs"),
      ordinario: -b.costs,
      forfettario: -b.costs,
      deducted: true,
    },
    {
      id: "contributions",
      label: t("ordinario.compare.row.contributions"),
      ordinario: -b.contributions,
      forfettario: -c.forfettario.contributoInps,
      deducted: true,
    },
    {
      id: "taxes",
      label: t("ordinario.compare.row.taxes"),
      ordinario: -b.totalTaxes,
      forfettario: -c.forfettario.impostaSostitutiva,
      deducted: true,
    },
  ];
  const cells = (ordinario: number, forfettario: number, difference: number) => (
    <>
      <td role="cell" className="qg-table__num qg-table__pair" data-label={columns.ordinario}>
        {f.money(ordinario)}
      </td>
      <td role="cell" className="qg-table__num qg-table__pair" data-label={columns.forfettario}>
        {f.money(forfettario)}
      </td>
      <td role="cell" className="qg-table__num qg-table__pair" data-label={columns.difference}>
        {f.signed(difference)}
      </td>
    </>
  );
  return (
    <table className="qg-table qg-table--stack" role="table">
      <caption>
        {t("ordinario.compare.caption", { year: values.taxYear })}
        <span className="qg-table__caption-note">{t("ordinario.compare.captionNote")}</span>
      </caption>
      <thead role="rowgroup">
        <tr role="row">
          <th scope="col" role="columnheader">
            {t("ordinario.compare.column.item")}
          </th>
          <th scope="col" role="columnheader" className="qg-table__num">
            {columns.ordinario}
          </th>
          <th scope="col" role="columnheader" className="qg-table__num">
            {columns.forfettario}
          </th>
          <th scope="col" role="columnheader" className="qg-table__num">
            {columns.difference}
          </th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        {rows.map((row) => (
          <tr role="row" key={row.id}>
            <th scope="row" role="rowheader" className="qg-table__primary">
              {row.label}
              {row.deducted && <span className="qg-visually-hidden">{t("ledger.deducted")}</span>}
            </th>
            {cells(row.ordinario, row.forfettario, row.forfettario - row.ordinario)}
          </tr>
        ))}
        <tr role="row" className="qg-table__total">
          <th scope="row" role="rowheader" className="qg-table__primary">
            {t("ordinario.compare.row.net")}
          </th>
          {cells(b.netAnnual, c.netAnnual, c.difference)}
        </tr>
      </tbody>
    </table>
  );
}

function verdict(result: OrdinarioResult, f: ViewFormat, rt: ReturnType<typeof useRichT>) {
  const { comparison: c } = result;
  const net = <strong>{f.money(c.netAnnual)}</strong>;
  const difference = <strong>{f.money(Math.abs(c.difference))}</strong>;
  if (Math.abs(c.difference) < SAME_NET) return rt("ordinario.compare.same", { net });
  return rt(c.difference > 0 ? "ordinario.compare.more" : "ordinario.compare.less", {
    net,
    difference,
  });
}

export function ComparisonBand({ result, f }: ComparisonBandProps) {
  const t = useT();
  const rt = useRichT();
  const { comparison: c, values, coefficient } = result;
  const limits = getTaxConfig(values.taxYear).forfettario;
  let body: ReactNode;
  if (!c.eligible) {
    body = (
      <div className="qg-notice">
        <div className="qg-notice__head">
          <Icon name="alert" size="lg" />
          <p className="qg-notice__title">{t("ordinario.compare.overTitle")}</p>
        </div>
        <div className="qg-notice__body">
          <p>
            {rt("ordinario.compare.over", {
              revenue: <Amount>{f.money(result.breakdown.revenue)}</Amount>,
              limit: <Amount>{f.whole(limits.maxRevenue)}</Amount>,
            })}
          </p>
        </div>
      </div>
    );
  } else {
    const discount = getAutonomiConfig(values.taxYear).forfettarioDiscount;
    body = (
      <>
        <p>{verdict(result, f, rt)}</p>
        <ComparisonTable result={result} f={f} />
        <div className="qg-notes">
          <NoteLine>
            {rt("ordinario.compare.how", {
              rateArticle: f.article(c.forfettario.aliquotaSostitutiva),
              rate: <Amount>{f.percent(c.forfettario.aliquotaSostitutiva)}</Amount>,
              coefficientArticle: f.article(coefficient),
              coefficient: <Amount>{f.percent(coefficient)}</Amount>,
            })}
          </NoteLine>
          {hasMinimum(values.gestion) && (
            <NoteLine>
              {rt("ordinario.compare.discount", {
                article: f.article(discount),
                discount: <Amount>{f.percent(discount)}</Amount>,
              })}
            </NoteLine>
          )}
          {values.gestion === "cassa-professionale" && (
            <NoteLine>{t("ordinario.compare.cassa")}</NoteLine>
          )}
          <NoteLine>
            {rt("ordinario.compare.limits", {
              link: <a href={hrefFor("forfettario", f.locale)}>{t("ordinario.compare.link")}</a>,
            })}
          </NoteLine>
        </div>
      </>
    );
  }
  return (
    <section className="qg-section qg-band qg-band--narrow" aria-labelledby={IDS.comparisonHeading}>
      <h2 className="qg-heading" id={IDS.comparisonHeading}>
        {t("ordinario.compare.title")}
      </h2>
      {body}
    </section>
  );
}

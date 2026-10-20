import { useRegionText } from "@/components/form/regionText.ts";
import type { PaymentFrequency } from "@/data/index.ts";
import { useT } from "@/i18n/react.tsx";
import { useViewFormat } from "@/islands/home/viewFormat.tsx";
import type { CityRow } from "./model.ts";
import { placeName } from "./present.ts";

export interface CityTableProps {
  readonly caption: string;
  readonly cities: readonly CityRow[];
  readonly count: PaymentFrequency;
  readonly hrefOf: (city: CityRow) => string;
}

// One row per capoluogo, in the order of the region list of the calculator. The reference row
// says so in words; the weight only repeats it.
export function CityTable({ caption, cities, count, hrefOf }: CityTableProps) {
  const t = useT();
  const f = useViewFormat();
  const regions = useRegionText();
  const rows = regions.options.flatMap((option) => {
    const city = cities.find((candidate) => candidate.residence.region === option.value);
    return city === undefined ? [] : [{ city, region: option.label }];
  });
  return (
    <table className="qg-table qg-table--compact qg-table--stack" role="table">
      <caption className="qg-visually-hidden">{caption}</caption>
      <thead role="rowgroup">
        <tr role="row">
          <th scope="col" role="columnheader">
            {t("netTable.cities.column.region")}
          </th>
          <th scope="col" role="columnheader">
            {t("netTable.cities.column.city")}
          </th>
          <th scope="col" role="columnheader" className="qg-table__num">
            {t("netTable.column.net")}
          </th>
          <th scope="col" role="columnheader" className="qg-table__num">
            {t("netTable.column.monthly", { count })}
          </th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        {rows.map(({ city, region }) => (
          <tr
            role="row"
            key={city.residence.region}
            aria-current={city.reference ? "true" : undefined}
          >
            <th scope="row" role="rowheader" className="qg-table__primary">
              {region}
            </th>
            <td role="cell" className="qg-table__meta qg-table__meta--sep">
              <a href={hrefOf(city)}>{placeName(city.residence.comuneName)}</a>
              {city.reference && (
                <span className="qg-table__note">{t("netTable.cities.reference")}</span>
              )}
            </td>
            <td role="cell" className="qg-table__num qg-table__value">
              {f.money(city.netAnnual)}
            </td>
            <td role="cell" className="qg-table__num qg-table__meta">
              <span className="qg-table__inline-label" aria-hidden="true">
                {t("netTable.inline.monthly", { count })}{" "}
              </span>
              {f.money(city.netMonthly)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

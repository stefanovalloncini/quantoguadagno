import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { useLocale, useT } from "@/i18n/react.tsx";
import { hrefFor } from "@/routePaths.ts";
import { COMMON_AMOUNTS } from "./amounts.ts";
import { AmountTable } from "./AmountTable.tsx";
import { netRows, REFERENCE_FREQUENCY } from "./model.ts";
import { placeName, scenarioText } from "./present.ts";
import { referenceResidence } from "./residences.ts";

export interface CommonAmountsProps {
  readonly headingId: string;
}

// The amounts people look up most, each linked to its page, then the whole table.
export function CommonAmounts({ headingId }: CommonAmountsProps) {
  const t = useT();
  const locale = useLocale();
  const year = LATEST_SUPPORTED_YEAR;
  const residence = referenceResidence(year);
  return (
    <section className="qg-section qg-band qg-band--narrow" aria-labelledby={headingId}>
      <div className="qg-section__intro">
        <h2 className="qg-heading" id={headingId}>
          {t("netTable.home.title")}
        </h2>
        <p className="qg-section__hint">{scenarioText(t, residence)}</p>
      </div>
      <AmountTable
        caption={t("netTable.home.caption", { year, city: placeName(residence.comuneName) })}
        rows={netRows(COMMON_AMOUNTS, year, residence)}
        counts={[REFERENCE_FREQUENCY]}
      />
      <p>
        <a href={hrefFor("netTable", locale)}>{t("netTable.home.all")}</a>
      </p>
    </section>
  );
}

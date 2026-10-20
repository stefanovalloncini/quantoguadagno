import { PageIntro } from "@/components/page/PageIntro.tsx";
import { NoteLine } from "@/components/result/Assumptions.tsx";
import { LATEST_SUPPORTED_YEAR, type PaymentFrequency } from "@/data/index.ts";
import { I18nProvider, useLocale, useT } from "@/i18n/react.tsx";
import { NET_TABLE_AMOUNTS } from "@/islands/netTable/amounts.ts";
import { AmountTable } from "@/islands/netTable/AmountTable.tsx";
import { calculatorHref } from "@/islands/netTable/links.ts";
import { netRows } from "@/islands/netTable/model.ts";
import { placeName, scenarioText } from "@/islands/netTable/present.ts";
import { referenceResidence } from "@/islands/netTable/residences.ts";
import { UnderstandBand } from "@/islands/netTable/UnderstandBand.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";

const HUB_COUNTS: readonly PaymentFrequency[] = [13, 14];

const IDS = {
  table: "importi-titolo",
  understand: "capire-titolo",
} as const;

function NetTableHubContent() {
  const t = useT();
  const locale = useLocale();
  const year = LATEST_SUPPORTED_YEAR;
  const residence = referenceResidence(year);
  const rows = netRows(NET_TABLE_AMOUNTS, year, residence);
  return (
    <div className="qg-netpage">
      <PageIntro title={t("netTable.hub.title", { year })} lede={scenarioText(t, residence)} />
      <p className="qg-netpage__action">
        <a className="qg-button" href={calculatorHref(locale, year, residence)}>
          {t("netTable.action")}
        </a>
      </p>
      <section className="qg-section qg-band" aria-labelledby={IDS.table}>
        <h2 className="qg-heading" id={IDS.table}>
          {t("netTable.hub.table.title")}
        </h2>
        <AmountTable
          caption={t("netTable.hub.table.caption", {
            year,
            city: placeName(residence.comuneName),
          })}
          rows={rows}
          counts={HUB_COUNTS}
          withheld
          stacked
        />
        <NoteLine>{t("netTable.hub.withheld")}</NoteLine>
      </section>
      <UnderstandBand headingId={IDS.understand} />
    </div>
  );
}

export default function NetTableHub({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <NetTableHubContent />
    </I18nProvider>
  );
}

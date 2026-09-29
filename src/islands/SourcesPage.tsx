import { Disclosure } from "@/components/page/Disclosure.tsx";
import { Toc, type TocEntry } from "@/components/page/LongForm.tsx";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import {
  LATEST_SUPPORTED_YEAR,
  latestVerification,
  SUPPORTED_YEARS,
  type SupportedYear,
} from "@/data/index.ts";
import { I18nProvider, useLocale, useT } from "@/i18n/react.tsx";
import { dateText, yearsInProse } from "@/islands/prose/phrases.ts";
import type { IslandProps } from "@/islands/runtime/props.ts";
import type { Formatting } from "@/islands/sources/describe.ts";
import {
  changedParameterTable,
  datasetTable,
  keysThatDiffer,
  parameterCounts,
  parameterTable,
  todoItems,
} from "@/islands/sources/model.ts";
import { todoOverview } from "@/islands/sources/questions.ts";
import { groupAnchor, SourceTable } from "@/islands/sources/SourceTable.tsx";
import { TodoBlock } from "@/islands/sources/TodoBlock.tsx";

const PARAMETERS_ANCHOR = "parametri";

function earlierYears(): readonly SupportedYear[] {
  return SUPPORTED_YEARS.filter((year) => year !== LATEST_SUPPORTED_YEAR);
}

function PreviousYears({ f }: { readonly f: Formatting }) {
  const years = earlierYears();
  if (years.length === 0) return null;
  const latest = LATEST_SUPPORTED_YEAR;
  return (
    <section
      className="qg-section qg-band"
      id="anni-precedenti"
      aria-labelledby="anni-precedenti-titolo"
    >
      <div className="qg-section__intro">
        <h2 className="qg-heading" id="anni-precedenti-titolo">
          {f.t("sources.previous.title")}
        </h2>
        <p className="qg-section__hint">
          {f.t("sources.previous.hint", {
            years: yearsInProse(years, f.locale),
            latest,
          })}
        </p>
      </div>
      {years.toReversed().map((year) => {
        const groups = changedParameterTable(year, latest, f);
        const count = keysThatDiffer(year, latest).length;
        return (
          <Disclosure
            key={year}
            showLabel={f.t("sources.previous.show", { year, count })}
            hideLabel={f.t("sources.previous.hide", { year })}
          >
            <SourceTable
              caption={f.t("sources.previous.caption", { year, latest })}
              nameHeader={f.t("sources.column.parameter")}
              groups={groups}
            />
          </Disclosure>
        );
      })}
    </section>
  );
}

function SourcesPageContent() {
  const t = useT();
  const locale = useLocale();
  const f: Formatting = { locale, t };
  const year = LATEST_SUPPORTED_YEAR;
  const counts = parameterCounts(year);
  const checked = latestVerification();
  const overview = todoOverview(todoItems(f), year, f);
  const parameterGroups = parameterTable(year, f);
  const hasTodo = overview.questions.length > 0 || overview.others.length > 0;
  const contents: readonly TocEntry[] = [
    ...(hasTodo ? [{ id: "da-verificare", label: t("sources.todo.title") }] : []),
    ...parameterGroups.map((group) => ({
      id: groupAnchor(PARAMETERS_ANCHOR, group.id),
      label: group.label,
    })),
    { id: "dati", label: t("sources.data.title") },
    ...(earlierYears().length > 0
      ? [{ id: "anni-precedenti", label: t("sources.previous.title") }]
      : []),
  ];
  return (
    <>
      <PageIntro
        title={t("sources.title")}
        lede={t("sources.lede")}
        meta={t("sources.meta", {
          total: counts.total,
          year,
          verified: counts.verified,
          date: checked === null ? t("sources.check.missing") : dateText(checked, locale),
        })}
      />
      <Toc title={t("sources.toc")} entries={contents} layout="grid" />
      <TodoBlock overview={overview} />
      <section
        className="qg-section qg-band"
        id={PARAMETERS_ANCHOR}
        aria-labelledby="parametri-titolo"
      >
        <div className="qg-section__intro">
          <h2 className="qg-heading" id="parametri-titolo">
            {t("sources.parameters.title")}
          </h2>
          <p className="qg-section__hint">{t("sources.parameters.hint", { year })}</p>
        </div>
        <SourceTable
          caption={t("sources.parameters.caption", { year })}
          nameHeader={t("sources.column.parameter")}
          groups={parameterGroups}
          anchorPrefix={PARAMETERS_ANCHOR}
        />
      </section>
      <section className="qg-section qg-band" id="dati" aria-labelledby="dati-titolo">
        <div className="qg-section__intro">
          <h2 className="qg-heading" id="dati-titolo">
            {t("sources.data.title")}
          </h2>
          <p className="qg-section__hint">{t("sources.data.hint")}</p>
        </div>
        <SourceTable
          caption={t("sources.data.caption")}
          nameHeader={t("sources.column.data")}
          groups={datasetTable(f)}
        />
      </section>
      <PreviousYears f={f} />
    </>
  );
}

export default function SourcesPage({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <SourcesPageContent />
    </I18nProvider>
  );
}

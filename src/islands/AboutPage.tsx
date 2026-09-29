import { LongForm, type TocEntry } from "@/components/page/LongForm.tsx";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import { LATEST_SUPPORTED_YEAR, SUPPORTED_YEARS } from "@/data/index.ts";
import { I18nProvider, useLocale, useT } from "@/i18n/react.tsx";
import { yearsInProse } from "@/islands/prose/phrases.ts";
import type { IslandProps } from "@/islands/runtime/props.ts";
import { parameterCounts } from "@/islands/sources/model.ts";
import { hrefFor } from "@/routePaths.ts";
import { SOURCE_REPOSITORY_URL } from "@/sourceRepository.ts";

const SECTION_TITLE = {
  "cosa-calcola": "about.what.title",
  limiti: "about.limits.title",
  dati: "about.data.title",
  privacy: "about.privacy.title",
  codice: "about.code.title",
} as const;

type SectionId = keyof typeof SECTION_TITLE;

const SECTIONS = (Object.keys(SECTION_TITLE) as SectionId[]).filter(
  (id) => id !== "codice" || SOURCE_REPOSITORY_URL !== null,
);

function AboutPageContent() {
  const t = useT();
  const locale = useLocale();
  const year = LATEST_SUPPORTED_YEAR;
  const counts = parameterCounts(year);
  const toc: readonly TocEntry[] = SECTIONS.map((id) => ({ id, label: t(SECTION_TITLE[id]) }));
  const heading = (id: SectionId) => <h2 id={id}>{t(SECTION_TITLE[id])}</h2>;
  return (
    <>
      <PageIntro title={t("about.title")} lede={t("about.lede")} />
      <LongForm tocTitle={t("about.toc")} toc={toc}>
        {heading("cosa-calcola")}
        <p>{t("about.what.body", { years: yearsInProse(SUPPORTED_YEARS, locale) })}</p>
        <p>
          <a className="qg-action" href={hrefFor("method", locale)}>
            {t("about.what.link")}
          </a>
        </p>

        {heading("limiti")}
        <p>{t("about.limits.estimate")}</p>
        <p>{t("about.limits.advice")}</p>

        {heading("dati")}
        <p>
          {t("about.data.body", {
            total: counts.total,
            year,
            verified: counts.verified,
            toVerify: counts.toVerify,
          })}
        </p>
        <p>
          <a className="qg-action" href={hrefFor("sources", locale)}>
            {t("about.data.link")}
          </a>
        </p>

        {heading("privacy")}
        <p>{t("about.privacy.calculation")}</p>
        <p>{t("about.privacy.storage")}</p>
        <p>{t("about.privacy.links")}</p>

        {SOURCE_REPOSITORY_URL !== null && (
          <>
            {heading("codice")}
            <p>{t("about.code.body")}</p>
            <p>
              <a className="qg-action" href={SOURCE_REPOSITORY_URL} rel="noreferrer">
                {t("about.code.link")}
              </a>
            </p>
          </>
        )}
      </LongForm>
    </>
  );
}

export default function AboutPage({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <AboutPageContent />
    </I18nProvider>
  );
}

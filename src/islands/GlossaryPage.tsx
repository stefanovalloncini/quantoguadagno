import { Fragment } from "react";
import { LongForm } from "@/components/page/LongForm.tsx";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { I18nProvider, useLocale, useT } from "@/i18n/react.tsx";
import { glossarySections } from "@/islands/glossary/terms.ts";
import type { IslandProps } from "@/islands/runtime/props.ts";
import { hrefFor } from "@/routePaths.ts";

function GlossaryPageContent() {
  const t = useT();
  const locale = useLocale();
  const sections = glossarySections({ locale, t });
  const toc = sections.map((section) => ({ id: section.id, label: section.title }));
  return (
    <>
      <PageIntro
        title={t("glossario.title")}
        lede={t("glossario.lede", { year: LATEST_SUPPORTED_YEAR })}
      />
      <LongForm tocTitle={t("glossario.toc")} toc={toc}>
        {sections.map((section) => (
          <Fragment key={section.id}>
            <h2 id={section.id}>{section.title}</h2>
            <dl className="qg-terms">
              {section.terms.map((term) => (
                <div className="qg-terms__item" id={term.id} key={term.id}>
                  <dt className="qg-terms__term">{term.term}</dt>
                  <dd className="qg-terms__definition">{term.definition}</dd>
                </div>
              ))}
            </dl>
          </Fragment>
        ))}
        <p>
          <a className="qg-action" href={hrefFor("method", locale)}>
            {t("glossario.method")}
          </a>
        </p>
      </LongForm>
    </>
  );
}

export default function GlossaryPage({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <GlossaryPageContent />
    </I18nProvider>
  );
}

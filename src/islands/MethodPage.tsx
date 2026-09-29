import { Fragment } from "react";
import { Icon } from "@/components/icons/Icon.tsx";
import { LongForm, type TocEntry } from "@/components/page/LongForm.tsx";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import type { Source } from "@/data/index.ts";
import { I18nProvider, useLocale, useT } from "@/i18n/react.tsx";
import { methodExample } from "@/islands/method/example.ts";
import {
  methodContent,
  type BracketTable,
  type Citation,
  type LedgerLine,
  type Sentence,
} from "@/islands/method/content.ts";
import { deductionText, moneyText } from "@/islands/prose/phrases.ts";
import type { IslandProps } from "@/islands/runtime/props.ts";
import { hrefFor } from "@/routePaths.ts";

const SECTIONS = [
  "inps",
  "irpef",
  "detrazioni",
  "addizionali",
  "crediti",
  "arrotondamenti",
  "limiti",
  "fonti",
] as const;

type SectionId = (typeof SECTIONS)[number];

const SECTION_TITLE: Readonly<Record<SectionId, string>> = {
  inps: "method.inps.title",
  irpef: "method.irpef.title",
  detrazioni: "method.deductions.title",
  addizionali: "method.surcharges.title",
  crediti: "method.credits.title",
  arrotondamenti: "method.rounding.title",
  limiti: "method.limits.title",
  fonti: "method.sources.title",
};

const LIMITS = [
  "method.limits.contract",
  "method.limits.yearEnd",
  "method.limits.thirteenth",
  "method.limits.regional",
] as const;

function useReferenceLang(): string | undefined {
  return useLocale() === "it" ? undefined : "it";
}

function Paragraph({
  sentences,
  citations,
}: {
  readonly sentences: readonly Sentence[];
  readonly citations: readonly Citation[];
}) {
  const lang = useReferenceLang();
  return (
    <p>
      {sentences.map((sentence, index) => {
        const citation = citations.find((candidate) => candidate.id === sentence.cite);
        return (
          <Fragment key={sentence.text}>
            {index > 0 && " "}
            {sentence.text}
            {citation !== undefined && (
              <>
                {" "}
                <a href={`#${citation.anchor}`} lang={lang}>
                  {citation.label}
                </a>
              </>
            )}
            {"."}
          </Fragment>
        );
      })}
    </p>
  );
}

function Ledger({
  caption,
  lines,
}: {
  readonly caption: string;
  readonly lines: readonly LedgerLine[];
}) {
  const t = useT();
  const locale = useLocale();
  return (
    <table className="qg-ledger">
      <caption>{caption}</caption>
      <tbody>
        {lines.map((line) => (
          <tr key={line.id} className={line.subtotal ? "qg-ledger__row--subtotal" : undefined}>
            <th scope="row">
              <span className="qg-ledger__term">
                <span className="qg-ledger__name">
                  {line.name}
                  {line.subtracted && (
                    <span className="qg-visually-hidden">{t("method.ledger.subtracted")}</span>
                  )}
                </span>
                <span className="qg-ledger__rule">{line.rule}</span>
              </span>
            </th>
            <td className="qg-ledger__num">
              {line.subtracted
                ? deductionText(line.amount, locale)
                : moneyText(line.amount, locale)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Brackets({ table }: { readonly table: BracketTable }) {
  const t = useT();
  return (
    <table className="qg-table qg-table--compact qg-table--condensed">
      <caption>{t("method.irpef.table.caption")}</caption>
      <thead>
        <tr>
          <th scope="col">{t("method.irpef.table.income")}</th>
          {table.years.map((year) => (
            <th scope="col" className="qg-table__num" key={year}>
              {year}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            {row.rates.map((rate, index) => (
              <td className="qg-table__num" key={table.years[index]}>
                {rate}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReferenceText({ source }: { readonly source: Source }) {
  const lang = useReferenceLang();
  if (source.url === undefined) {
    return (
      <span className="qg-refs__reference" lang={lang}>
        {source.ref}
      </span>
    );
  }
  return (
    <a href={source.url} hrefLang="it" lang={lang} rel="noreferrer">
      {source.ref}
    </a>
  );
}

function References({ citations }: { readonly citations: readonly Citation[] }) {
  const t = useT();
  return (
    <ol className="qg-refs">
      {citations.map((citation) => (
        <li id={citation.anchor} key={citation.id}>
          <ReferenceText source={citation.source} />
          <span className="qg-refs__source">{citation.description}</span>
          {citation.source.verified === undefined && (
            <span className="qg-status qg-status--todo">
              <Icon name="alert" />
              {t("method.ref.todo")}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function MethodPageContent() {
  const t = useT();
  const locale = useLocale();
  const example = methodExample();
  const content = methodContent(example, { locale, t });
  const { citations } = content;
  const toc: readonly TocEntry[] = SECTIONS.map((id) => ({ id, label: t(SECTION_TITLE[id]) }));
  const exampleCaption = t("method.example", { year: example.year });
  const heading = (id: SectionId) => <h2 id={id}>{t(SECTION_TITLE[id])}</h2>;
  return (
    <>
      <PageIntro title={t("method.title")} lede={content.lede} meta={content.meta} />
      <LongForm tocTitle={t("method.toc")} toc={toc}>
        {heading("inps")}
        <Paragraph sentences={content.inps} citations={citations} />
        <Ledger caption={exampleCaption} lines={content.inpsLedger} />

        {heading("irpef")}
        <Paragraph sentences={content.irpef} citations={citations} />
        <Brackets table={content.bracketTable} />
        <Paragraph sentences={content.irpefWorked} citations={citations} />

        {heading("detrazioni")}
        <Paragraph sentences={content.deductions} citations={citations} />
        <Ledger caption={exampleCaption} lines={content.deductionLedger} />

        {heading("addizionali")}
        <Paragraph sentences={content.surcharges} citations={citations} />

        {heading("crediti")}
        <Paragraph sentences={content.credits} citations={citations} />

        {heading("arrotondamenti")}
        <Paragraph sentences={content.rounding} citations={citations} />

        {heading("limiti")}
        <ul>
          {LIMITS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>

        {heading("fonti")}
        <References citations={citations} />
        <p>
          <a className="qg-action" href={hrefFor("sources", locale)}>
            {t("method.sources.all")}
          </a>
        </p>
      </LongForm>
    </>
  );
}

export default function MethodPage({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <MethodPageContent />
    </I18nProvider>
  );
}

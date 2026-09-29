import { Icon } from "@/components/icons/Icon.tsx";
import { Disclosure } from "@/components/page/Disclosure.tsx";
import { NO_SOURCE_CITED } from "@/data/sources.ts";
import { useT } from "@/i18n/react.tsx";
import type { TodoEntry, TodoItem } from "./model.ts";
import type { TodoOverview } from "./questions.ts";
import { SourceReference } from "./SourceReference.tsx";

function uniqueSources(entries: readonly TodoEntry[]): readonly TodoEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const id = `${entry.source.ref}|${entry.source.url ?? ""}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function isCurrentAndCited(entry: TodoEntry): boolean {
  return entry.coversLatestYear && entry.source.ref !== NO_SOURCE_CITED.ref;
}

function EntryLines({ entries }: { readonly entries: readonly TodoEntry[] }) {
  const t = useT();
  const distinct = uniqueSources(entries);
  const showYears = distinct.length > 1;
  return (
    <>
      {distinct.map((entry) => (
        <p className="qg-todo__text qg-todo__source" key={`${entry.years}-${entry.source.ref}`}>
          {showYears && (
            <span className="qg-todo__years">
              {t("sources.todo.years", { years: entry.years })}{" "}
            </span>
          )}
          <SourceReference source={entry.source} />
        </p>
      ))}
    </>
  );
}

function OtherItem({ item }: { readonly item: TodoItem }) {
  return (
    <li className="qg-todo__item qg-todo__item--compact">
      <p className="qg-todo__name">{item.name}</p>
      <EntryLines entries={item.entries} />
    </li>
  );
}

export function TodoBlock({ overview }: { readonly overview: TodoOverview }) {
  const t = useT();
  const { questions, others } = overview;
  if (questions.length === 0 && others.length === 0) return null;
  return (
    <section className="qg-todo" id="da-verificare" aria-labelledby="da-verificare-titolo">
      <div className="qg-todo__head">
        <Icon name="alert" size="lg" />
        <h2 className="qg-heading" id="da-verificare-titolo">
          {t("sources.todo.title")}
        </h2>
      </div>
      <p className="qg-todo__text">{t("sources.todo.lede")}</p>
      <ul className="qg-todo__list" role="list">
        {questions.map((question) => (
          <li className="qg-todo__item" key={question.item.key}>
            <p className="qg-todo__name">{question.title}</p>
            <p className="qg-todo__text">{question.body}</p>
            <EntryLines entries={question.item.entries.filter(isCurrentAndCited)} />
          </li>
        ))}
        {others.length > 0 && (
          <li className="qg-todo__item">
            <p className="qg-todo__name">
              {t("sources.todo.others.title", { count: others.length })}
            </p>
            <p className="qg-todo__text">
              {t("sources.todo.others.body", { count: others.length })}
            </p>
            <Disclosure showLabel={t("sources.todo.show")} hideLabel={t("sources.todo.hide")}>
              <ul className="qg-todo__list" role="list">
                {others.map((item) => (
                  <OtherItem item={item} key={item.key} />
                ))}
              </ul>
            </Disclosure>
          </li>
        )}
      </ul>
    </section>
  );
}

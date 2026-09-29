import type { ReactNode } from "react";

export interface TocEntry {
  readonly id: string;
  readonly label: string;
}

interface TocProps {
  readonly title: string;
  readonly entries: readonly TocEntry[];
  readonly titleId?: string;
  readonly layout?: "column" | "grid";
}

export function Toc({ title, entries, titleId = "toc-title", layout = "column" }: TocProps) {
  return (
    <nav className={layout === "grid" ? "qg-toc qg-toc--grid" : "qg-toc"} aria-labelledby={titleId}>
      <h2 className="qg-toc__title" id={titleId}>
        {title}
      </h2>
      <ol className="qg-toc__list" role="list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a className="qg-toc__link" href={`#${entry.id}`}>
              {entry.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface LongFormProps {
  readonly tocTitle: string;
  readonly toc: readonly TocEntry[];
  readonly children: ReactNode;
}

export function LongForm({ tocTitle, toc, children }: LongFormProps) {
  return (
    <div className="qg-article">
      <Toc title={tocTitle} entries={toc} />
      <article className="qg-prose">{children}</article>
    </div>
  );
}

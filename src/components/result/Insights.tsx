import type { ReactNode } from "react";

export interface InsightListProps {
  readonly children: ReactNode;
}

export function InsightList({ children }: InsightListProps) {
  return <div className="qg-insights qg-band">{children}</div>;
}

interface InsightProps {
  readonly headingId: string;
  readonly title: ReactNode;
  readonly children: ReactNode;
}

function Insight({ headingId, title, children }: InsightProps) {
  return (
    <section className="qg-insight" aria-labelledby={headingId}>
      <h2 className="qg-insight__title" id={headingId}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export interface BracketBand {
  readonly id: string;
  readonly rate: string;
  readonly range: string;
}

export interface BracketIndicatorProps {
  readonly headingId: string;
  readonly title: ReactNode;
  readonly bands: readonly BracketBand[];
  readonly currentIndex: number;
  readonly progress: number | null;
  readonly text: ReactNode;
}

const TRACK_WIDTH = 100;

export function BracketIndicator({
  headingId,
  title,
  bands,
  currentIndex,
  progress,
  text,
}: BracketIndicatorProps) {
  const listClass = bands.length === 4 ? "qg-brackets qg-brackets--4" : "qg-brackets";
  return (
    <Insight headingId={headingId} title={title}>
      <ol className={listClass} role="list">
        {bands.map((band, index) => {
          const current = index === currentIndex;
          return (
            <li
              className={
                current ? "qg-brackets__band qg-brackets__band--current" : "qg-brackets__band"
              }
              key={band.id}
              aria-current={current ? true : undefined}
            >
              <span className="qg-brackets__rate">{band.rate}</span>
              <span className="qg-brackets__range">{band.range}</span>
              {current && progress !== null && (
                <svg
                  className="qg-brackets__track"
                  viewBox={`0 0 ${String(TRACK_WIDTH)} 4`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect
                    className="qg-brackets__track-bg"
                    x="0"
                    y="0"
                    width={TRACK_WIDTH}
                    height="4"
                  />
                  <rect
                    className="qg-brackets__track-fill"
                    x="0"
                    y="0"
                    width={Math.round(progress * TRACK_WIDTH * 10) / 10}
                    height="4"
                  />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
      <p className="qg-insight__text">{text}</p>
    </Insight>
  );
}

export interface RaiseImpactProps {
  readonly headingId: string;
  readonly title: ReactNode;
  readonly figure: string;
  readonly unit: ReactNode;
  readonly text: ReactNode;
  readonly note?: ReactNode;
}

export function RaiseImpact({ headingId, title, figure, unit, text, note }: RaiseImpactProps) {
  return (
    <Insight headingId={headingId} title={title}>
      <p className="qg-insight__figure">
        {figure}
        <span className="qg-insight__unit">{unit}</span>
      </p>
      <p className="qg-insight__text">{text}</p>
      {note !== undefined && <p className="qg-notes__line">{note}</p>}
    </Insight>
  );
}

export interface YearComparisonRow {
  readonly year: number;
  readonly net: string;
  readonly delta: string;
  readonly selected: boolean;
}

export interface YearComparisonProps {
  readonly headingId: string;
  readonly title: ReactNode;
  readonly caption: string;
  readonly columns: { readonly year: string; readonly net: string; readonly delta: string };
  readonly rows: readonly YearComparisonRow[];
  readonly note?: ReactNode;
}

export function YearComparison({
  headingId,
  title,
  caption,
  columns,
  rows,
  note,
}: YearComparisonProps) {
  return (
    <Insight headingId={headingId} title={title}>
      <table className="qg-table qg-table--compact">
        <caption className="qg-visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{columns.year}</th>
            <th scope="col" className="qg-table__num">
              {columns.net}
            </th>
            <th scope="col" className="qg-table__num">
              {columns.delta}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.year} aria-current={row.selected ? true : undefined}>
              <th scope="row">{row.year}</th>
              <td className="qg-table__num">{row.net}</td>
              <td className="qg-table__num">{row.delta}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {note !== undefined && <p className="qg-insight__text">{note}</p>}
    </Insight>
  );
}

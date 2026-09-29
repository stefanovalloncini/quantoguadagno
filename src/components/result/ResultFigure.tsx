import type { ReactNode, Ref } from "react";

export type FigureState = "ready" | "stale" | "empty";

export interface ResultFigureProps {
  readonly headingId: string;
  readonly label: ReactNode;
  readonly state: FigureState;
  readonly value?: string;
  readonly basis?: ReactNode;
  readonly sub?: ReactNode;
  readonly subLines?: readonly ReactNode[];
  readonly staleNote?: ReactNode;
  readonly prompt?: ReactNode;
  readonly size?: "large" | "small";
  readonly valueRef?: Ref<HTMLParagraphElement>;
  readonly labelTone?: "plain" | "answer";
}

export function ResultFigure({
  headingId,
  label,
  state,
  value,
  basis,
  sub,
  subLines = [],
  staleNote,
  prompt,
  size = "large",
  valueRef,
  labelTone = "plain",
}: ResultFigureProps) {
  const figureClass = state === "ready" ? "qg-figure" : `qg-figure qg-figure--${state}`;
  const valueClass =
    size === "small" ? "qg-figure__value qg-figure__value--sm" : "qg-figure__value";
  const labelClass =
    labelTone === "answer" ? "qg-figure__label qg-figure__label--answer" : "qg-figure__label";
  return (
    <div className={figureClass}>
      <h2 className={labelClass} id={headingId} tabIndex={-1}>
        {label}
      </h2>
      <div className="qg-figure__main">
        {state === "empty" || value === undefined ? (
          <p className="qg-figure__prompt">{prompt}</p>
        ) : (
          <>
            <p className={valueClass} key={value} ref={valueRef}>
              {value}
            </p>
            {basis !== undefined && <p className="qg-figure__basis">{basis}</p>}
          </>
        )}
      </div>
      {state !== "empty" && (
        <FigureFoot state={state} subs={sub === undefined ? subLines : [sub, ...subLines]}>
          {staleNote}
        </FigureFoot>
      )}
    </div>
  );
}

interface FigureFootProps {
  readonly state: "ready" | "stale";
  readonly subs: readonly ReactNode[];
  readonly children: ReactNode;
}

function FigureFoot({ state, subs, children: staleNote }: FigureFootProps) {
  const hasStaleNote = staleNote !== undefined && staleNote !== null;
  if (subs.length === 0 && !hasStaleNote) return null;
  const subsShown = state === "ready";
  const staleShown = state === "stale" && hasStaleNote;
  return (
    <div className="qg-figure__foot">
      {subs.length > 0 && (
        <div
          className={subsShown ? "qg-figure__subs" : "qg-figure__subs qg-figure__reserved"}
          aria-hidden={subsShown ? undefined : true}
        >
          {subs.map((line, index) => (
            <p className="qg-figure__sub" key={index}>
              {line}
            </p>
          ))}
        </div>
      )}
      {hasStaleNote && (
        <p
          className={staleShown ? "qg-figure__stale" : "qg-figure__stale qg-figure__reserved"}
          aria-hidden={staleShown ? undefined : true}
        >
          {staleNote}
        </p>
      )}
    </div>
  );
}

export interface FigureAsideProps {
  readonly shown: boolean;
  readonly children: ReactNode;
}

export function FigureAside({ shown, children }: FigureAsideProps) {
  return (
    <p
      className={shown ? "qg-figure__aside" : "qg-figure__aside qg-figure__reserved"}
      aria-hidden={shown ? undefined : true}
    >
      {children}
    </p>
  );
}

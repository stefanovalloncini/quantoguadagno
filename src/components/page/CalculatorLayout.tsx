import type { ReactNode } from "react";

interface CalculatorLayoutProps {
  readonly primary: ReactNode;
  readonly result: ReactNode;
  readonly rest?: ReactNode;
  readonly resultId?: string;
  readonly resultLabelledBy?: string;
  readonly restLabelledBy?: string;
}

export function CalculatorLayout({
  primary,
  result,
  rest,
  resultId,
  resultLabelledBy,
  restLabelledBy,
}: CalculatorLayoutProps) {
  return (
    <div className="qg-calc">
      <div className="qg-calc__primary">{primary}</div>
      {resultLabelledBy === undefined ? (
        <div className="qg-calc__result" id={resultId}>
          {result}
        </div>
      ) : (
        <section className="qg-calc__result" id={resultId} aria-labelledby={resultLabelledBy}>
          {result}
        </section>
      )}
      {rest !== undefined &&
        (restLabelledBy === undefined ? (
          <div className="qg-calc__rest">{rest}</div>
        ) : (
          <section className="qg-calc__rest" aria-labelledby={restLabelledBy}>
            {rest}
          </section>
        ))}
    </div>
  );
}

import type { ReactNode } from "react";

interface CalculatorLayoutProps {
  readonly primary: ReactNode;
  readonly result: ReactNode;
  readonly rest?: ReactNode;
  readonly resultId?: string;
  readonly resultLabelledBy?: string;
}

export function CalculatorLayout({
  primary,
  result,
  rest,
  resultId,
  resultLabelledBy,
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
      {rest !== undefined && <div className="qg-calc__rest">{rest}</div>}
    </div>
  );
}

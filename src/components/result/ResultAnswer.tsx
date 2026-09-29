import type { ReactNode } from "react";

export interface ResultAnswerProps {
  readonly headingId: string;
  readonly answer: ReactNode;
  readonly lines?: readonly ReactNode[];
}

export function ResultAnswer({ headingId, answer, lines = [] }: ResultAnswerProps) {
  return (
    <div className="qg-figure qg-figure--none">
      <div className="qg-figure__main">
        <h2 className="qg-figure__answer" id={headingId} tabIndex={-1}>
          {answer}
        </h2>
      </div>
      {lines.map((line, index) => (
        <p className="qg-figure__sub" key={index}>
          {line}
        </p>
      ))}
    </div>
  );
}

import type { ReactNode } from "react";

export interface NextStep {
  readonly id: string;
  readonly text: ReactNode;
}

export interface NextStepsProps {
  readonly headingId: string;
  readonly title: ReactNode;
  readonly steps: readonly NextStep[];
}

export function NextSteps({ headingId, title, steps }: NextStepsProps) {
  return (
    <section className="qg-reasons" aria-labelledby={headingId}>
      <h3 className="qg-reasons__title" id={headingId}>
        {title}
      </h3>
      <ul className="qg-reasons__list">
        {steps.map((step) => (
          <li key={step.id}>{step.text}</li>
        ))}
      </ul>
    </section>
  );
}

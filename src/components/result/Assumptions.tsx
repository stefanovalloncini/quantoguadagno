import type { ReactNode } from "react";
import { useT } from "@/i18n/react.tsx";

export interface AssumptionItem {
  readonly id: string;
  readonly text: ReactNode;
  readonly changeLabel: string;
  readonly targetId: string;
}

export interface FixedAssumption {
  readonly id: string;
  readonly text: ReactNode;
}

interface AssumptionsBase {
  readonly headingId: string;
  readonly title?: ReactNode;
  readonly fixed?: readonly FixedAssumption[];
}

interface ChangeableAssumptions<T extends AssumptionItem> {
  readonly items: readonly T[];
  readonly onChange: (item: T) => void;
}

interface FixedOnlyAssumptions {
  readonly items?: undefined;
  readonly onChange?: undefined;
}

export type AssumptionsProps<T extends AssumptionItem> = AssumptionsBase &
  (ChangeableAssumptions<T> | FixedOnlyAssumptions);

export function Assumptions<T extends AssumptionItem>({
  headingId,
  items = [],
  onChange,
  title,
  fixed = [],
}: AssumptionsProps<T>) {
  const t = useT();
  return (
    <section className="qg-assumptions" aria-labelledby={headingId}>
      <h3 className="qg-assumptions__title" id={headingId}>
        {title ?? t("result.assumptions.title")}
      </h3>
      <ul className="qg-assumptions__list" role="list">
        {items.map((item) => (
          <li className="qg-assumptions__item" key={item.id}>
            <span className="qg-assumptions__text">{item.text}</span>
            <a
              className="qg-assumptions__change"
              href={`#${item.targetId}`}
              onClick={(event) => {
                event.preventDefault();
                onChange?.(item);
              }}
            >
              {t("result.change")} <span className="qg-visually-hidden">{item.changeLabel}</span>
            </a>
          </li>
        ))}
        {fixed.map((item) => (
          <li className="qg-assumptions__item" key={item.id}>
            <span className="qg-assumptions__text">{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface NoteLineProps {
  readonly term?: ReactNode;
  readonly children: ReactNode;
}

export function NoteLine({ term, children }: NoteLineProps) {
  return (
    <p className="qg-notes__line">
      {term !== undefined && (
        <>
          <span className="qg-notes__term">{term}</span>{" "}
        </>
      )}
      {children}
    </p>
  );
}

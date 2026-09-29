import { useEffect, useId, useRef, type ReactNode } from "react";

export interface ErrorSummaryItem {
  readonly fieldId: string;
  readonly message: ReactNode;
}

export interface ErrorSummaryProps {
  readonly title: ReactNode;
  readonly errors: readonly ErrorSummaryItem[];
  readonly focusOnShow?: boolean;
}

export function ErrorSummary({ title, errors, focusOnShow = true }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const shown = errors.length > 0;

  useEffect(() => {
    if (shown && focusOnShow) ref.current?.focus();
  }, [shown, focusOnShow]);

  if (!shown) return null;
  return (
    <div
      className="qg-error-summary"
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-labelledby={titleId}
    >
      <h2 className="qg-error-summary__title" id={titleId}>
        {title}
      </h2>
      <ul className="qg-error-summary__list" role="list">
        {errors.map((error) => (
          <li key={error.fieldId}>
            <a
              className="qg-error-summary__link"
              href={`#${error.fieldId}`}
              onClick={(event) => {
                const field = document.getElementById(error.fieldId);
                if (field === null) return;
                event.preventDefault();
                field.focus();
              }}
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

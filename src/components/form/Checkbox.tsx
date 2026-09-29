import type { ReactNode } from "react";

export interface CheckboxProps {
  readonly id: string;
  readonly label: ReactNode;
  readonly checked: boolean;
  readonly onCheckedChange: (checked: boolean) => void;
  readonly name?: string;
  readonly hint?: ReactNode;
  readonly children?: ReactNode;
}

export function Checkbox({
  id,
  label,
  checked,
  onCheckedChange,
  name,
  hint,
  children,
}: CheckboxProps) {
  const hintId = hint === undefined ? undefined : `${id}-hint`;
  const revealId = children === undefined ? undefined : `${id}-reveal`;
  return (
    <div className="qg-check">
      <input
        className="qg-check__input"
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        aria-describedby={hintId}
        aria-controls={revealId}
        onChange={(event) => {
          onCheckedChange(event.target.checked);
        }}
      />
      <label className="qg-check__label" htmlFor={id}>
        {label}
      </label>
      {hint !== undefined && (
        <p className="qg-check__hint" id={hintId}>
          {hint}
        </p>
      )}
      {children !== undefined && (
        <div className="qg-check__reveal" id={revealId} hidden={!checked}>
          <div className="qg-field__reveal">{children}</div>
        </div>
      )}
    </div>
  );
}

import type { FocusEvent, Ref } from "react";
import type { ControlProps } from "@/components/form/Field.tsx";

export interface DateFieldProps extends ControlProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly name: string;
  readonly max?: string;
  readonly min?: string;
  readonly onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  readonly onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  readonly inputRef?: Ref<HTMLInputElement>;
}

export function DateField({
  id,
  describedBy,
  invalid,
  value,
  onValueChange,
  name,
  max,
  min,
  onFocus,
  onBlur,
  inputRef,
}: DateFieldProps) {
  return (
    <div className="qg-input">
      <input
        ref={inputRef}
        className="qg-input__control"
        id={id}
        name={name}
        type="date"
        max={max}
        min={min}
        value={value}
        aria-describedby={describedBy}
        aria-invalid={invalid ? true : undefined}
        onChange={(event) => {
          onValueChange(event.target.value);
        }}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
}

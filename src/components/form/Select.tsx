import type { FocusEventHandler, Ref } from "react";
import { Icon } from "@/components/icons/Icon.tsx";
import type { ControlProps } from "./Field.tsx";

export interface SelectOption<V extends string> {
  readonly value: V;
  readonly label: string;
}

export interface SelectProps<V extends string> extends ControlProps {
  readonly value: V;
  readonly options: readonly SelectOption<V>[];
  readonly onValueChange: (value: V) => void;
  readonly name?: string;
  readonly onBlur?: FocusEventHandler<HTMLSelectElement>;
  readonly selectRef?: Ref<HTMLSelectElement>;
}

export function Select<V extends string>({
  id,
  describedBy,
  invalid,
  value,
  options,
  onValueChange,
  name,
  onBlur,
  selectRef,
}: SelectProps<V>) {
  return (
    <div className="qg-select">
      <select
        ref={selectRef}
        className="qg-select__control"
        id={id}
        name={name}
        value={value}
        aria-describedby={describedBy}
        aria-invalid={invalid ? true : undefined}
        onChange={(event) => {
          const next = options.find((option) => option.value === event.target.value);
          if (next !== undefined) onValueChange(next.value);
        }}
        onBlur={onBlur}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" className="qg-select__icon" />
    </div>
  );
}

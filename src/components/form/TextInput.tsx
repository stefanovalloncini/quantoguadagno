import type { FocusEvent, Ref } from "react";
import { Icon } from "@/components/icons/Icon.tsx";
import type { IconName } from "@/components/icons/icons.ts";
import type { ControlProps } from "./Field.tsx";

export type InputWidth = "full" | "money" | "short";
export type UnitPosition = "start" | "end";

export interface TextInputProps extends ControlProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly name?: string;
  readonly inputMode?: "text" | "decimal" | "numeric" | "search";
  readonly width?: InputWidth;
  readonly unit?: string;
  readonly unitPosition?: UnitPosition;
  readonly icon?: IconName;
  readonly placeholder?: string;
  readonly autoComplete?: string;
  readonly spellCheck?: boolean;
  readonly onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  readonly onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  readonly inputRef?: Ref<HTMLInputElement>;
}

function wrapperClass(
  width: InputWidth,
  unit: string | undefined,
  position: UnitPosition,
  icon: boolean,
) {
  return [
    "qg-input",
    width === "full" ? null : `qg-input--${width}`,
    unit === undefined ? null : `qg-input--unit-${position}`,
    icon ? "qg-input--icon" : null,
  ]
    .filter((part) => part !== null)
    .join(" ");
}

export function TextInput({
  id,
  describedBy,
  invalid,
  value,
  onValueChange,
  name,
  inputMode = "text",
  width = "full",
  unit,
  unitPosition = "end",
  icon,
  placeholder,
  autoComplete = "off",
  spellCheck = false,
  onFocus,
  onBlur,
  inputRef,
}: TextInputProps) {
  return (
    <div className={wrapperClass(width, unit, unitPosition, icon !== undefined)}>
      {icon !== undefined && <Icon name={icon} className="qg-input__icon" />}
      <input
        ref={inputRef}
        className="qg-input__control"
        id={id}
        name={name}
        type="text"
        inputMode={inputMode}
        enterKeyHint="done"
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        placeholder={placeholder}
        value={value}
        aria-describedby={describedBy}
        aria-invalid={invalid ? true : undefined}
        onChange={(event) => {
          onValueChange(event.target.value);
        }}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {unit !== undefined && (
        <span className="qg-input__unit" aria-hidden="true">
          {unit}
        </span>
      )}
    </div>
  );
}

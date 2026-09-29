import type { ReactNode } from "react";
import { Fieldset, type FieldMessages } from "./Field.tsx";

export type RadioLayout = "segmented" | "fill" | "stacked";

export interface RadioOption<V extends string> {
  readonly value: V;
  readonly label: ReactNode;
  readonly hint?: ReactNode;
}

export interface RadioGroupProps<V extends string> extends FieldMessages {
  readonly idPrefix: string;
  readonly name: string;
  readonly legend: ReactNode;
  readonly value: V;
  readonly options: readonly RadioOption<V>[];
  readonly onValueChange: (value: V) => void;
  readonly layout?: RadioLayout;
}

export function radioId(idPrefix: string, value: string): string {
  return `${idPrefix}-${value}`;
}

interface OptionProps<V extends string> {
  readonly idPrefix: string;
  readonly name: string;
  readonly option: RadioOption<V>;
  readonly checked: boolean;
  readonly onValueChange: (value: V) => void;
}

function SegmentedOption<V extends string>({
  idPrefix,
  name,
  option,
  checked,
  onValueChange,
}: OptionProps<V>) {
  const id = radioId(idPrefix, option.value);
  return (
    <>
      <input
        className="qg-segmented__input"
        type="radio"
        name={name}
        id={id}
        value={option.value}
        checked={checked}
        onChange={() => {
          onValueChange(option.value);
        }}
      />
      <label className="qg-segmented__option" htmlFor={id}>
        {option.label}
      </label>
    </>
  );
}

function StackedOption<V extends string>({
  idPrefix,
  name,
  option,
  checked,
  onValueChange,
}: OptionProps<V>) {
  const id = radioId(idPrefix, option.value);
  const hintId = option.hint === undefined ? undefined : `${id}-hint`;
  return (
    <div className="qg-radio">
      <input
        className="qg-radio__input"
        type="radio"
        name={name}
        id={id}
        value={option.value}
        checked={checked}
        aria-describedby={hintId}
        onChange={() => {
          onValueChange(option.value);
        }}
      />
      <label className="qg-radio__label" htmlFor={id}>
        {option.label}
      </label>
      {option.hint !== undefined && (
        <p className="qg-radio__hint" id={hintId}>
          {option.hint}
        </p>
      )}
    </div>
  );
}

export function RadioGroup<V extends string>({
  idPrefix,
  name,
  legend,
  value,
  options,
  onValueChange,
  layout = "segmented",
  ...messages
}: RadioGroupProps<V>) {
  const Option = layout === "stacked" ? StackedOption : SegmentedOption;
  const listClass =
    layout === "stacked"
      ? "qg-radios"
      : layout === "fill"
        ? "qg-segmented qg-segmented--fill"
        : "qg-segmented";
  return (
    <Fieldset id={idPrefix} legend={legend} {...messages}>
      <div className={listClass}>
        {options.map((option) => (
          <Option
            key={option.value}
            idPrefix={idPrefix}
            name={name}
            option={option}
            checked={option.value === value}
            onValueChange={onValueChange}
          />
        ))}
      </div>
    </Fieldset>
  );
}

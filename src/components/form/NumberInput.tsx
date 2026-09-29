import { TextInput, type TextInputProps } from "./TextInput.tsx";

export type NumberKind = "integer" | "decimal" | "percent";

export type NumberInputProps = Omit<TextInputProps, "inputMode" | "unit" | "unitPosition"> & {
  readonly kind: NumberKind;
};

const PERCENT = "%";

export function NumberInput({ kind, width = "short", ...rest }: NumberInputProps) {
  return (
    <TextInput
      {...rest}
      width={width}
      inputMode={kind === "integer" ? "numeric" : "decimal"}
      {...(kind === "percent" ? { unit: PERCENT, unitPosition: "end" as const } : {})}
    />
  );
}

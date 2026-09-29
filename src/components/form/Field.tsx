import type { ReactNode } from "react";
import { useT } from "@/i18n/react.tsx";

export interface ControlProps {
  readonly id: string;
  readonly describedBy: string | undefined;
  readonly invalid: boolean;
}

export type AfterTone = "quiet" | "note";

export interface FieldMessages {
  readonly hint?: ReactNode;
  readonly error?: ReactNode;
  readonly after?: ReactNode;
  readonly afterTone?: AfterTone;
  readonly afterReserve?: readonly ReactNode[];
}

export interface FieldProps extends FieldMessages {
  readonly id: string;
  readonly label: ReactNode;
  readonly labelSuffix?: string;
  readonly alt?: ReactNode;
  readonly children: (control: ControlProps) => ReactNode;
}

export function describedByOf(id: string, messages: FieldMessages): string | undefined {
  const ids = [
    messages.hint === undefined ? null : `${id}-hint`,
    isShown(messages.error) ? `${id}-error` : null,
    messages.after === undefined ? null : `${id}-after`,
  ].filter((part): part is string => part !== null);
  return ids.length === 0 ? undefined : ids.join(" ");
}

export function isShown(message: ReactNode): boolean {
  return message !== undefined && message !== null && message !== false && message !== "";
}

interface FieldTextProps {
  readonly id: string;
  readonly messages: FieldMessages;
}

export function FieldHint({ id, messages }: FieldTextProps) {
  if (messages.hint === undefined) return null;
  return (
    <p className="qg-field__hint" id={`${id}-hint`}>
      {messages.hint}
    </p>
  );
}

export function FieldError({ id, messages }: FieldTextProps) {
  const t = useT();
  if (!isShown(messages.error)) return null;
  return (
    <p className="qg-field__error" id={`${id}-error`}>
      <span className="qg-visually-hidden">{t("field.error.prefix")}</span> {messages.error}
    </p>
  );
}

export function FieldAfter({ id, messages }: FieldTextProps) {
  if (messages.after === undefined) return null;
  const tone = messages.afterTone === "note" ? " qg-field__after--note" : "";
  const reserve = messages.afterReserve ?? [];
  if (reserve.length === 0) {
    return (
      <p className={`qg-field__after${tone}`} id={`${id}-after`}>
        {messages.after}
      </p>
    );
  }
  return (
    <p className={`qg-field__after qg-field__after--reserved${tone}`} id={`${id}-after`}>
      <span>{messages.after}</span>
      {reserve.map((text, index) => (
        <span className="qg-field__after-reserve" aria-hidden="true" key={index}>
          {text}
        </span>
      ))}
    </p>
  );
}

export function Field({ id, label, labelSuffix, alt, children, ...messages }: FieldProps) {
  const invalid = isShown(messages.error);
  return (
    <div className={invalid ? "qg-field qg-field--error" : "qg-field"}>
      <label className="qg-field__label" htmlFor={id}>
        {label}
        {labelSuffix !== undefined && (
          <>
            {" "}
            <span className="qg-visually-hidden">{labelSuffix}</span>
          </>
        )}
      </label>
      <FieldHint id={id} messages={messages} />
      <FieldError id={id} messages={messages} />
      {children({ id, describedBy: describedByOf(id, messages), invalid })}
      <FieldAfter id={id} messages={messages} />
      {alt}
    </div>
  );
}

export interface FieldsetProps extends FieldMessages {
  readonly id: string;
  readonly legend: ReactNode;
  readonly children: ReactNode;
}

export function Fieldset({ id, legend, children, ...messages }: FieldsetProps) {
  const invalid = isShown(messages.error);
  return (
    <fieldset
      className={invalid ? "qg-fieldset qg-field--error" : "qg-fieldset"}
      id={id}
      aria-describedby={describedByOf(id, messages)}
    >
      <legend className="qg-field__label">{legend}</legend>
      <FieldHint id={id} messages={messages} />
      <FieldError id={id} messages={messages} />
      {children}
      <FieldAfter id={id} messages={messages} />
    </fieldset>
  );
}

export interface FieldAltProps {
  readonly children: ReactNode;
  readonly stacked?: boolean;
}

export function FieldAlt({ children, stacked = false }: FieldAltProps) {
  if (stacked) return <div className="qg-field__alt qg-field__alt--stack">{children}</div>;
  return <p className="qg-field__alt">{children}</p>;
}

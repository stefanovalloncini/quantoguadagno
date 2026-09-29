import type { ReactNode } from "react";
import { getMessages } from "@/i18n/messages/index.ts";
import { I18nProvider } from "@/i18n/react.tsx";

const MESSAGES = getMessages("it", ["form", "employee"]);

export interface KitProviderProps {
  readonly children: ReactNode;
}

export function KitProvider({ children }: KitProviderProps) {
  return (
    <I18nProvider locale="it" messages={MESSAGES}>
      {children}
    </I18nProvider>
  );
}

export interface KitSpecimenProps {
  readonly label: string;
  readonly note?: ReactNode;
  readonly column?: boolean;
  readonly narrow?: boolean;
  readonly children: ReactNode;
}

export function KitSpecimen({
  label,
  note,
  column = false,
  narrow = false,
  children,
}: KitSpecimenProps) {
  const stage = column ? "sg-specimen__stage sg-specimen__stage--column" : "sg-specimen__stage";
  return (
    <div className="sg-specimen">
      <h3 className="sg-specimen__label">{label}</h3>
      {note !== undefined && <p className="sg-specimen__note">{note}</p>}
      <div className={stage}>
        {narrow ? <div className="sg-narrow sg-kit">{children}</div> : children}
      </div>
    </div>
  );
}

export function noop(): void {
  return undefined;
}

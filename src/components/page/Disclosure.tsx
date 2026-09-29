import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon.tsx";

interface DisclosureProps {
  readonly showLabel: string;
  readonly hideLabel: string;
  readonly children: ReactNode;
}

export function Disclosure({ showLabel, hideLabel, children }: DisclosureProps) {
  return (
    <details className="qg-disclosure">
      <summary className="qg-disclosure__summary">
        <span className="qg-disclosure__show">{showLabel}</span>
        <span className="qg-disclosure__hide">{hideLabel}</span>
        <Icon name="chevronDown" className="qg-disclosure__icon" />
      </summary>
      <div className="qg-disclosure__body">{children}</div>
    </details>
  );
}

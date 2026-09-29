import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon.tsx";

export interface DetailsGroupProps {
  readonly id: string;
  readonly title: ReactNode;
  readonly recap: ReactNode;
  readonly recapSet?: boolean;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly children: ReactNode;
}

export function DetailsGroup({
  id,
  title,
  recap,
  recapSet = false,
  open,
  onOpenChange,
  children,
}: DetailsGroupProps) {
  return (
    <details
      className="qg-group"
      id={id}
      open={open}
      onToggle={(event) => {
        const next = event.currentTarget.open;
        if (next !== open) onOpenChange(next);
      }}
    >
      <summary className="qg-group__summary">
        <span className="qg-group__text">
          <span className="qg-group__title">{title}</span>
          <span className={recapSet ? "qg-group__recap qg-group__recap--set" : "qg-group__recap"}>
            {recap}
          </span>
        </span>
        <Icon name="chevronDown" className="qg-group__icon" />
      </summary>
      <div className="qg-group__body">{children}</div>
    </details>
  );
}

export interface DetailsGroupListProps {
  readonly children: ReactNode;
}

export function DetailsGroupList({ children }: DetailsGroupListProps) {
  return <div className="qg-groups">{children}</div>;
}

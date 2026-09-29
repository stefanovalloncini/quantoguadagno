import { useState } from "react";
import { Icon } from "@/components/icons/Icon.tsx";
import type { IconName } from "@/components/icons/icons.ts";
import { useT } from "@/i18n/react.tsx";

export interface ActionLink {
  readonly id: string;
  readonly icon: IconName;
  readonly label: string;
  readonly href: string;
}

export interface ActionsProps {
  readonly links: readonly ActionLink[];
  readonly copyLink?: boolean;
}

type CopyState = "idle" | "copied" | "failed";

const COPY_LABEL: Readonly<Record<CopyState, string>> = {
  idle: "share.button.idle",
  copied: "share.button.copied",
  failed: "share.button.failed",
};

const COPY_RESET_MS = 4000;

async function copyPageLink(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch {
    return false;
  }
}

export function CopyLinkButton() {
  const t = useT();
  const [state, setState] = useState<CopyState>("idle");
  return (
    <>
      <button
        className="qg-action"
        type="button"
        onClick={() => {
          void copyPageLink().then((copied) => {
            setState(copied ? "copied" : "failed");
            window.setTimeout(() => {
              setState("idle");
            }, COPY_RESET_MS);
          });
        }}
      >
        <Icon name="link" />
        {t(COPY_LABEL.idle)}
      </button>
      <span className="qg-action__status" role="status">
        {state === "idle" ? "" : t(COPY_LABEL[state])}
      </span>
    </>
  );
}

export function Actions({ links, copyLink = false }: ActionsProps) {
  return (
    <ul className="qg-actions" role="list">
      {links.map((link) => (
        <li key={link.id}>
          <a className="qg-action" href={link.href}>
            <Icon name={link.icon} />
            {link.label}
          </a>
        </li>
      ))}
      {copyLink && (
        <li className="qg-actions__copy">
          <CopyLinkButton />
        </li>
      )}
    </ul>
  );
}

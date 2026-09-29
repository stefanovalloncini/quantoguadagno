import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/i18n/react.tsx";

export interface BottomBarProps {
  readonly label: ReactNode;
  readonly value: string;
  readonly targetId: string;
  readonly visible: boolean;
  readonly linkText?: ReactNode;
  readonly inline?: boolean;
}

function subscribeNever(): () => void {
  return () => undefined;
}

function onClient(): boolean {
  return true;
}

function onServer(): boolean {
  return false;
}

export function useIsClient(): boolean {
  return useSyncExternalStore(subscribeNever, onClient, onServer);
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function focusResultHeading(targetId: string): void {
  const heading = document.getElementById(targetId);
  if (heading === null) return;
  heading.focus({ preventScroll: true });
  heading.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

function BarLink({ label, value, targetId, visible, linkText }: BottomBarProps) {
  const t = useT();
  return (
    <a
      className="qg-netbar"
      href={`#${targetId}`}
      hidden={!visible}
      onClick={(event) => {
        event.preventDefault();
        focusResultHeading(targetId);
      }}
    >
      <span className="qg-netbar__text">
        <span className="qg-netbar__label">{label}</span>
        <span className="qg-netbar__value">{value}</span>
      </span>
      <span className="qg-netbar__link">{linkText ?? t("netbar.link")}</span>
    </a>
  );
}

export function BottomBar(props: BottomBarProps) {
  const client = useIsClient();
  if (props.inline === true) return <BarLink {...props} />;
  if (!client) return null;
  return createPortal(<BarLink {...props} />, document.body);
}

const TEXT_ENTRY_TYPES: ReadonlySet<string> = new Set([
  "text",
  "search",
  "email",
  "number",
  "tel",
  "url",
  "password",
]);

function isTextEntry(element: Element | null): boolean {
  if (element instanceof HTMLTextAreaElement) return true;
  if (element instanceof HTMLInputElement) return TEXT_ENTRY_TYPES.has(element.type);
  return element instanceof HTMLElement && element.isContentEditable;
}

const KEYBOARD_MIN_HEIGHT = 150;

function keyboardIsOpen(): boolean {
  const viewport = window.visualViewport;
  if (!viewport) return false;
  return window.innerHeight - viewport.height * viewport.scale > KEYBOARD_MIN_HEIGHT;
}

function useTypingState(): boolean {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const sync = (focused: Element | null) => {
      setTyping(isTextEntry(focused) || keyboardIsOpen());
    };
    const onFocusIn = (event: FocusEvent) => {
      sync(event.target instanceof Element ? event.target : null);
    };
    const onFocusOut = (event: FocusEvent) => {
      sync(event.relatedTarget instanceof Element ? event.relatedTarget : null);
    };
    const onResize = () => {
      sync(document.activeElement);
    };
    const viewport = window.visualViewport;
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    viewport?.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      viewport?.removeEventListener("resize", onResize);
    };
  }, []);
  return typing;
}

function useFullyVisible(target: Element | null): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (target === null || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry !== undefined)
          setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.99);
      },
      { threshold: [0, 0.5, 0.99, 1] },
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [target]);
  return visible;
}

export function useBottomBarVisible(target: Element | null, enabled: boolean): boolean {
  const figureVisible = useFullyVisible(enabled ? target : null);
  const typing = useTypingState();
  return enabled && target !== null && !figureVisible && !typing;
}

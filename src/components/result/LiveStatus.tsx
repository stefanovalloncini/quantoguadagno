import { useEffect, useState } from "react";

export const ANNOUNCE_DELAY_MS = 700;

export function useSettledAnnouncement(
  message: string | null,
  delayMs = ANNOUNCE_DELAY_MS,
): string {
  const [announced, setAnnounced] = useState("");
  useEffect(() => {
    if (message === null) return undefined;
    const timer = window.setTimeout(() => {
      setAnnounced(message);
    }, delayMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [message, delayMs]);
  return announced;
}

export interface LiveStatusProps {
  readonly message: string;
}

export function LiveStatus({ message }: LiveStatusProps) {
  return (
    <p className="qg-visually-hidden" role="status">
      {message}
    </p>
  );
}

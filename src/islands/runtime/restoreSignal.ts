export const RESTORE_KEYS_ATTRIBUTE = "data-restore-keys";
export const RESTORE_PENDING_ATTRIBUTE = "data-restoring";
export const RESTORE_TARGET_ATTRIBUTE = "data-restore-target";

export function signalRestored(): void {
  document.documentElement.removeAttribute(RESTORE_PENDING_ATTRIBUTE);
}

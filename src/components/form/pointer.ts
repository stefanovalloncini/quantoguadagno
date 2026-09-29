const RECENT_RELEASE_MS = 120;
const CLICK_WAIT_MS = 400;

let pointerIsDown = false;
let lastReleaseAt = Number.NEGATIVE_INFINITY;
let tracking = false;

function markDown(): void {
  pointerIsDown = true;
}

function markUp(): void {
  pointerIsDown = false;
  lastReleaseAt = performance.now();
}

export function trackPointer(): void {
  if (tracking || typeof document === "undefined") return;
  tracking = true;
  document.addEventListener("pointerdown", markDown, true);
  document.addEventListener("pointerup", markUp, true);
  document.addEventListener("pointercancel", markUp, true);
}

function pointerInteractionPending(): boolean {
  return pointerIsDown || performance.now() - lastReleaseAt < RECENT_RELEASE_MS;
}

export function afterPointerRelease(callback: () => void): void {
  if (!pointerInteractionPending()) {
    callback();
    return;
  }
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    document.removeEventListener("click", settle, true);
    window.clearTimeout(timer);
    window.setTimeout(callback, 0);
  };
  const timer = window.setTimeout(settle, CLICK_WAIT_MS);
  document.addEventListener("click", settle, true);
}

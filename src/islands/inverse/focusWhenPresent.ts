const FOCUS_ATTEMPTS = 30;

export function focusWhenPresent(id: string, attempt = 0): void {
  const element = document.getElementById(id);
  if (element !== null) {
    element.focus();
    return;
  }
  if (attempt < FOCUS_ATTEMPTS) {
    window.requestAnimationFrame(() => {
      focusWhenPresent(id, attempt + 1);
    });
  }
}

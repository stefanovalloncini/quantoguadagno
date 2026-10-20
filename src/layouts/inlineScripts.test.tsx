import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  RESTORE_KEYS_ATTRIBUTE,
  RESTORE_PENDING_ATTRIBUTE,
} from "@/islands/runtime/restoreSignal.ts";
import {
  disclosureScript,
  localeHintScript,
  netModeForwardScript,
  restoreScript,
  themeScript,
} from "./inlineScripts.ts";

const root = document.documentElement;
const cleanups: (() => void)[] = [];

function runInlineScript(source: string): void {
  const addEventListener = vi.spyOn(EventTarget.prototype, "addEventListener");
  const script = document.createElement("script");
  script.textContent = source;
  document.head.append(script);
  script.remove();
  addEventListener.mock.calls.forEach(([type, listener, options], index) => {
    const target: unknown = addEventListener.mock.contexts[index];
    if (target instanceof EventTarget && listener) {
      cleanups.push(() => {
        target.removeEventListener(type, listener, options);
      });
    }
  });
  addEventListener.mockRestore();
}

function stubColorScheme(prefersDark: boolean): void {
  runInlineScript(
    `window.matchMedia = function (query) { return { matches: ${String(prefersDark)}, media: query, addEventListener: function () {} }; };`,
  );
  cleanups.push(() => {
    runInlineScript("delete window.matchMedia;");
  });
}

function mount<T extends Element>(element: T): T {
  document.body.append(element);
  cleanups.push(() => {
    element.remove();
  });
  return element;
}

function mountThemeChoice(name = "theme"): HTMLInputElement[] {
  const fieldset = mount(document.createElement("fieldset"));
  fieldset.setAttribute("data-theme-toggle", "");
  return ["light", "dark", "system"].map((value) => {
    const input = document.createElement("input");
    input.type = "radio";
    input.name = name;
    input.value = value;
    fieldset.append(input);
    return input;
  });
}

function choose(input: HTMLInputElement | undefined): void {
  if (!input) throw new Error("Missing theme input");
  input.checked = true;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function checkedValue(inputs: readonly HTMLInputElement[]): string | undefined {
  return inputs.find((input) => input.checked)?.value;
}

interface Disclosure {
  readonly details: HTMLDetailsElement;
  readonly summary: HTMLElement;
  readonly link: HTMLAnchorElement;
  readonly closeButton: HTMLButtonElement;
}

function mountDisclosure(): Disclosure {
  const details = mount(document.createElement("details"));
  details.setAttribute("data-disclosure", "");
  const summary = document.createElement("summary");
  summary.textContent = "Menu";
  const link = document.createElement("a");
  link.href = "#menu";
  link.textContent = "Link";
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.setAttribute("data-disclosure-close", "");
  closeButton.textContent = "Chiudi il menu";
  details.append(summary, link, closeButton);
  details.open = true;
  return { details, summary, link, closeButton };
}

function pressEscape(target: Element): void {
  target.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  for (const name of root.getAttributeNames()) root.removeAttribute(name);
});

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  vi.restoreAllMocks();
});

describe("theme bootstrap", () => {
  it.each([
    ["dark", "dark", "dark"],
    ["light", "light", "light"],
    [null, "system", "light"],
    ["sepia", "system", "light"],
  ])("reads qg.theme %s as the %s choice rendered %s", (stored, choice, theme) => {
    if (stored !== null) localStorage.setItem("qg.theme", stored);
    runInlineScript(themeScript);
    expect(root.getAttribute("data-theme-choice")).toBe(choice);
    expect(root.getAttribute("data-theme")).toBe(theme);
  });

  it("follows the system preference when nothing is stored", () => {
    stubColorScheme(true);
    runInlineScript(themeScript);
    expect(root.getAttribute("data-theme-choice")).toBe("system");
    expect(root.getAttribute("data-theme")).toBe("dark");
  });

  it("falls back to the system choice when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    runInlineScript(themeScript);
    expect(root.getAttribute("data-theme-choice")).toBe("system");
  });

  it("stores the choice made on the radios in the values the live site reads", () => {
    localStorage.setItem("qg.theme", "light");
    const inputs = mountThemeChoice();
    runInlineScript(themeScript);
    expect(checkedValue(inputs)).toBe("light");

    choose(inputs[1]);
    expect(root.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("qg.theme")).toBe("dark");

    choose(inputs[2]);
    expect(root.getAttribute("data-theme-choice")).toBe("system");
    expect(localStorage.getItem("qg.theme")).toBeNull();

    choose(inputs[0]);
    expect(root.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("qg.theme")).toBe("light");
  });

  it("keeps every copy of the radios on the current choice", () => {
    localStorage.setItem("qg.theme", "dark");
    const menu = mountThemeChoice("menu-theme");
    const footer = mountThemeChoice("footer-theme");
    runInlineScript(themeScript);
    expect(checkedValue(menu)).toBe("dark");
    expect(checkedValue(footer)).toBe("dark");

    choose(footer[2]);
    expect(checkedValue(menu)).toBe("system");
  });

  it("ignores changes outside the theme radios", () => {
    runInlineScript(themeScript);
    const input = mount(document.createElement("input"));
    input.type = "radio";
    input.value = "dark";
    choose(input);
    expect(root.getAttribute("data-theme-choice")).toBe("system");
    expect(localStorage.getItem("qg.theme")).toBeNull();
  });

  it("paints the browser bar in the chosen theme", () => {
    const meta = mount(document.createElement("meta"));
    meta.setAttribute("name", "theme-color");
    meta.setAttribute("content", "#ffffff");
    localStorage.setItem("qg.theme", "dark");
    runInlineScript(themeScript);
    expect(meta.getAttribute("content")).toBe("#101010");
  });

  it("picks up a theme chosen in another tab", () => {
    runInlineScript(themeScript);
    localStorage.setItem("qg.theme", "dark");
    window.dispatchEvent(new StorageEvent("storage", { key: "qg.theme", newValue: "dark" }));
    expect(root.getAttribute("data-theme")).toBe("dark");
  });
});

describe("disclosures", () => {
  it("close on Escape from inside and give focus back to the summary", () => {
    const { details, summary, link } = mountDisclosure();
    runInlineScript(disclosureScript);
    link.focus();
    pressEscape(link);
    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(summary);
  });

  it("ignore Escape pressed outside them", () => {
    const { details } = mountDisclosure();
    runInlineScript(disclosureScript);
    pressEscape(document.body);
    expect(details.open).toBe(true);
  });

  it("stay open on a click outside them", () => {
    const { details } = mountDisclosure();
    runInlineScript(disclosureScript);
    document.body.click();
    expect(details.open).toBe(true);
  });

  it("close from their close button and give focus back to the summary", () => {
    const { details, summary, closeButton } = mountDisclosure();
    runInlineScript(disclosureScript);
    closeButton.click();
    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(summary);
  });
});

describe("English suggestion on Italian pages", () => {
  function mountHint(): { readonly link: HTMLAnchorElement; readonly close: HTMLButtonElement } {
    const main = mount(document.createElement("main"));
    main.id = "main";
    main.tabIndex = -1;
    const aside = mount(document.createElement("aside"));
    const link = document.createElement("a");
    link.href = "/en";
    link.hreflang = "en";
    link.textContent = "Read this page in English";
    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("data-locale-hint-close", "");
    close.textContent = "Close";
    aside.append(link, close);
    return { link, close };
  }

  it("shows for visitors who chose English on the old site", () => {
    localStorage.setItem("qg.locale", "en");
    root.setAttribute("data-locale-offer", "en");
    runInlineScript(localeHintScript);
    expect(root.hasAttribute("data-locale-hint")).toBe(true);
  });

  it.each([null, "it", "de"])("stays hidden when qg.locale is %s", (stored) => {
    if (stored !== null) localStorage.setItem("qg.locale", stored);
    root.setAttribute("data-locale-offer", "en");
    runInlineScript(localeHintScript);
    expect(root.hasAttribute("data-locale-hint")).toBe(false);
  });

  it("stays hidden on pages that offer no other language", () => {
    localStorage.setItem("qg.locale", "en");
    runInlineScript(localeHintScript);
    expect(root.hasAttribute("data-locale-hint")).toBe(false);
  });

  it("stays hidden when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    root.setAttribute("data-locale-offer", "en");
    runInlineScript(localeHintScript);
    expect(root.hasAttribute("data-locale-hint")).toBe(false);
  });

  it("remembers the dismissal and moves focus to the page content", () => {
    localStorage.setItem("qg.locale", "en");
    root.setAttribute("data-locale-offer", "en");
    const { close } = mountHint();
    runInlineScript(localeHintScript);
    close.click();
    expect(root.hasAttribute("data-locale-hint")).toBe(false);
    expect(localStorage.getItem("qg.locale")).toBeNull();
    expect(document.activeElement?.id).toBe("main");
    runInlineScript(localeHintScript);
    expect(root.hasAttribute("data-locale-hint")).toBe(false);
  });

  it("remembers the language picked from a language link", () => {
    root.setAttribute("data-locale-offer", "en");
    const { link } = mountHint();
    link.addEventListener("click", (event) => {
      event.preventDefault();
    });
    runInlineScript(localeHintScript);
    link.click();
    expect(localStorage.getItem("qg.locale")).toBe("en");
  });
});

describe("shared-link restore marker", () => {
  const keys = "l lordo y anno";

  it.each([
    ["/?l=35000", true],
    ["/?lordo=35000&utm_source=newsletter", true],
    ["/?fbclid=abc&utm_medium=social&utm_campaign=x", false],
    ["/?zz=1", false],
    ["/", false],
  ])("marks %s as restoring: %s", (url, restoring) => {
    window.history.replaceState(null, "", url);
    root.setAttribute(RESTORE_KEYS_ATTRIBUTE, keys);
    runInlineScript(restoreScript);
    expect(root.hasAttribute(RESTORE_PENDING_ATTRIBUTE)).toBe(restoring);
  });

  it("does nothing on pages without restore keys", () => {
    window.history.replaceState(null, "", "/?l=35000");
    runInlineScript(restoreScript);
    expect(root.hasAttribute(RESTORE_PENDING_ATTRIBUTE)).toBe(false);
  });
});

describe("netModeForwardScript", () => {
  const FORWARDED = "data-test-forwarded";

  function forwardFrom(search: string, hash = ""): string | null {
    const fake = `{ search: ${JSON.stringify(search)}, hash: ${JSON.stringify(hash)}, replace: function (url) { document.documentElement.setAttribute("${FORWARDED}", url); } }`;
    runInlineScript(
      `(function (location) {${netModeForwardScript("/calcolo-netto-lordo")}})(${fake});`,
    );
    const forwarded = root.getAttribute(FORWARDED);
    root.removeAttribute(FORWARDED);
    return forwarded;
  }

  it("leaves gross-mode and plain links alone", () => {
    expect(forwardFrom("")).toBeNull();
    expect(forwardFrom("?l=35000&y=2025")).toBeNull();
    expect(forwardFrom("?s=l&n=1800")).toBeNull();
  });

  it("forwards an old net-mode link with its context, turning the monthly net into an annual one", () => {
    expect(forwardFrom("?s=n&n=1800&y=2025&r=lazio&m=14&t=determinato&a=1&p=1&fbclid=x")).toBe(
      "/calcolo-netto-lordo?n=25200&y=2025&r=lazio&m=14&t=determinato&a=1&p=1",
    );
  });

  it("reads the legacy long names and assumes 13 payslips when the link has none", () => {
    expect(forwardFrom("?partenza=n&netto=1500&regione=veneto&comune=0.5", "#risultato")).toBe(
      "/calcolo-netto-lordo?n=19500&r=veneto&c=0.5#risultato",
    );
  });

  it("drops a net amount that is not a number", () => {
    expect(forwardFrom("?s=n&n=abc&y=2026")).toBe("/calcolo-netto-lordo?y=2026");
  });
});

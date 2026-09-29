import { act, fireEvent, render, screen } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeStored } from "./storage.ts";
import { LOCALE_STORE, SALARY_HISTORY_STORE, THEME_STORE } from "./storedKeys.ts";
import { useStoredState } from "./useStoredState.ts";

function ThemeProbe() {
  const [theme, setTheme] = useStoredState(THEME_STORE);
  return (
    <div>
      <output data-testid="theme">{theme}</output>
      <button
        type="button"
        onClick={() => {
          setTheme("dark");
        }}
      >
        dark
      </button>
      <button
        type="button"
        onClick={() => {
          setTheme("system");
        }}
      >
        system
      </button>
    </div>
  );
}

function LocaleProbe() {
  const [locale] = useStoredState(LOCALE_STORE);
  return <output data-testid="locale">{locale ?? "none"}</output>;
}

const ENTRY = {
  id: "e-1",
  year: 2024,
  grossAnnual: 32000,
  createdAt: "2024-05-01T10:00:00.000Z",
  settings: {
    contractType: "indeterminato",
    regionCode: "lombardia",
    municipalTaxRate: 0.008,
    paymentFrequency: 13,
  },
};

function HistoryProbe() {
  const [entries, setEntries] = useStoredState(SALARY_HISTORY_STORE);
  return (
    <div>
      <output data-testid="count">{entries.length}</output>
      <button
        type="button"
        onClick={() => {
          setEntries((current) => [...current, { ...ENTRY, id: "e-2", year: 2025 }]);
        }}
      >
        add
      </button>
    </div>
  );
}

function text(testId: string): string {
  return screen.getByTestId(testId).textContent;
}

describe("useStoredState with the live keys", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it.each([
    ["dark", "dark"],
    ["light", "light"],
    [null, "system"],
    ["sepia", "system"],
  ])("reads qg.theme %s as %s", (stored, expected) => {
    if (stored !== null) localStorage.setItem("qg.theme", stored);
    render(<ThemeProbe />);
    expect(text("theme")).toBe(expected);
  });

  it("writes qg.theme the way the live site does, as a bare string or no key for system", () => {
    render(<ThemeProbe />);
    fireEvent.click(screen.getByText("dark"));
    expect(localStorage.getItem("qg.theme")).toBe("dark");
    expect(text("theme")).toBe("dark");
    fireEvent.click(screen.getByText("system"));
    expect(localStorage.getItem("qg.theme")).toBeNull();
    expect(text("theme")).toBe("system");
  });

  it.each([
    ["en", "en"],
    ["it", "it"],
    ["fr", "none"],
    [null, "none"],
  ])("reads qg.locale %s as %s", (stored, expected) => {
    if (stored !== null) localStorage.setItem("qg.locale", stored);
    render(<LocaleProbe />);
    expect(text("locale")).toBe(expected);
  });

  it("reads and extends the salary history JSON array", () => {
    localStorage.setItem("qg.salary-history.v1", JSON.stringify([ENTRY]));
    render(<HistoryProbe />);
    expect(text("count")).toBe("1");
    fireEvent.click(screen.getByText("add"));
    expect(text("count")).toBe("2");
    const saved: unknown = JSON.parse(localStorage.getItem("qg.salary-history.v1") ?? "null");
    expect(saved).toEqual([ENTRY, { ...ENTRY, id: "e-2", year: 2025 }]);
  });

  it("treats a corrupt salary history as empty instead of crashing", () => {
    localStorage.setItem("qg.salary-history.v1", "{not json");
    render(<HistoryProbe />);
    expect(text("count")).toBe("0");
  });

  it("server-renders the empty snapshot and hydrates into the stored value", () => {
    localStorage.setItem("qg.theme", "dark");
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ThemeProbe />);
    document.body.append(container);
    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe("system");

    const onRecoverableError = vi.fn();
    let root: Root | undefined;
    act(() => {
      root = hydrateRoot(container, <ThemeProbe />, { onRecoverableError });
    });
    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe("dark");
    expect(onRecoverableError).not.toHaveBeenCalled();
    act(() => {
      root?.unmount();
    });
    container.remove();
  });

  it("follows changes made in another tab", () => {
    render(<ThemeProbe />);
    expect(text("theme")).toBe("system");
    act(() => {
      localStorage.setItem("qg.theme", "light");
      window.dispatchEvent(new StorageEvent("storage", { key: "qg.theme", newValue: "light" }));
    });
    expect(text("theme")).toBe("light");
  });

  it("keeps the value for the session when storage refuses to write", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
    try {
      render(<ThemeProbe />);
      fireEvent.click(screen.getByText("dark"));
      expect(text("theme")).toBe("dark");
      expect(localStorage.getItem("qg.theme")).toBeNull();
    } finally {
      setItem.mockRestore();
      act(() => {
        writeStored("qg.theme", null);
      });
    }
  });
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { QuerySpec } from "@/queryParams.ts";
import { RESTORE_PENDING_ATTRIBUTE } from "./restoreSignal.ts";
import {
  URL_WRITE_DELAY_MS,
  rawQueryState,
  useUrlState,
  type UrlStateConfig,
} from "./useUrlState.ts";

const PARAMS = { l: ["lordo"], y: ["anno"] } as const satisfies QuerySpec;

interface SalaryState {
  readonly gross: number;
  readonly year: number;
}

const DEFAULTS: SalaryState = { gross: 30000, year: 2026 };

function positive(raw: string | undefined, fallback: number): number {
  const value = Number(raw);
  return raw !== undefined && Number.isFinite(value) && value > 0 ? value : fallback;
}

const SALARY_URL_STATE: UrlStateConfig<SalaryState> = {
  params: PARAMS,
  initial: DEFAULTS,
  fromQuery: (values, initial) => ({
    gross: positive(values.l, initial.gross),
    year: positive(values.y, initial.year),
  }),
  toQuery: (state) => ({
    l: state.gross === DEFAULTS.gross ? undefined : String(state.gross),
    y: state.year === DEFAULTS.year ? undefined : String(state.year),
  }),
};

function SalaryProbe() {
  const [state, setState] = useUrlState(SALARY_URL_STATE);
  return (
    <div>
      <output data-testid="gross">{state.gross}</output>
      <output data-testid="year">{state.year}</output>
      <button
        type="button"
        onClick={() => {
          setState((current) => ({ ...current, gross: current.gross + 1000 }));
        }}
      >
        raise
      </button>
      <button
        type="button"
        onClick={() => {
          setState(DEFAULTS);
        }}
      >
        reset
      </button>
    </div>
  );
}

const RAW_URL_STATE = rawQueryState(PARAMS);

function RawProbe() {
  const [values, setValues] = useUrlState(RAW_URL_STATE);
  return (
    <div>
      <output data-testid="raw">{JSON.stringify(values)}</output>
      <button
        type="button"
        onClick={() => {
          setValues({ l: "2" });
        }}
      >
        change
      </button>
    </div>
  );
}

function visit(url: string) {
  window.history.replaceState(null, "", url);
}

function text(testId: string): string {
  return screen.getByTestId(testId).textContent;
}

function flushWrites() {
  act(() => {
    vi.advanceTimersByTime(URL_WRITE_DELAY_MS);
  });
}

describe("useUrlState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    visit("/");
    document.documentElement.removeAttribute(RESTORE_PENDING_ATTRIBUTE);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    visit("/");
  });

  it("applies the shared state on mount, legacy names included, and ends the restore", () => {
    visit("/?lordo=35000&anno=2025&fbclid=abc");
    document.documentElement.setAttribute(RESTORE_PENDING_ATTRIBUTE, "");
    render(<SalaryProbe />);
    expect(text("gross")).toBe("35000");
    expect(text("year")).toBe("2025");
    expect(document.documentElement.hasAttribute(RESTORE_PENDING_ATTRIBUTE)).toBe(false);
  });

  it("falls back to the defaults for values the page rejects", () => {
    visit("/?l=abc&y=-1");
    render(<SalaryProbe />);
    expect(text("gross")).toBe("30000");
    expect(text("year")).toBe("2026");
  });

  it("server-renders the defaults and hydrates into the shared state without a mismatch", () => {
    visit("/?l=42000");
    const container = document.createElement("div");
    container.innerHTML = renderToString(<SalaryProbe />);
    document.body.append(container);
    expect(container.querySelector('[data-testid="gross"]')?.textContent).toBe("30000");

    const onRecoverableError = vi.fn();
    let root: Root | undefined;
    act(() => {
      root = hydrateRoot(container, <SalaryProbe />, { onRecoverableError });
    });
    expect(container.querySelector('[data-testid="gross"]')?.textContent).toBe("42000");
    expect(onRecoverableError).not.toHaveBeenCalled();
    act(() => {
      root?.unmount();
    });
    container.remove();
  });

  it("leaves the address alone until the state changes", () => {
    visit("/?lordo=35000&fbclid=abc#calc");
    const replaceState = vi.spyOn(window.history, "replaceState");
    render(<SalaryProbe />);
    act(() => {
      vi.advanceTimersByTime(URL_WRITE_DELAY_MS * 4);
    });
    expect(replaceState).not.toHaveBeenCalled();
    expect(window.location.search).toBe("?lordo=35000&fbclid=abc");
  });

  it("writes the canonical query once after a burst of changes, keeping the hash", () => {
    visit("/?lordo=35000&fbclid=abc#calc");
    const replaceState = vi.spyOn(window.history, "replaceState");
    render(<SalaryProbe />);
    fireEvent.click(screen.getByText("raise"));
    fireEvent.click(screen.getByText("raise"));
    act(() => {
      vi.advanceTimersByTime(URL_WRITE_DELAY_MS - 1);
    });
    expect(replaceState).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(replaceState).toHaveBeenCalledTimes(1);
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("?l=37000");
    expect(window.location.hash).toBe("#calc");
  });

  it("clears the query when the state goes back to the defaults", () => {
    visit("/tfr?l=31000");
    render(<SalaryProbe />);
    expect(text("gross")).toBe("31000");
    fireEvent.click(screen.getByText("reset"));
    flushWrites();
    expect(window.location.pathname).toBe("/tfr");
    expect(window.location.search).toBe("");
  });

  it("does not write when a change lands back on what the address already says", () => {
    visit("/?l=31000");
    const replaceState = vi.spyOn(window.history, "replaceState");
    render(<SalaryProbe />);
    fireEvent.click(screen.getByText("reset"));
    fireEvent.click(screen.getByText("raise"));
    fireEvent.click(screen.getByText("raise"));
    expect(text("gross")).toBe("32000");
    fireEvent.click(screen.getByText("reset"));
    fireEvent.click(screen.getByText("raise"));
    flushWrites();
    expect(text("gross")).toBe("31000");
    expect(replaceState).not.toHaveBeenCalled();
  });

  it("keeps raw values for islands that have not typed their state yet", () => {
    visit("/?lordo=1&zz=9");
    render(<RawProbe />);
    expect(text("raw")).toBe('{"l":"1"}');
    fireEvent.click(screen.getByText("change"));
    flushWrites();
    expect(window.location.search).toBe("?l=2");
  });
});

import { StrictMode, useRef } from "react";
import { act, render, screen } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { QuerySpec } from "@/queryParams.ts";
import { findTypedControls, type FormControlValue } from "./formControls.ts";
import { useUrlState, type UrlStateConfig } from "./useUrlState.ts";
import { useHydratedFormValues, type TypedControlListener } from "./useHydratedFormValues.ts";

describe("findTypedControls", () => {
  it("ignores a text input the user never touched", () => {
    const container = document.createElement("div");
    container.innerHTML = '<input name="gross" value="30000">';
    expect(findTypedControls(container)).toEqual([]);
  });

  it("reports a text input whose live value drifted from the rendered default", () => {
    const container = document.createElement("div");
    container.innerHTML = '<input name="gross" value="30000">';
    const el = container.querySelector<HTMLInputElement>('[name="gross"]');
    if (!el) throw new Error("missing input");
    el.value = "31000";
    expect(findTypedControls(container)).toEqual([{ name: "gross", value: "31000" }]);
  });

  it("reports a textarea the same way as a text input", () => {
    const container = document.createElement("div");
    container.innerHTML = '<textarea name="note">hello</textarea>';
    const el = container.querySelector<HTMLTextAreaElement>('[name="note"]');
    if (!el) throw new Error("missing textarea");
    el.value = "hello there";
    expect(findTypedControls(container)).toEqual([{ name: "note", value: "hello there" }]);
  });

  it("reports a checkbox the user checked before hydration", () => {
    const container = document.createElement("div");
    container.innerHTML = '<input type="checkbox" name="agree">';
    const el = container.querySelector<HTMLInputElement>('[name="agree"]');
    if (!el) throw new Error("missing checkbox");
    el.checked = true;
    expect(findTypedControls(container)).toEqual([{ name: "agree", value: true }]);
  });

  it("reports a checkbox the user unchecked before hydration", () => {
    const container = document.createElement("div");
    container.innerHTML = '<input type="checkbox" name="agree" checked>';
    const el = container.querySelector<HTMLInputElement>('[name="agree"]');
    if (!el) throw new Error("missing checkbox");
    el.checked = false;
    expect(findTypedControls(container)).toEqual([{ name: "agree", value: false }]);
  });

  it("reports a radio group by name with the value of the newly checked radio", () => {
    const container = document.createElement("div");
    container.innerHTML =
      '<input type="radio" name="contract" value="indeterminato" checked>' +
      '<input type="radio" name="contract" value="determinato">';
    const picked = container.querySelector<HTMLInputElement>('[value="determinato"]');
    if (!picked) throw new Error("missing radio");
    picked.checked = true;
    expect(findTypedControls(container)).toEqual([{ name: "contract", value: "determinato" }]);
  });

  it("ignores a radio group left at its server-rendered default", () => {
    const container = document.createElement("div");
    container.innerHTML =
      '<input type="radio" name="contract" value="indeterminato" checked>' +
      '<input type="radio" name="contract" value="determinato">';
    expect(findTypedControls(container)).toEqual([]);
  });

  it("reports a select against the option marked selected in the markup", () => {
    const container = document.createElement("div");
    container.innerHTML =
      '<select name="region"><option value="lazio" selected>Lazio</option>' +
      '<option value="lombardia">Lombardia</option></select>';
    const el = container.querySelector<HTMLSelectElement>('[name="region"]');
    if (!el) throw new Error("missing select");
    el.value = "lombardia";
    expect(findTypedControls(container)).toEqual([{ name: "region", value: "lombardia" }]);
  });

  it("falls back to the first option when the markup marks none as selected", () => {
    const container = document.createElement("div");
    container.innerHTML =
      '<select name="region"><option value="lazio">Lazio</option>' +
      '<option value="lombardia">Lombardia</option></select>';
    const el = container.querySelector<HTMLSelectElement>('[name="region"]');
    if (!el) throw new Error("missing select");
    el.value = "lombardia";
    expect(findTypedControls(container)).toEqual([{ name: "region", value: "lombardia" }]);
  });

  it("ignores a control that has no name", () => {
    const container = document.createElement("div");
    container.innerHTML = '<input value="30000">';
    const el = container.querySelector<HTMLInputElement>("input");
    if (!el) throw new Error("missing input");
    el.value = "31000";
    expect(findTypedControls(container)).toEqual([]);
  });
});

function CountProbe({ onValueTyped }: { readonly onValueTyped: TypedControlListener }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useHydratedFormValues(containerRef, onValueTyped);
  return (
    <div ref={containerRef}>
      <input name="note" defaultValue="" />
    </div>
  );
}

interface FormState {
  readonly gross: number;
  readonly note: string;
  readonly agree: boolean;
  readonly region: string;
  readonly contract: string;
}

const DEFAULTS: FormState = {
  gross: 30_000,
  note: "",
  agree: false,
  region: "lazio",
  contract: "indeterminato",
};

const PARAMS = { l: ["lordo"] } as const satisfies QuerySpec;

function positive(raw: string | undefined, fallback: number): number {
  const value = Number(raw);
  return raw !== undefined && Number.isFinite(value) && value > 0 ? value : fallback;
}

const FORM_URL_STATE: UrlStateConfig<FormState> = {
  params: PARAMS,
  initial: DEFAULTS,
  fromQuery: (values, initial) => ({ ...initial, gross: positive(values.l, initial.gross) }),
  toQuery: (state) => ({ l: state.gross === DEFAULTS.gross ? undefined : String(state.gross) }),
};

function adopt(name: string, value: FormControlValue): Partial<FormState> {
  switch (name) {
    case "gross":
      return { gross: Number(value) };
    case "note":
      return { note: String(value) };
    case "agree":
      return { agree: Boolean(value) };
    case "region":
      return { region: String(value) };
    case "contract":
      return { contract: String(value) };
    default:
      return {};
  }
}

function FormProbe() {
  const [state, setState] = useUrlState(FORM_URL_STATE);
  const containerRef = useRef<HTMLDivElement>(null);
  useHydratedFormValues(containerRef, (name, value) => {
    setState((current) => ({ ...current, ...adopt(name, value) }));
  });
  return (
    <div ref={containerRef}>
      <input
        name="gross"
        value={state.gross}
        onChange={(event) => {
          setState((current) => ({ ...current, gross: Number(event.target.value) }));
        }}
      />
      <input
        name="note"
        value={state.note}
        onChange={(event) => {
          setState((current) => ({ ...current, note: event.target.value }));
        }}
      />
      <input
        type="checkbox"
        name="agree"
        checked={state.agree}
        onChange={(event) => {
          setState((current) => ({ ...current, agree: event.target.checked }));
        }}
      />
      <select
        name="region"
        value={state.region}
        onChange={(event) => {
          setState((current) => ({ ...current, region: event.target.value }));
        }}
      >
        <option value="lazio">Lazio</option>
        <option value="lombardia">Lombardia</option>
      </select>
      <input
        type="radio"
        name="contract"
        value="indeterminato"
        checked={state.contract === "indeterminato"}
        onChange={() => {
          setState((current) => ({ ...current, contract: "indeterminato" }));
        }}
      />
      <input
        type="radio"
        name="contract"
        value="determinato"
        checked={state.contract === "determinato"}
        onChange={() => {
          setState((current) => ({ ...current, contract: "determinato" }));
        }}
      />
      <output data-testid="gross">{state.gross}</output>
      <output data-testid="note">{state.note}</output>
      <output data-testid="agree">{String(state.agree)}</output>
      <output data-testid="region">{state.region}</output>
      <output data-testid="contract">{state.contract}</output>
    </div>
  );
}

function visit(url: string) {
  window.history.replaceState(null, "", url);
}

function text(testId: string): string | null {
  return screen.getByTestId(testId).textContent;
}

describe("useHydratedFormValues", () => {
  beforeEach(() => {
    visit("/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    visit("/");
  });

  it("does not call back when nothing changed before hydration", () => {
    const container = document.createElement("div");
    const onValueTyped = vi.fn();
    container.innerHTML = renderToString(<CountProbe onValueTyped={onValueTyped} />);
    document.body.append(container);

    act(() => {
      hydrateRoot(container, <CountProbe onValueTyped={onValueTyped} />);
    });

    expect(onValueTyped).not.toHaveBeenCalled();
    container.remove();
  });

  it("reports each differing control exactly once, even under strict mode's double effects", () => {
    const container = document.createElement("div");
    const onValueTyped = vi.fn();
    container.innerHTML = renderToString(<CountProbe onValueTyped={onValueTyped} />);
    document.body.append(container);
    const noteInput = container.querySelector<HTMLInputElement>('[name="note"]');
    if (!noteInput) throw new Error("missing input");
    noteInput.value = "ciao";

    let root: Root | undefined;
    act(() => {
      root = hydrateRoot(
        container,
        <StrictMode>
          <CountProbe onValueTyped={onValueTyped} />
        </StrictMode>,
      );
    });

    expect(onValueTyped).toHaveBeenCalledTimes(1);
    expect(onValueTyped).toHaveBeenCalledWith("note", "ciao");

    act(() => {
      root?.unmount();
    });
    container.remove();
  });

  it("lets the URL win for a field the user left alone, while adopting what was typed elsewhere", () => {
    visit("/?l=42000");
    const container = document.createElement("div");
    container.innerHTML = renderToString(<FormProbe />);
    document.body.append(container);

    expect(container.querySelector('[data-testid="gross"]')?.textContent).toBe("30000");

    const noteInput = container.querySelector<HTMLInputElement>('[name="note"]');
    const agreeInput = container.querySelector<HTMLInputElement>('[name="agree"]');
    const regionSelect = container.querySelector<HTMLSelectElement>('[name="region"]');
    const determinatoRadio = container.querySelector<HTMLInputElement>(
      '[name="contract"][value="determinato"]',
    );
    if (!noteInput || !agreeInput || !regionSelect || !determinatoRadio) {
      throw new Error("missing controls");
    }
    noteInput.value = "ciao";
    agreeInput.checked = true;
    regionSelect.value = "lombardia";
    determinatoRadio.checked = true;

    const onRecoverableError = vi.fn();
    let root: Root | undefined;
    act(() => {
      root = hydrateRoot(container, <FormProbe />, { onRecoverableError });
    });

    expect(container.querySelector('[data-testid="gross"]')?.textContent).toBe("42000");
    expect(container.querySelector('[data-testid="note"]')?.textContent).toBe("ciao");
    expect(container.querySelector('[data-testid="agree"]')?.textContent).toBe("true");
    expect(container.querySelector('[data-testid="region"]')?.textContent).toBe("lombardia");
    expect(container.querySelector('[data-testid="contract"]')?.textContent).toBe("determinato");
    expect(onRecoverableError).not.toHaveBeenCalled();

    act(() => {
      root?.unmount();
    });
    container.remove();
  });

  it("adopts a radio group changed before hydration", () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(<FormProbe />);
    document.body.append(container);

    expect(container.querySelector('[data-testid="contract"]')?.textContent).toBe("indeterminato");

    const determinatoRadio = container.querySelector<HTMLInputElement>(
      '[name="contract"][value="determinato"]',
    );
    if (!determinatoRadio) throw new Error("missing radio");
    determinatoRadio.checked = true;

    const onRecoverableError = vi.fn();
    let root: Root | undefined;
    act(() => {
      root = hydrateRoot(container, <FormProbe />, { onRecoverableError });
    });

    expect(container.querySelector('[data-testid="contract"]')?.textContent).toBe("determinato");
    expect(onRecoverableError).not.toHaveBeenCalled();

    act(() => {
      root?.unmount();
    });
    container.remove();
  });

  it("renders and adopts typed values the same way through a plain client render", () => {
    render(<FormProbe />);
    expect(text("gross")).toBe("30000");
    expect(text("note")).toBe("");
  });
});

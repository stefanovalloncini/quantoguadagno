import { useRef, type ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RegionCode } from "@/data/index.ts";
import { getMessages } from "@/i18n/messages/index.ts";
import { I18nProvider } from "@/i18n/react.tsx";
import { RESTORE_PENDING_ATTRIBUTE } from "@/islands/runtime/restoreSignal.ts";
import { useHydratedFormValues } from "@/islands/runtime/useHydratedFormValues.ts";
import { employeeDefaults } from "./state.ts";
import { useEmployeeController } from "./useEmployeeController.ts";

const MESSAGES = getMessages("it", ["form", "employee"]);

function Providers({ children }: { readonly children: ReactNode }) {
  return (
    <I18nProvider locale="it" messages={MESSAGES}>
      {children}
    </I18nProvider>
  );
}

function visit(url: string) {
  window.history.replaceState(null, "", url);
}

function setup(url = "/") {
  visit(url);
  return renderHook(() => useEmployeeController(), { wrapper: Providers });
}

afterEach(() => {
  visit("/");
  document.documentElement.removeAttribute(RESTORE_PENDING_ATTRIBUTE);
});

describe("useEmployeeController", () => {
  it("starts from the gross with the live defaults", () => {
    const { result } = setup();
    expect(result.current.state).toBe(employeeDefaults("it"));
    expect(result.current.errors).toEqual({});
    expect(result.current.stale).toBe(false);
    expect(result.current.result?.breakdown.netAnnual).toBeCloseTo(23_425.52, 2);
    expect(result.current.derived?.yearComparison).toHaveLength(3);
    expect(result.current.hints.limits.year).toBe(2026);
    expect(result.current.hints.region.region).toBe("lombardia");
    expect(result.current.comune).toEqual({ status: "none" });
    expect(result.current.comuni).toEqual({ status: "idle" });
    expect(result.current.links.print).toBe("/stampa-busta-paga");
  });

  it("restores a shared link, legacy names included, and ends the restore", () => {
    document.documentElement.setAttribute(RESTORE_PENDING_ATTRIBUTE, "");
    const { result } = setup("/?lordo=42000&regione=lazio&mens=14&fbclid=abc");
    expect(result.current.state).toMatchObject({
      gross: "42.000",
      region: "lazio",
      paymentFrequency: 14,
    });
    expect(result.current.result?.input).toMatchObject({
      grossAnnual: 42_000,
      regionCode: "lazio",
      paymentFrequency: 14,
    });
    expect(result.current.hints.region.region).toBe("lazio");
    expect(document.documentElement.hasAttribute(RESTORE_PENDING_ATTRIBUTE)).toBe(false);
  });

  it("recomputes as fields change and writes the short query", async () => {
    const { result } = setup();
    act(() => {
      result.current.update("gross", "35k");
    });
    expect(result.current.result?.breakdown.netAnnual).toBe(26_032.21);
    expect(result.current.derived?.raise.netGainAnnual).toBe(420.26);
    expect(result.current.links.print).toBe("/stampa-busta-paga?l=35000");
    await waitFor(() => {
      expect(window.location.search).toBe("?l=35000");
    });
  });

  it("keeps the last result, marked stale, while a field is invalid", () => {
    const { result } = setup();
    const before = result.current.result;
    act(() => {
      result.current.update("gross", "");
    });
    expect(result.current.errors).toEqual({ gross: { key: "field.error.ral.required" } });
    expect(result.current.result).toBe(before);
    expect(result.current.stale).toBe(true);
    act(() => {
      result.current.update("gross", "40.000");
    });
    expect(result.current.stale).toBe(false);
    expect(result.current.result?.input.grossAnnual).toBe(40_000);
  });

  it("has no result to show when the shared link itself is invalid", () => {
    const { result } = setup("/?c=5");
    expect(result.current.errors).toEqual({
      municipalRate: { key: "field.error.percentRange", values: { min: 0, max: 1.5 } },
    });
    expect(result.current.result).toBeNull();
    expect(result.current.derived).toBeNull();
    expect(result.current.stale).toBe(false);
  });

  it("seeds the target net from the current result when the mode flips", () => {
    const { result } = setup();
    act(() => {
      result.current.setMode("net");
    });
    expect(result.current.state.mode).toBe("net");
    expect(result.current.state.targetNet).toBe("1.802");
    expect(Math.abs((result.current.result?.breakdown.netAnnual ?? 0) - 1_802 * 13)).toBeLessThan(
      2,
    );
  });

  it("solves the gross from a shared net link and re-solves with the mensilità", () => {
    const { result } = setup("/?s=n&n=1800");
    const solved = result.current.result?.input.grossAnnual ?? 0;
    expect(solved).toBeGreaterThan(29_000);
    expect(solved).toBeLessThan(30_000);
    expect(result.current.result?.solve?.converged).toBe(true);
    act(() => {
      result.current.update("paymentFrequency", 14);
    });
    expect(result.current.result?.input.grossAnnual).toBeGreaterThan(solved);
    expect(Math.abs((result.current.result?.breakdown.netAnnual ?? 0) - 1_800 * 14)).toBeLessThan(
      2,
    );
  });

  it("carries the solved gross over when the mode flips back", () => {
    const { result } = setup("/?s=n&n=1800");
    const solved = result.current.result?.input.grossAnnual ?? 0;
    act(() => {
      result.current.setMode("gross");
    });
    expect(result.current.state.mode).toBe("gross");
    expect(result.current.result?.input.grossAnnual).toBe(solved);
  });

  it("loads the comune from a shared link and applies its rule", async () => {
    const { result } = setup("/?l=22000&k=F205");
    await waitFor(() => {
      expect(result.current.comune.status).toBe("ready");
    });
    expect(result.current.result?.municipal).toMatchObject({
      kind: "comune",
      comune: { name: "Milano" },
      ruleYear: 2025,
    });
    expect(result.current.result?.breakdown.municipalTax).toBe(0);
  });

  it("drops the comune with the region and loads the new region for the picker", async () => {
    const { result } = setup("/?k=F205");
    act(() => {
      result.current.update("region", "lazio");
    });
    expect(result.current.state.comune).toBeNull();
    expect(result.current.comune).toEqual({ status: "none" });
    act(() => {
      result.current.loadComuni();
    });
    await waitFor(() => {
      expect(result.current.comuni.status).toBe("ready");
    });
    act(() => {
      result.current.update("comune", "H501");
    });
    await waitFor(() => {
      expect(result.current.comune).toMatchObject({ status: "ready", comune: { name: "Roma" } });
    });
    expect(result.current.result?.municipal).toMatchObject({ kind: "comune" });
  });

  it("falls back to the manual rate for a comune that is not in the region", async () => {
    const { result } = setup("/?k=H501&c=0.5");
    await waitFor(() => {
      expect(result.current.comune).toEqual({ status: "missing", id: "H501" });
    });
    expect(result.current.result?.municipal).toEqual({ kind: "manual", rate: 0.005 });
  });

  it("resets one group or everything", async () => {
    const { result } = setup();
    act(() => {
      result.current.update("hasSpouse", true);
      result.current.update("gross", "50.000");
    });
    expect(result.current.derived?.groups.dependents).toBe(true);
    act(() => {
      result.current.resetGroup("dependents");
    });
    expect(result.current.derived?.groups.dependents).toBe(false);
    expect(result.current.state.gross).toBe("50.000");
    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toBe(employeeDefaults("it"));
    await waitFor(() => {
      expect(window.location.search).toBe("");
    });
  });

  it("adopts a field by name and ignores names it does not own", () => {
    const { result } = setup();
    act(() => {
      result.current.adoptField("gross", "45.000");
      result.current.adoptField("hasSpouse", true);
      result.current.adoptField("utm_source", "newsletter");
    });
    expect(result.current.state).toMatchObject({ gross: "45.000", hasSpouse: true });
    expect(result.current.result?.input.dependents).toMatchObject({ hasSpouse: true });
  });
});

function FormProbe() {
  const controller = useEmployeeController();
  const containerRef = useRef<HTMLDivElement>(null);
  useHydratedFormValues(containerRef, controller.adoptField);
  const { state, update } = controller;
  return (
    <div ref={containerRef}>
      <input
        name="gross"
        aria-label="gross"
        value={state.gross}
        onChange={(event) => {
          update("gross", event.target.value);
        }}
      />
      <select
        name="region"
        aria-label="region"
        value={state.region}
        onChange={(event) => {
          update("region", event.target.value as RegionCode);
        }}
      >
        <option value="lombardia">Lombardia</option>
        <option value="lazio">Lazio</option>
      </select>
      <input
        type="checkbox"
        name="hasSpouse"
        aria-label="spouse"
        checked={state.hasSpouse}
        onChange={(event) => {
          update("hasSpouse", event.target.checked);
        }}
      />
      <output data-testid="state">
        {JSON.stringify({
          gross: state.gross,
          year: state.year,
          region: state.region,
          hasSpouse: state.hasSpouse,
          net: controller.result?.breakdown.netAnnual,
        })}
      </output>
    </div>
  );
}

describe("hydration", () => {
  it("adopts what was typed before hydration while the link restores the rest", async () => {
    visit("/?y=2025");
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <Providers>
        <FormProbe />
      </Providers>,
    );
    document.body.append(container);
    const gross = container.querySelector<HTMLInputElement>('[name="gross"]');
    const region = container.querySelector<HTMLSelectElement>('[name="region"]');
    const spouse = container.querySelector<HTMLInputElement>('[name="hasSpouse"]');
    if (!gross || !region || !spouse) throw new Error("missing controls");
    expect(gross.value).toBe("30.000");
    gross.value = "35.000";
    region.value = "lazio";
    spouse.checked = true;

    const onRecoverableError = vi.fn();
    let root: Root | undefined;
    act(() => {
      root = hydrateRoot(
        container,
        <Providers>
          <FormProbe />
        </Providers>,
        { onRecoverableError },
      );
    });

    const output = container.querySelector('[data-testid="state"]')?.textContent ?? "{}";
    const shown: unknown = JSON.parse(output);
    expect(shown).toMatchObject({ gross: "35.000", year: 2025, region: "lazio", hasSpouse: true });
    expect(gross.value).toBe("35.000");
    expect(onRecoverableError).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(window.location.search).toBe("?l=35000&y=2025&r=lazio");
    });

    act(() => {
      root?.unmount();
    });
    container.remove();
  });
});

import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getMessages } from "@/i18n/messages/index.ts";
import { I18nProvider } from "@/i18n/react.tsx";
import { RESTORE_PENDING_ATTRIBUTE } from "@/islands/runtime/restoreSignal.ts";
import { employerCostDefaults } from "./state.ts";
import { useEmployerCostController } from "./useEmployerCostController.ts";

const MESSAGES = getMessages("it", ["form", "employerCost"]);

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

function setup(url = "/costo-azienda") {
  visit(url);
  return renderHook(() => useEmployerCostController(), { wrapper: Providers });
}

afterEach(() => {
  visit("/");
  document.documentElement.removeAttribute(RESTORE_PENDING_ATTRIBUTE);
});

describe("useEmployerCostController", () => {
  it("prices the default gross", () => {
    const { result } = setup();
    expect(result.current.state).toBe(employerCostDefaults("it"));
    expect(result.current.derived?.grossAnnual).toBe(30_000);
    expect(result.current.derived?.cost.total).toBe(
      result.current.result?.breakdown.totalEmployerCost,
    );
  });

  it("restores the gross, year and contract carried by a link from the calculator", () => {
    document.documentElement.setAttribute(RESTORE_PENDING_ATTRIBUTE, "");
    const { result } = setup("/costo-azienda?l=31234&y=2025&t=apprendistato");
    expect(result.current.state).toEqual({
      ...employerCostDefaults("it"),
      gross: "31.234",
      year: 2025,
      contractType: "apprendistato",
    });
    expect(result.current.derived?.cost.employerInpsRate).toBe(0.1181);
    expect(document.documentElement.hasAttribute(RESTORE_PENDING_ATTRIBUTE)).toBe(false);
  });

  it("restores the employee's region and mensilità and waits for the comune", async () => {
    const { result } = setup("/costo-azienda?r=lazio&k=H501&m=14");
    expect(result.current.state).toMatchObject({
      region: "lazio",
      comune: "H501",
      paymentFrequency: 14,
    });
    expect(result.current.result?.municipal.kind).toBe("manual");
    await waitFor(() => {
      expect(result.current.comune.status).toBe("ready");
    });
    expect(result.current.result?.municipal).toMatchObject({ kind: "comune" });
  });

  it("recomputes when the contract changes and writes it to the address", async () => {
    const { result } = setup();
    act(() => {
      result.current.update("contractType", "determinato");
    });
    expect(result.current.derived?.cost.otherCosts.map((line) => line.id)).toContain(
      "naspiAdditional",
    );
    await waitFor(() => {
      expect(window.location.search).toBe("?t=determinato");
    });
  });

  it("keeps the last result, marked stale, while the gross is invalid", () => {
    const { result } = setup();
    const before = result.current.result;
    act(() => {
      result.current.update("gross", "");
    });
    expect(result.current.errors).toEqual({ gross: { key: "field.error.ral.required" } });
    expect(result.current.result).toBe(before);
    expect(result.current.stale).toBe(true);
  });

  it("adopts typed values and resets", () => {
    const { result } = setup();
    act(() => {
      result.current.adoptField("gross", "45k");
    });
    expect(result.current.derived?.grossAnnual).toBe(45_000);
    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toBe(employerCostDefaults("it"));
  });
});

import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getMessages } from "@/i18n/messages/index.ts";
import { I18nProvider } from "@/i18n/react.tsx";
import { RESTORE_PENDING_ATTRIBUTE } from "@/islands/runtime/restoreSignal.ts";
import { URL_WRITE_DELAY_MS } from "@/islands/runtime/useUrlState.ts";
import { usePrintPayslipController } from "./usePrintPayslipController.ts";

const MESSAGES = getMessages("it", ["form", "printPayslip"]);

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

function setup(url: string) {
  visit(url);
  return renderHook(() => usePrintPayslipController(), { wrapper: Providers });
}

afterEach(() => {
  visit("/");
  document.documentElement.removeAttribute(RESTORE_PENDING_ATTRIBUTE);
  vi.useRealTimers();
});

describe("usePrintPayslipController", () => {
  it("shows the gross decoded from the link", () => {
    const { result } = setup("/stampa-busta-paga?l=40000&y=2026");
    expect(result.current.derived?.summary.grossAnnual).toBe(40_000);
    expect(result.current.errors).toEqual({});
  });

  it("uses the defaults when no params are provided", () => {
    const { result } = setup("/stampa-busta-paga");
    expect(result.current.derived?.summary.grossAnnual).toBe(30_000);
  });

  it("reads the region code and the legacy names, and ends the restore", () => {
    document.documentElement.setAttribute(RESTORE_PENDING_ATTRIBUTE, "");
    const { result } = setup("/stampa-busta-paga?lordo=45000&regione=toscana");
    expect(result.current.derived?.inputs).toContainEqual({ id: "region", value: "toscana" });
    expect(result.current.derived?.summary.grossAnnual).toBe(45_000);
    expect(document.documentElement.hasAttribute(RESTORE_PENDING_ATTRIBUTE)).toBe(false);
  });

  it("waits for the comune's rule before settling the figures", async () => {
    const { result } = setup("/stampa-busta-paga?l=22000&k=F205");
    await waitFor(() => {
      expect(result.current.comune.status).toBe("ready");
    });
    expect(result.current.result?.breakdown.municipalTax).toBe(0);
  });

  it("has no payslip for a link it cannot compute", () => {
    const { result } = setup("/stampa-busta-paga?c=5");
    expect(result.current.result).toBeNull();
    expect(result.current.derived).toBeNull();
    expect(result.current.errors).toHaveProperty("municipalRate");
  });

  it("never rewrites the address it was opened with", () => {
    vi.useFakeTimers();
    const replaceState = vi.spyOn(window.history, "replaceState");
    setup("/stampa-busta-paga?lordo=45000&fbclid=abc");
    replaceState.mockClear();
    vi.advanceTimersByTime(URL_WRITE_DELAY_MS * 4);
    expect(replaceState).not.toHaveBeenCalled();
    expect(window.location.search).toBe("?lordo=45000&fbclid=abc");
  });
});

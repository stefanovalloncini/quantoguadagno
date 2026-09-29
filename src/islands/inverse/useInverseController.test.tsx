import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getMessages } from "@/i18n/messages/index.ts";
import { I18nProvider } from "@/i18n/react.tsx";
import { RESTORE_PENDING_ATTRIBUTE } from "@/islands/runtime/restoreSignal.ts";
import { inverseDefaults } from "./state.ts";
import { useInverseController } from "./useInverseController.ts";

const MESSAGES = getMessages("en", ["form", "inverse"]);

function Providers({ children }: { readonly children: ReactNode }) {
  return (
    <I18nProvider locale="en" messages={MESSAGES}>
      {children}
    </I18nProvider>
  );
}

function visit(url: string) {
  window.history.replaceState(null, "", url);
}

function setup(url = "/en/net-to-gross") {
  visit(url);
  return renderHook(() => useInverseController(), { wrapper: Providers });
}

afterEach(() => {
  visit("/");
  document.documentElement.removeAttribute(RESTORE_PENDING_ATTRIBUTE);
});

describe("useInverseController", () => {
  it("solves the default target in the page's locale", () => {
    const { result } = setup();
    expect(result.current.state).toBe(inverseDefaults("en"));
    expect(result.current.errors).toEqual({});
    expect(result.current.derived?.summary.converged).toBe(true);
    expect(Math.abs(result.current.derived?.summary.gap ?? 1)).toBeLessThanOrEqual(0.5);
    expect(result.current.comune).toEqual({ status: "none" });
  });

  it("restores a shared link and ends the restore", () => {
    document.documentElement.setAttribute(RESTORE_PENDING_ATTRIBUTE, "");
    const { result } = setup("/en/net-to-gross?n=30000&r=lazio&m=14");
    expect(result.current.state).toMatchObject({
      targetNetAnnual: "30,000",
      region: "lazio",
      paymentFrequency: 14,
    });
    expect(result.current.result?.values.targetNetAnnual).toBe(30_000);
    expect(document.documentElement.hasAttribute(RESTORE_PENDING_ATTRIBUTE)).toBe(false);
  });

  it("re-solves as the target changes and writes the short query", async () => {
    const { result } = setup();
    const before = result.current.result?.grossAnnual ?? 0;
    act(() => {
      result.current.update("targetNetAnnual", "30k");
    });
    expect(result.current.result?.grossAnnual).toBeGreaterThan(before);
    await waitFor(() => {
      expect(window.location.search).toBe("?n=30000");
    });
  });

  it("keeps the last result, marked stale, while the target is invalid", () => {
    const { result } = setup();
    const before = result.current.result;
    act(() => {
      result.current.update("targetNetAnnual", "lots");
    });
    expect(result.current.errors).toEqual({
      targetNetAnnual: { key: "field.error.netAnnual.invalid" },
    });
    expect(result.current.result).toBe(before);
    expect(result.current.stale).toBe(true);
  });

  it("loads a comune picked for the region and solves with its rule", async () => {
    const { result } = setup();
    act(() => {
      result.current.loadComuni();
    });
    await waitFor(() => {
      expect(result.current.comuni.status).toBe("ready");
    });
    act(() => {
      result.current.update("comune", "F205");
    });
    await waitFor(() => {
      expect(result.current.comune.status).toBe("ready");
    });
    expect(result.current.result?.municipal).toMatchObject({ kind: "comune" });
    expect(result.current.derived?.assumptions[2]).toMatchObject({ id: "comune" });
  });

  it("adopts fields by name and resets to the defaults", () => {
    const { result } = setup();
    act(() => {
      result.current.adoptField("targetNetAnnual", "27,500");
      result.current.adoptField("isPublicEmployee", true);
    });
    expect(result.current.result?.values).toMatchObject({
      targetNetAnnual: 27_500,
      isPublicEmployee: true,
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toBe(inverseDefaults("en"));
  });
});

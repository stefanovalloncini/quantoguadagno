import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/react.tsx";
import { useApprenticeshipController } from "./useApprenticeshipController.ts";

function visit(url: string) {
  window.history.replaceState(null, "", url);
}

function wrapper({ children }: { children: ReactNode }) {
  return (
    <I18nProvider locale="it" messages={{}}>
      {children}
    </I18nProvider>
  );
}

describe("useApprenticeshipController", () => {
  beforeEach(() => {
    visit("/");
  });

  afterEach(() => {
    visit("/");
  });

  it("starts from the OLD defaults: RAL 28.000, 3 years", () => {
    const { result } = renderHook(() => useApprenticeshipController(), { wrapper });
    expect(result.current.state).toEqual({ targetGrossAnnual: "28.000", years: 3 });
    expect(result.current.errors).toEqual({});
    expect(result.current.result.schedule).toHaveLength(3);
  });

  it("reads the ?lordo= query param as the starting target, like the OLD tool", () => {
    visit("/progressione-apprendistato?lordo=35000");
    const { result } = renderHook(() => useApprenticeshipController(), { wrapper });
    expect(result.current.state.targetGrossAnnual).toBe("35.000");
  });

  it("recomputes the schedule when years changes", () => {
    const { result } = renderHook(() => useApprenticeshipController(), { wrapper });
    act(() => {
      result.current.updateYears(5);
    });
    expect(result.current.state.years).toBe(5);
    expect(result.current.result.schedule).toHaveLength(5);
    expect(result.current.derived.schedule).toHaveLength(5);
  });

  it("updates the target and surfaces a field error for invalid text", () => {
    const { result } = renderHook(() => useApprenticeshipController(), { wrapper });
    act(() => {
      result.current.updateTargetGrossAnnual("abc");
    });
    expect(result.current.errors.targetGrossAnnual).toEqual({
      key: "field.error.moneyRange",
      values: { min: 1, max: 1_000_000 },
    });
    act(() => {
      result.current.updateTargetGrossAnnual("40000");
    });
    expect(result.current.errors.targetGrossAnnual).toBeUndefined();
    expect(result.current.result.targetGrossAnnual).toBe(40_000);
  });

  it("adopts a field value reported from before hydration", () => {
    const { result } = renderHook(() => useApprenticeshipController(), { wrapper });
    act(() => {
      result.current.adoptField("targetGrossAnnual", "60000");
    });
    expect(result.current.state.targetGrossAnnual).toBe("60000");
    act(() => {
      result.current.adoptField("years", "2");
    });
    expect(result.current.state.years).toBe(2);
    act(() => {
      result.current.adoptField("unknownField", "whatever");
    });
    expect(result.current.state.years).toBe(2);
  });

  it("resets back to the defaults", () => {
    const { result } = renderHook(() => useApprenticeshipController(), { wrapper });
    act(() => {
      result.current.updateTargetGrossAnnual("99000");
      result.current.updateYears(1);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toEqual({ targetGrossAnnual: "28.000", years: 3 });
  });
});

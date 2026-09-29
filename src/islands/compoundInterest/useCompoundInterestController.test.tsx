import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/react.tsx";
import { useCompoundInterestController } from "./useCompoundInterestController.ts";
import { DEFAULT_STATE } from "./state.ts";

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

describe("useCompoundInterestController", () => {
  beforeEach(() => {
    visit("/");
  });

  afterEach(() => {
    visit("/");
  });

  it("restores state from a shared link's query params", () => {
    visit("/interesse-composto?p=50000&r=8&y=10&c=500&cf=yearly&f=daily&i=3");
    const { result } = renderHook(() => useCompoundInterestController(), { wrapper });
    expect(result.current.state).toEqual({
      principal: 50_000,
      annualRate: 0.08,
      years: 10,
      contribution: 500,
      contributionFrequency: "yearly",
      compoundingFrequency: "daily",
      inflationRate: 0.03,
    });
  });

  it("starts from the old tool's defaults with no errors", () => {
    const { result } = renderHook(() => useCompoundInterestController(), { wrapper });
    expect(result.current.state).toEqual(DEFAULT_STATE);
    expect(result.current.errors).toEqual({});
    expect(result.current.showAllYears).toBe(false);
  });

  it("recomputes the result when the state changes", () => {
    const { result } = renderHook(() => useCompoundInterestController(), { wrapper });
    const initialFinal = result.current.result.finalNominal;
    act(() => {
      result.current.updatePrincipal(50_000);
    });
    expect(result.current.state.principal).toBe(50_000);
    expect(result.current.result.finalNominal).toBeGreaterThan(initialFinal);
  });

  it("surfaces a field error once a value goes out of range", () => {
    const { result } = renderHook(() => useCompoundInterestController(), { wrapper });
    act(() => {
      result.current.updateYears(0);
    });
    expect(result.current.errors.years).toEqual({
      key: "field.error.integerRange",
      values: { min: 1, max: 60 },
    });
  });

  it("caps the visible schedule at ten years until toggled", () => {
    const { result } = renderHook(() => useCompoundInterestController(), { wrapper });
    expect(result.current.derived.schedule.rows).toHaveLength(10);
    expect(result.current.derived.schedule.hasMore).toBe(true);
    act(() => {
      result.current.setShowAllYears(true);
    });
    expect(result.current.derived.schedule.hasMore).toBe(false);
  });

  it("adopts a raw typed value for a money field", () => {
    const { result } = renderHook(() => useCompoundInterestController(), { wrapper });
    act(() => {
      result.current.adoptField("principal", "35k");
    });
    expect(result.current.state.principal).toBe(35_000);
  });

  it("resets state, the show-all toggle and errors together", () => {
    const { result } = renderHook(() => useCompoundInterestController(), { wrapper });
    act(() => {
      result.current.updateYears(0);
      result.current.setShowAllYears(true);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toEqual(DEFAULT_STATE);
    expect(result.current.errors).toEqual({});
    expect(result.current.showAllYears).toBe(false);
  });
});

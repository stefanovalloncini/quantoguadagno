import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/react.tsx";
import { VISIBLE_TFR_YEARS } from "./derive.ts";
import { useTfrController } from "./useTfrController.ts";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <I18nProvider locale="it" messages={{}}>
      {children}
    </I18nProvider>
  );
}

describe("useTfrController", () => {
  it("starts from the OLD defaults", () => {
    const { result } = renderHook(() => useTfrController(), { wrapper });
    expect(result.current.state).toEqual({ ral: "30.000", years: 10, inflationRate: 0.02 });
    expect(result.current.derived.visibleSchedule).toHaveLength(10);
  });

  it("recomputes the annual quota from the RAL (RAL/13.5 - 0.50%)", () => {
    const { result } = renderHook(() => useTfrController(), { wrapper });
    act(() => {
      result.current.updateRal("54000");
    });
    expect(result.current.result.annualQuota).toBeCloseTo(3730, 0);
  });

  it("limits the visible schedule to 10 years until revealed", () => {
    const { result } = renderHook(() => useTfrController(), { wrapper });
    act(() => {
      result.current.updateYears(25);
    });
    expect(result.current.derived.visibleSchedule).toHaveLength(VISIBLE_TFR_YEARS);
    expect(result.current.derived.hasMoreYears).toBe(true);
    act(() => {
      result.current.revealAllYears();
    });
    expect(result.current.derived.visibleSchedule).toHaveLength(25);
    expect(result.current.derived.hasMoreYears).toBe(false);
  });

  it("surfaces a field error for an out-of-range inflation rate", () => {
    const { result } = renderHook(() => useTfrController(), { wrapper });
    act(() => {
      result.current.updateInflationRate(0.5);
    });
    expect(result.current.errors.inflationRate).toEqual({
      key: "field.error.percentRange",
      values: { min: 0, max: 20 },
    });
  });

  it("adopts a field value reported from before hydration", () => {
    const { result } = renderHook(() => useTfrController(), { wrapper });
    act(() => {
      result.current.adoptField("ral", "60000");
    });
    expect(result.current.state.ral).toBe("60000");
    act(() => {
      result.current.adoptField("years", "20");
    });
    expect(result.current.state.years).toBe(20);
  });

  it("resets back to the defaults, including the reveal-all toggle", () => {
    const { result } = renderHook(() => useTfrController(), { wrapper });
    act(() => {
      result.current.updateYears(25);
      result.current.revealAllYears();
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toEqual({ ral: "30.000", years: 10, inflationRate: 0.02 });
    expect(result.current.showAllYears).toBe(false);
  });
});

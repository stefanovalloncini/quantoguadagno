import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { I18nProvider } from "@/i18n/react.tsx";
import { useNaspiController } from "./useNaspiController.ts";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <I18nProvider locale="it" messages={{}}>
      {children}
    </I18nProvider>
  );
}

describe("useNaspiController", () => {
  it("starts from the OLD defaults", () => {
    const { result } = renderHook(() => useNaspiController(), { wrapper });
    expect(result.current.state).toEqual({
      grossPay4Years: "100000",
      weeksContribution4Years: 200,
      age: 40,
      voluntaryResignationInLast12Months: false,
      weeksAfterVoluntaryResignation: 0,
      year: LATEST_SUPPORTED_YEAR,
    });
    expect(result.current.result.eligible).toBe(true);
  });

  it("shows the ineligibility alert when weeks of contribution are 0", () => {
    const { result } = renderHook(() => useNaspiController(), { wrapper });
    act(() => {
      result.current.updateWeeksContribution4Years(0);
    });
    expect(result.current.result.eligible).toBe(false);
    expect(result.current.derived.ineligibilityMessageKeys).toEqual([
      "naspi.ineligible.insufficient-weeks",
    ]);
  });

  it("reveals the after-resignation field state when toggled", () => {
    const { result } = renderHook(() => useNaspiController(), { wrapper });
    act(() => {
      result.current.updateVoluntaryResignationInLast12Months(true);
    });
    expect(result.current.state.voluntaryResignationInLast12Months).toBe(true);
    expect(result.current.result.eligible).toBe(false);
  });

  it("limits the visible schedule to 12 months until revealed", () => {
    const { result } = renderHook(() => useNaspiController(), { wrapper });
    expect(result.current.derived.hasMoreMonths).toBe(true);
    act(() => {
      result.current.revealAllMonths();
    });
    expect(result.current.derived.hasMoreMonths).toBe(false);
  });

  it("adopts a field value reported from before hydration", () => {
    const { result } = renderHook(() => useNaspiController(), { wrapper });
    act(() => {
      result.current.adoptField("grossPay4Years", "120000");
    });
    expect(result.current.state.grossPay4Years).toBe("120000");
    act(() => {
      result.current.adoptField("age", "45");
    });
    expect(result.current.state.age).toBe(45);
  });

  it("resets back to the defaults", () => {
    const { result } = renderHook(() => useNaspiController(), { wrapper });
    act(() => {
      result.current.updateAge(60);
      result.current.revealAllMonths();
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.state.age).toBe(40);
    expect(result.current.showAllMonths).toBe(false);
  });
});

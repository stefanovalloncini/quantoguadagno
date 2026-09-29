import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { I18nProvider } from "@/i18n/react.tsx";
import { useForfettarioController } from "./useForfettarioController.ts";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <I18nProvider locale="it" messages={{}}>
      {children}
    </I18nProvider>
  );
}

describe("useForfettarioController", () => {
  it("starts from the OLD defaults", () => {
    const { result } = renderHook(() => useForfettarioController(), { wrapper });
    expect(result.current.state).toEqual({
      revenue: "30.000",
      activity: "professionisti",
      year: LATEST_SUPPORTED_YEAR,
      yearsOfActivity: 1,
      hasOtherPension: false,
      employeeCosts: "0",
      gestion: "gestione-separata",
      mesiAttivita: 12,
      isConcurrentFullTimeEmployee: false,
      concurrentEmployeeRal: "0",
      forfettarioDiscount35: false,
      newRegistrantDiscount50: false,
      cassaManualAmount: "0",
      isAnte1996: false,
    });
    expect(result.current.result.aliquotaSostitutiva).toBe(0.05);
    expect(result.current.derived.notice).toEqual({ kind: "none" });
  });

  it("shows the monthly net summary and reacts to a revenue change", () => {
    const { result } = renderHook(() => useForfettarioController(), { wrapper });
    act(() => {
      result.current.updateRevenue("85000");
    });
    expect(result.current.derived.notice.kind).toBe("warning");
  });

  it("keeps the two discount toggles mutually exclusive through the controller", () => {
    const { result } = renderHook(() => useForfettarioController(), { wrapper });
    act(() => {
      result.current.updateForfettarioDiscount35(true);
    });
    expect(result.current.state.forfettarioDiscount35).toBe(true);
    act(() => {
      result.current.updateNewRegistrantDiscount50(true);
    });
    expect(result.current.state.newRegistrantDiscount50).toBe(true);
    expect(result.current.state.forfettarioDiscount35).toBe(false);
  });

  it("surfaces a field error for an invalid revenue", () => {
    const { result } = renderHook(() => useForfettarioController(), { wrapper });
    act(() => {
      result.current.updateRevenue("abc");
    });
    expect(result.current.errors.revenue).toEqual({
      key: "field.error.moneyRange",
      values: { min: 0, max: 500_000 },
    });
  });

  it("adopts a field value reported from before hydration", () => {
    const { result } = renderHook(() => useForfettarioController(), { wrapper });
    act(() => {
      result.current.adoptField("revenue", "60000");
    });
    expect(result.current.state.revenue).toBe("60000");
    act(() => {
      result.current.adoptField("gestion", "artigiani");
    });
    expect(result.current.state.gestion).toBe("artigiani");
    act(() => {
      result.current.adoptField("gestion", "not-a-gestion");
    });
    expect(result.current.state.gestion).toBe("artigiani");
  });

  it("resets back to the defaults", () => {
    const { result } = renderHook(() => useForfettarioController(), { wrapper });
    act(() => {
      result.current.updateRevenue("60000");
      result.current.updateGestion("artigiani");
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.state.revenue).toBe("30.000");
    expect(result.current.state.gestion).toBe("gestione-separata");
  });
});

import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { I18nProvider } from "@/i18n/react.tsx";
import { useTredicesimaController } from "./useTredicesimaController.ts";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <I18nProvider locale="it" messages={{}}>
      {children}
    </I18nProvider>
  );
}

describe("useTredicesimaController", () => {
  it("starts from the OLD defaults", () => {
    const { result } = renderHook(() => useTredicesimaController(), { wrapper });
    expect(result.current.state).toEqual({
      ral: "30.000",
      mensilita: 13,
      taxYear: LATEST_SUPPORTED_YEAR,
    });
    expect(result.current.errors).toEqual({});
  });

  it("reveals the combined total only when 14 instalments are chosen", () => {
    const { result } = renderHook(() => useTredicesimaController(), { wrapper });
    expect(result.current.derived.showCombinedTotal).toBe(false);
    act(() => {
      result.current.updateMensilita(14);
    });
    expect(result.current.derived.showCombinedTotal).toBe(true);
  });

  it("recomputes the result when the RAL changes", () => {
    const { result } = renderHook(() => useTredicesimaController(), { wrapper });
    act(() => {
      result.current.updateRal("60000");
    });
    expect(result.current.result.marginalRate).toBe(0.43);
  });

  it("surfaces a field error for an invalid RAL", () => {
    const { result } = renderHook(() => useTredicesimaController(), { wrapper });
    act(() => {
      result.current.updateRal("abc");
    });
    expect(result.current.errors.ral).toEqual({
      key: "field.error.ral.range",
      values: { min: 1, max: 500_000 },
    });
  });

  it("adopts a field value reported from before hydration", () => {
    const { result } = renderHook(() => useTredicesimaController(), { wrapper });
    act(() => {
      result.current.adoptField("mensilita", "14");
    });
    expect(result.current.state.mensilita).toBe(14);
    act(() => {
      result.current.adoptField("mensilita", "15");
    });
    expect(result.current.state.mensilita).toBe(14);
  });

  it("resets back to the defaults", () => {
    const { result } = renderHook(() => useTredicesimaController(), { wrapper });
    act(() => {
      result.current.updateRal("99000");
      result.current.updateMensilita(14);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toEqual({
      ral: "30.000",
      mensilita: 13,
      taxYear: LATEST_SUPPORTED_YEAR,
    });
  });
});

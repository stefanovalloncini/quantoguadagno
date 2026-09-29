import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/react.tsx";
import { useInflationController } from "./useInflationController.ts";
import { DEFAULT_STATE } from "./state.ts";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <I18nProvider locale="it" messages={{}}>
      {children}
    </I18nProvider>
  );
}

describe("useInflationController", () => {
  it("starts from the old tool's defaults with no errors", () => {
    const { result } = renderHook(() => useInflationController(), { wrapper });
    expect(result.current.state).toEqual(DEFAULT_STATE);
    expect(result.current.errors).toEqual({});
  });

  it("reacts to changing the starting year", () => {
    const { result } = renderHook(() => useInflationController(), { wrapper });
    act(() => {
      result.current.updateFromYear(2020);
    });
    expect(result.current.result.fromYear).toBe(2020);
  });

  it("drops the frozen breakdown once there is no span to walk", () => {
    const { result } = renderHook(() => useInflationController(), { wrapper });
    act(() => {
      result.current.updateFromYear(result.current.state.toYear);
    });
    expect(result.current.result.frozen).toBeNull();
  });

  it("surfaces a field error for a year outside the FOI series", () => {
    const { result } = renderHook(() => useInflationController(), { wrapper });
    act(() => {
      result.current.updateFromYear(1900);
    });
    expect(result.current.errors.fromYear).toBe("inflation.form.fromYear.error");
  });

  it("adopts a raw typed amount", () => {
    const { result } = renderHook(() => useInflationController(), { wrapper });
    act(() => {
      result.current.adoptField("amount", "35k");
    });
    expect(result.current.state.amount).toBe(35_000);
  });

  it("resets to the defaults", () => {
    const { result } = renderHook(() => useInflationController(), { wrapper });
    act(() => {
      result.current.updateAmount(9999);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toEqual(DEFAULT_STATE);
  });
});

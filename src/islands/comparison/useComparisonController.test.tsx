import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/react.tsx";
import { useComparisonController } from "./useComparisonController.ts";
import { comparisonDefaults } from "./state.ts";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <I18nProvider locale="it" messages={{}}>
      {children}
    </I18nProvider>
  );
}

describe("useComparisonController", () => {
  it("starts from the old tool's defaults, with B as the winner", () => {
    const { result } = renderHook(() => useComparisonController(), { wrapper });
    expect(result.current.state).toEqual(comparisonDefaults("it"));
    expect(result.current.errors).toEqual({});
    expect(result.current.derived?.verdict.winner).toBe("b");
  });

  it("re-flags the winner when offer A is raised above B", () => {
    const { result } = renderHook(() => useComparisonController(), { wrapper });
    act(() => {
      result.current.updateOffer("a", "gross", "60.000");
    });
    expect(result.current.derived?.verdict.winner).toBe("a");
  });

  it("compares offers on different mensilità", () => {
    const { result } = renderHook(() => useComparisonController(), { wrapper });
    act(() => {
      result.current.updateOffer("a", "gross", "35.000");
      result.current.updateOffer("b", "paymentFrequency", 14);
    });
    expect(result.current.derived?.verdict.winner).toBe("equal");
    expect(result.current.result?.b.breakdown.netMonthly).toBe(1_859.44);
  });

  it("keeps the last figures of an offer while its RAL is wrong", () => {
    const { result } = renderHook(() => useComparisonController(), { wrapper });
    act(() => {
      result.current.updateOffer("b", "gross", "abc");
    });
    expect(result.current.errors.grossB).toEqual({ key: "field.error.ral.invalid" });
    expect(result.current.staleOffers).toEqual({ a: false, b: true });
    expect(result.current.stale).toBe(true);
    expect(result.current.offers.b?.breakdown.grossAnnual).toBe(35_000);
  });

  it("applies shared conditions to both offers", () => {
    const { result } = renderHook(() => useComparisonController(), { wrapper });
    const before = result.current.offers.a?.breakdown.netAnnual ?? 0;
    act(() => {
      result.current.updateCondition("hasSpouse", true);
    });
    expect(result.current.offers.a?.breakdown.netAnnual).toBeGreaterThan(before);
    expect(result.current.offers.b?.values.dependents).toMatchObject({ hasSpouse: true });
  });

  it("adopts values typed before hydration and resets to the defaults", () => {
    const { result } = renderHook(() => useComparisonController(), { wrapper });
    act(() => {
      result.current.adoptField("grossB", "60k");
    });
    expect(result.current.result?.b.breakdown.grossAnnual).toBe(60_000);
    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toEqual(comparisonDefaults("it"));
  });
});

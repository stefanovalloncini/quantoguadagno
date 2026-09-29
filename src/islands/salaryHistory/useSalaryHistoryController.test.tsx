import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/react.tsx";
import { useSalaryHistoryController } from "./useSalaryHistoryController.ts";
import { DEFAULT_STATE } from "./state.ts";
import { SALARY_HISTORY_CODEC } from "./storage.ts";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <I18nProvider locale="it" messages={{}}>
      {children}
    </I18nProvider>
  );
}

describe("useSalaryHistoryController", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("starts with no entries and the old tool's draft defaults", () => {
    const { result } = renderHook(() => useSalaryHistoryController(), { wrapper });
    expect(result.current.entries).toEqual([]);
    expect(result.current.state).toEqual(DEFAULT_STATE);
    expect(result.current.errors).toEqual({});
  });

  it("reads entries already saved under the live storage key", () => {
    localStorage.setItem(
      SALARY_HISTORY_CODEC.key,
      JSON.stringify([
        {
          id: "a",
          year: 2024,
          grossAnnual: 30_000,
          createdAt: "2024-01-01T00:00:00.000Z",
          settings: {
            contractType: "indeterminato",
            regionCode: "lazio",
            municipalTaxRate: 0.008,
            paymentFrequency: 13,
          },
        },
      ]),
    );
    const { result } = renderHook(() => useSalaryHistoryController(), { wrapper });
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.result.rows).toHaveLength(1);
  });

  it("adds an entry built from the draft and persists it, then resets the draft", () => {
    const { result } = renderHook(() => useSalaryHistoryController(), { wrapper });
    act(() => {
      result.current.updateDraft({ year: 2024, grossAnnual: 32_000, note: "raise" });
    });
    act(() => {
      result.current.addEntry();
    });
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0]?.grossAnnual).toBe(32_000);
    expect(result.current.entries[0]?.note).toBe("raise");
    expect(result.current.state.draft.grossAnnual).toBe(DEFAULT_STATE.draft.grossAnnual);
    expect(result.current.state.draft.note).toBe("");
    expect(result.current.state.draft.year).toBe(2024);

    const stored: unknown = JSON.parse(localStorage.getItem(SALARY_HISTORY_CODEC.key) ?? "null");
    expect(Array.isArray(stored) && stored.length).toBe(1);
  });

  it("refuses to add an entry while the draft is invalid", () => {
    const { result } = renderHook(() => useSalaryHistoryController(), { wrapper });
    act(() => {
      result.current.updateDraft({ grossAnnual: 0 });
    });
    act(() => {
      result.current.addEntry();
    });
    expect(result.current.entries).toEqual([]);
  });

  it("removes and clears entries", () => {
    const { result } = renderHook(() => useSalaryHistoryController(), { wrapper });
    act(() => {
      result.current.updateDraft({ year: 2024, grossAnnual: 30_000 });
    });
    act(() => {
      result.current.addEntry();
    });
    const id = result.current.entries[0]?.id;
    act(() => {
      if (id) result.current.removeEntry(id);
    });
    expect(result.current.entries).toEqual([]);

    act(() => {
      result.current.updateDraft({ year: 2024, grossAnnual: 30_000 });
      result.current.addEntry();
    });
    act(() => {
      result.current.clear();
    });
    expect(result.current.entries).toEqual([]);
  });

  it("reports the purchasing-power change between the first and latest entry", () => {
    const { result } = renderHook(() => useSalaryHistoryController(), { wrapper });
    act(() => {
      result.current.updateDraft({ year: 2022, grossAnnual: 25_000 });
      result.current.addEntry();
    });
    act(() => {
      result.current.updateDraft({ year: 2026, grossAnnual: 32_000 });
      result.current.addEntry();
    });
    expect(result.current.derived.realChangeSinceFirst).not.toBeNull();
  });

  it("surfaces a field error once the draft goes out of range", () => {
    const { result } = renderHook(() => useSalaryHistoryController(), { wrapper });
    act(() => {
      result.current.updateDraft({ grossAnnual: -1 });
    });
    expect(result.current.errors.grossAnnual).toEqual({
      key: "field.error.ral.range",
      values: { min: 0, max: 1_000_000 },
    });
  });

  it("adopts a raw typed gross for the draft", () => {
    const { result } = renderHook(() => useSalaryHistoryController(), { wrapper });
    act(() => {
      result.current.adoptField("grossAnnual", "45k");
    });
    expect(result.current.state.draft.grossAnnual).toBe(45_000);
  });

  it("resets the draft and projection controls without touching saved entries", () => {
    const { result } = renderHook(() => useSalaryHistoryController(), { wrapper });
    act(() => {
      result.current.updateDraft({ year: 2024, grossAnnual: 30_000 });
      result.current.addEntry();
    });
    act(() => {
      result.current.updateHorizon(10);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toEqual(DEFAULT_STATE);
    expect(result.current.entries).toHaveLength(1);
  });
});

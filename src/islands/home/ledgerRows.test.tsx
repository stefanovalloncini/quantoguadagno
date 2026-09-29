import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { useRegionText } from "@/components/form/regionText.ts";
import { getMessages } from "@/i18n/messages/index.ts";
import { I18nProvider, useRichT, useT } from "@/i18n/react.tsx";
import { computeEmployee } from "./compute.ts";
import { deriveEmployee } from "./derive.ts";
import { impatriatiBase } from "./impatriati.ts";
import { buildLedger, type LedgerContext } from "./ledgerRows.tsx";
import { checkEmployee, employeeDefaults, type EmployeeState } from "./state.ts";
import { useViewFormat } from "./viewFormat.tsx";

const MESSAGES = getMessages("it", ["form", "employee"]);

function wrapper({ children }: { readonly children: ReactNode }) {
  return (
    <I18nProvider locale="it" messages={MESSAGES}>
      {children}
    </I18nProvider>
  );
}

function resultOf(patch: Partial<EmployeeState>) {
  const { values } = checkEmployee({ ...employeeDefaults("it"), ...patch }, "it");
  if (values === null) throw new Error("expected valid values");
  return computeEmployee(values, null);
}

function ledgerOf(patch: Partial<EmployeeState>) {
  const result = resultOf(patch);
  const { result: hooks } = renderHook(
    () => ({ t: useT(), rt: useRichT(), f: useViewFormat(), regions: useRegionText() }),
    { wrapper },
  );
  const context: LedgerContext = { result, municipalMode: "none", ...hooks.current };
  return buildLedger(context);
}

describe("regime impatriati in the ledger", () => {
  it("shows the exempt share and the base IRPEF and the surcharges are worked out on", () => {
    const { rows } = ledgerOf({ gross: "30.000", impatriati: true });
    const ids = rows.map((row) => row.id);
    expect(ids.slice(0, 5)).toEqual(["gross", "inps", "taxable", "impatriatiExempt", "irpefBase"]);
    const exempt = rows.find((row) => row.id === "impatriatiExempt");
    const base = rows.find((row) => row.id === "irpefBase");
    const irpef = rows.find((row) => row.id === "irpef");
    expect(exempt?.name).toBe("Quota esente, regime impatriati (50%)");
    expect(exempt?.annual).toMatch(/^−13\.621,50\s€$/);
    expect(base?.annual).toMatch(/^13\.621,50\s€$/);
    expect(irpef?.rule).toBe("a scaglioni sul 50% del reddito, meno detrazioni");
  });

  it("leaves the ledger unchanged without the regime", () => {
    const ids = ledgerOf({ gross: "30.000" }).rows.map((row) => row.id);
    expect(ids).not.toContain("impatriatiExempt");
    expect(ids).not.toContain("irpefBase");
  });

  it("measures the IRPEF bracket on the taxed part of the income", () => {
    const result = resultOf({ gross: "30.000", impatriati: true });
    expect(impatriatiBase(result)).toMatchObject({ exempt: 13_621.5, taxed: 13_621.5 });
    expect(deriveEmployee(result).bracket).toMatchObject({
      currentIndex: 0,
      distanceToNext: 28_000 - 13_621.5,
    });
  });
});

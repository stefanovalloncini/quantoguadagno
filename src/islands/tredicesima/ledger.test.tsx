import { render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { getMessages } from "@/i18n/messages/index.ts";
import { I18nProvider, useT } from "@/i18n/react.tsx";
import { computeTredicesima } from "./compute.ts";
import { buildTredicesimaLedger } from "./ledger.tsx";
import { TREDICESIMA_DEFAULTS, updateRal, updateTaxYear, type TredicesimaState } from "./state.ts";

const MESSAGES = getMessages("it", ["form", "tredicesima"]);

function wrapper({ children }: { readonly children: ReactNode }) {
  return (
    <I18nProvider locale="it" messages={MESSAGES}>
      {children}
    </I18nProvider>
  );
}

function ledgerOf(state: TredicesimaState) {
  const { result: t } = renderHook(() => useT(), { wrapper });
  return buildTredicesimaLedger({
    result: computeTredicesima(state, "it"),
    mensilita: state.mensilita,
    taxYear: state.taxYear,
    t: t.current,
    locale: "it",
  });
}

function rowOf(state: TredicesimaState, id: string) {
  const row = ledgerOf(state).rows.find((candidate) => candidate.id === id);
  if (row === undefined) throw new Error(`Missing row ${id}`);
  return row;
}

describe("buildTredicesimaLedger", () => {
  it("states the monthly bracket rule instead of a marginal rate", () => {
    expect(rowOf(TREDICESIMA_DEFAULTS, "irpef").rule).toBe(
      "scaglioni divisi per 12, senza detrazioni",
    );
  });

  it("lists only the first monthly bracket when the extra month stays in it", () => {
    render(<>{rowOf(TREDICESIMA_DEFAULTS, "irpef").explanation}</>);
    expect(screen.getByText(/divisi per 12: 23% fino a 2\.333,33\s€\./)).toBeInTheDocument();
  });

  it("lists every monthly bracket the extra month reaches", () => {
    const state = updateRal(TREDICESIMA_DEFAULTS, "60.000");
    render(<>{rowOf(state, "irpef").explanation}</>);
    expect(
      screen.getByText(/23% fino a 2\.333,33\s€, 33% fino a 4\.166,67\s€, 43% oltre\./),
    ).toBeInTheDocument();
    expect(rowOf(state, "irpef").annual).toMatch(/^−1\.152,23\s€$/);
  });

  it("says the 2024 contribution cut skipped the extra months only for 2024", () => {
    render(<>{rowOf(updateTaxYear(TREDICESIMA_DEFAULTS, 2024), "inps").explanation}</>);
    expect(screen.getByText(/sconto sui contributi del 2024/)).toBeInTheDocument();
    render(<>{rowOf(TREDICESIMA_DEFAULTS, "inps").explanation}</>);
    expect(screen.getAllByText(/sconto sui contributi del 2024/)).toHaveLength(1);
  });

  it("ends with the net and the rule that produced it", () => {
    const { total } = ledgerOf(TREDICESIMA_DEFAULTS);
    expect(total.annual).toMatch(/^1\.613,62\s€$/);
    expect(total.rule).toBe("lordo meno contributi e IRPEF");
  });

  it("adds the wedge cut sum as a credit for a low RAL", () => {
    const state = updateRal(TREDICESIMA_DEFAULTS, "15.000");
    const { rows, total } = ledgerOf(state);
    const somma = rows.find((row) => row.id === "somma");
    expect(somma?.kind).toBe("credited");
    expect(somma?.rule).toBe("taglio del cuneo fiscale, 5,3% dell’imponibile");
    expect(somma?.annual).toMatch(/^\+55,53\s€$/);
    expect(total.annual).toMatch(/^862,34\s€$/);
    expect(total.rule).toBe("lordo meno contributi e IRPEF, più la somma aggiuntiva");
    render(<>{somma?.explanation}</>);
    expect(screen.getByText(/^Fino a 20\.000\s€ di reddito da lavoro/)).toBeInTheDocument();
  });

  it("has no wedge cut row in 2024 or above 20.000 € of taxable income", () => {
    const low2024 = updateTaxYear(updateRal(TREDICESIMA_DEFAULTS, "15.000"), 2024);
    expect(ledgerOf(low2024).rows.map((row) => row.id)).not.toContain("somma");
    expect(ledgerOf(TREDICESIMA_DEFAULTS).rows.map((row) => row.id)).not.toContain("somma");
  });
});

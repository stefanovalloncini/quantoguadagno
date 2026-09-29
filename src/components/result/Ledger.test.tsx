import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KitTestProvider } from "@/components/form/testing.tsx";
import { Ledger, type LedgerRow } from "./Ledger.tsx";
import { ResultFigure } from "./ResultFigure.tsx";

const ROWS: readonly LedgerRow[] = [
  { id: "gross", name: "Lordo", kind: "plain", annual: "20.000,00 €", explanation: <p>La RAL</p> },
  { id: "inps", name: "Contributi INPS", kind: "deducted", annual: "−1.838,00 €" },
  { id: "somma", name: "Somma aggiuntiva", kind: "credited", annual: "+871,78 €" },
];

const TOTAL: LedgerRow = { id: "net", name: "Netto", kind: "total", annual: "17.432,62 €" };

function ledger(explained: boolean) {
  return (
    <KitTestProvider>
      <Ledger
        headingId="dettaglio"
        toggleId="spiega"
        title="Dettaglio del calcolo"
        caption="Dettaglio del calcolo 2026, importi in euro"
        columns={{ term: "Voce", annual: "Annuo" }}
        rows={ROWS}
        total={TOTAL}
        explained={explained}
      />
    </KitTestProvider>
  );
}

describe("Ledger", () => {
  it("is a captioned table whose rows say whether an amount is taken or added", () => {
    render(ledger(false));
    const table = screen.getByRole("table", {
      name: "Dettaglio del calcolo 2026, importi in euro",
    });
    expect(
      within(table).getByRole("rowheader", { name: "Contributi INPS, trattenuta" }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("rowheader", { name: "Somma aggiuntiva, credito" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("La RAL")).toBeNull();
  });

  it("adds a full-width explanation row under each line when explained", () => {
    render(ledger(true));
    expect(
      screen.getByRole("checkbox", { name: "Mostra la spiegazione di ogni voce" }),
    ).toBeChecked();
    expect(screen.getByText("La RAL").closest("td")).toHaveAttribute("colspan", "2");
  });
});

describe("ResultFigure", () => {
  it("shows a prompt instead of a number when empty", () => {
    render(
      <ResultFigure
        headingId="netto"
        label="Netto mensile"
        state="empty"
        prompt="Inserisci la RAL per vedere il netto."
      />,
    );
    expect(screen.getByRole("heading", { name: "Netto mensile" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
    expect(screen.getByText("Inserisci la RAL per vedere il netto.")).toBeInTheDocument();
  });

  it("keeps the last value with the reason when stale, without the sub-line", () => {
    render(
      <ResultFigure
        headingId="netto"
        label="Netto mensile"
        state="stale"
        value="2.002,48 €"
        sub="Netto annuo 26.032,21 €"
        staleNote="Non aggiornato"
      />,
    );
    expect(screen.getByText("2.002,48 €")).toBeInTheDocument();
    expect(screen.getByText("Non aggiornato")).toBeInTheDocument();
    expect(
      screen.queryByText("Netto annuo 26.032,21 €", { ignore: "[aria-hidden='true'] *" }),
    ).toBeNull();
  });
});

import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { getMessages } from "@/i18n/messages/index.ts";
import EmployerCostCalculator from "@/islands/EmployerCostCalculator.tsx";
import { RESTORE_PENDING_ATTRIBUTE } from "@/islands/runtime/restoreSignal.ts";

const MESSAGES = {
  it: getMessages("it", ["form", "employerCost"]),
  en: getMessages("en", ["form", "employerCost"]),
};

function figure(): string {
  return document.querySelector(".qg-figure__value")?.textContent ?? "";
}

function cents(text: string): number {
  const digits = text
    .replace(/[^\d,−-]/g, "")
    .replace(",", ".")
    .replace("−", "-");
  return Math.round(Number(digits) * 100);
}

const roots: Root[] = [];

function setup(url = "/costo-azienda", locale: "it" | "en" = "it") {
  window.history.replaceState(null, "", url);
  const user = userEvent.setup();
  const island = <EmployerCostCalculator locale={locale} messages={MESSAGES[locale]} />;
  const container = document.createElement("div");
  container.innerHTML = renderToString(island);
  document.body.append(container);
  act(() => {
    roots.push(hydrateRoot(container, island));
  });
  return { user, ral: screen.getByRole("textbox", { name: /RAL/ }) };
}

beforeAll(() => {
  Element.prototype.scrollIntoView = () => undefined;
});

afterEach(() => {
  act(() => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
  document.documentElement.removeAttribute(RESTORE_PENDING_ATTRIBUTE);
});

describe("EmployerCostCalculator", () => {
  it("renders the default cost on the server and sums up what the net assumes", () => {
    const html = renderToString(<EmployerCostCalculator locale="it" messages={MESSAGES.it} />);
    expect(html).toContain("Costo annuo per l’azienda");
    expect(html).toMatch(/per una RAL di 30\.000,00\s€/);
    expect(html).toContain("Lombardia, comune non scelto, 13 mensilità");
    expect(html).toContain("Nessun comune scelto: per ora usiamo lo 0,80%");
  });

  it.each(["l=20004", "l=31234&t=determinato"])(
    "shows a cost ledger whose rows add up to the figure for %s",
    (query) => {
      setup(`/costo-azienda?${query}`);
      const table = screen.getByRole("table");
      const annual = within(table)
        .getAllByRole("row")
        .slice(1)
        .map((row) => within(row).getAllByRole("cell").at(-1)?.textContent ?? "");
      const total = annual.pop() ?? "";
      expect(annual.reduce((sum, text) => sum + cents(text), 0)).toBe(cents(total));
      expect(cents(figure())).toBe(cents(total));
    },
  );

  it("reads 35k and recomputes, then marks an invalid RAL on blur", async () => {
    const { user, ral } = setup();
    const before = figure();
    await user.clear(ral);
    await user.type(ral, "35k");
    expect(ral).toHaveAccessibleDescription(/Letto come 35\.000,00\s€/);
    expect(figure()).not.toBe(before);
    await user.clear(ral);
    await user.type(ral, "tanto");
    await user.tab();
    await waitFor(() => {
      expect(ral).toHaveAttribute("aria-invalid", "true");
    });
    expect(
      screen.getByText(/Non aggiornato: è il costo per 35\.000,00\s€ lordi/),
    ).toBeInTheDocument();
  });

  it("opens the net group and sums up a new region in its summary and the link", async () => {
    const { user } = setup();
    await user.click(screen.getByText("Netto del dipendente"));
    expect(document.getElementById("gruppo-netto")).toHaveAttribute("open");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Regione di residenza" }),
      "lazio",
    );
    expect(screen.getByText("Lazio, comune non scelto, 13 mensilità")).toBeVisible();
    await waitFor(() => {
      expect(window.location.search).toBe("?r=lazio");
    });
  });

  it("keeps the company cost when only the employee's settings change", async () => {
    const { user } = setup();
    const before = figure();
    await user.click(screen.getByText("Netto del dipendente"));
    await user.click(screen.getByRole("radio", { name: "14" }));
    expect(figure()).toBe(before);
    expect(screen.getByText("Lombardia, comune non scelto, 14 mensilità")).toBeVisible();
  });

  it("restores a link from the employee calculator and ends the restore", () => {
    document.documentElement.setAttribute(RESTORE_PENDING_ATTRIBUTE, "");
    setup("/costo-azienda?l=42000&y=2025&t=apprendistato&m=14");
    expect(document.documentElement.hasAttribute(RESTORE_PENDING_ATTRIBUTE)).toBe(false);
    expect(screen.getByRole("textbox", { name: /RAL/ })).toHaveValue("42.000");
    expect(screen.getByRole("combobox", { name: "Tipo di contratto" })).toHaveValue(
      "apprendistato",
    );
    expect(screen.getByText(/11,81%/, { selector: ".qg-ledger__rule" })).toBeInTheDocument();
  });

  it("opens the net group when a shared link carries a rate the form rejects", () => {
    setup("/costo-azienda?l=42000&c=3");
    const rate = screen.getByRole("textbox", { name: /Aliquota dell’addizionale comunale/ });
    expect(rate).toHaveAttribute("aria-invalid", "true");
    expect(rate).toBeVisible();
    expect(screen.getByText("Correggi i valori segnati per vedere il costo.")).toBeInTheDocument();
  });

  it("speaks English on the English page", () => {
    setup("/en/employer-cost", "en");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What an employee costs");
    expect(screen.getByRole("heading", { name: "Annual cost to the company" })).toBeInTheDocument();
  });
});

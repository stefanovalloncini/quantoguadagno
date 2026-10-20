import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { getMessages } from "@/i18n/messages/index.ts";
import OrdinarioCalculator from "@/islands/OrdinarioCalculator.tsx";
import { RESTORE_PENDING_ATTRIBUTE } from "@/islands/runtime/restoreSignal.ts";

const MESSAGES = {
  it: getMessages("it", ["form", "ordinario"]),
  en: getMessages("en", ["form", "ordinario"]),
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

function comparison(): HTMLElement {
  const heading = screen.getByRole("heading", { name: "Con il forfettario" });
  const band = heading.closest("section");
  if (band === null) throw new Error("No comparison band");
  return band;
}

const roots: Root[] = [];

function setup(url = "/partita-iva-ordinario", locale: "it" | "en" = "it") {
  window.history.replaceState(null, "", url);
  const user = userEvent.setup();
  const island = <OrdinarioCalculator locale={locale} messages={MESSAGES[locale]} />;
  const container = document.createElement("div");
  container.innerHTML = renderToString(island);
  document.body.append(container);
  act(() => {
    roots.push(hydrateRoot(container, island));
  });
  return { user };
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

describe("OrdinarioCalculator", () => {
  it("renders the default result, the comparison and the topics on the server", () => {
    const html = renderToString(<OrdinarioCalculator locale="it" messages={MESSAGES.it} />);
    expect(html).toContain("Netto annuo");
    expect(html).toMatch(/22\.186,97\s€/);
    expect(html).toMatch(/In media <strong>1\.848,91\s€<\/strong> al mese/);
    expect(html).toMatch(/6\.958,76\s€ di IRPEF lorda meno 227,25\s€ di detrazione/);
    expect(html).toContain("Con il forfettario");
    expect(html).toMatch(/25\.507,79\s€/);
    expect(html).toContain("Per capire il regime ordinario");
    expect(html).toMatch(/1\.265\s€ fino a 5\.500\s€, poi scende fino a 500\s€ a 28\.000\s€/);
    expect(html).not.toContain("Ipotesi del calcolo");
  });

  it("shows a ledger whose amounts add up to the figure", () => {
    setup();
    const ledger = screen.getByRole("table", { name: /Dettaglio del calcolo 2026/ });
    const rows = within(ledger).getAllByRole("row").slice(1);
    const amounts = rows
      .filter((row) => !row.classList.contains("qg-ledger__row--subtotal"))
      .map((row) => within(row).getAllByRole("cell").at(-1)?.textContent ?? "");
    const total = amounts.pop() ?? "";
    expect(amounts.reduce((sum, text) => sum + cents(text), 0)).toBe(cents(total));
    expect(cents(figure())).toBe(cents(total));
  });

  it("recomputes as you type and marks an invalid amount on blur", async () => {
    const { user } = setup();
    const revenue = screen.getByRole("textbox", { name: /Compensi o ricavi dell’anno/ });
    await user.clear(revenue);
    expect(
      screen.getByText("Scrivi i compensi o i ricavi dell’anno per vedere il netto."),
    ).toBeVisible();
    await user.type(revenue, "18000");
    const costs = screen.getByRole("textbox", { name: /Costi deducibili dell’anno/ });
    await user.clear(costs);
    await user.type(costs, "2000");
    await user.click(screen.getByRole("radio", { name: "2025" }));
    expect(figure()).toMatch(/9\.826,03\s€/);
    await user.clear(costs);
    await user.type(costs, "tanto");
    await user.tab();
    await waitFor(() => {
      expect(costs).toHaveAttribute("aria-invalid", "true");
    });
    expect(
      screen.getByText("Non aggiornato: correggi il campo segnato per ricalcolare."),
    ).toBeInTheDocument();
  });

  it("asks for the months of activity once you choose Commercianti", async () => {
    const { user } = setup();
    await user.click(screen.getByText("Contributi previdenziali"));
    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Gestione previdenziale" }),
      "commercianti",
    );
    const months = screen.getByRole("textbox", { name: "Mesi di attività nell’anno" });
    await user.clear(months);
    await user.type(months, "6");
    expect(screen.getByText("INPS Commercianti, 6 mesi")).toBeInTheDocument();
    expect(
      screen.getByText("Contributi INPS Commercianti", { selector: ".qg-ledger__name" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /altra copertura/ })).toBeNull();
    await waitFor(() => {
      expect(window.location.search).toBe("?g=commercianti&m=6");
    });
  });

  it("restores a shared link for a trader in Veneto and compares with the trade coefficient", () => {
    document.documentElement.setAttribute(RESTORE_PENDING_ATTRIBUTE, "");
    setup("/partita-iva-ordinario?f=80000&s=45000&r=veneto&g=commercianti&a=commercio");
    expect(document.documentElement.hasAttribute(RESTORE_PENDING_ATTRIBUTE)).toBe(false);
    expect(figure()).toMatch(/20\.151,39\s€/);
    const band = comparison();
    expect(band).toHaveTextContent(/23\.535,12\s€ all’anno: 3\.383,73\s€ in più/);
    expect(band).toHaveTextContent(/riduzione del 35%/);
  });

  it("uses the startup rate when you are in the first years", async () => {
    const { user } = setup();
    await user.click(screen.getByText("Confronto con il forfettario"));
    await user.click(await screen.findByRole("checkbox", { name: /primi 5 anni/ }));
    expect(comparison()).toHaveTextContent(/28\.391,06\s€/);
    expect(screen.getByText("coefficiente 78%, imposta 5%")).toBeInTheDocument();
  });

  it("says when the revenue is above the forfettario limit", async () => {
    const { user } = setup();
    const revenue = screen.getByRole("textbox", { name: /Compensi o ricavi dell’anno/ });
    await user.clear(revenue);
    await user.type(revenue, "90000");
    const band = comparison();
    expect(within(band).getByText("Oltre il limite del forfettario")).toBeInTheDocument();
    expect(band).toHaveTextContent(/superi il limite di 85\.000\s€ all’anno/);
    expect(within(band).queryByRole("table")).toBeNull();
  });

  it("keeps the detrazione within the tax and drops the surcharges when no IRPEF is due", () => {
    setup("/partita-iva-ordinario?f=20000&s=14000&y=2024&g=artigiani&m=6&a=altre-attivita");
    expect(figure()).toMatch(/3\.786,48\s€/);
    expect(screen.getByText("Lombardia, non dovuta")).toBeInTheDocument();
    expect(comparison()).toHaveTextContent(/1\.677,97\s€ in meno/);
  });

  it("speaks English on the English page", () => {
    setup("/en/ordinary-tax-regime", "en");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Self-employed under the ordinary regime",
    );
    expect(screen.getByRole("heading", { name: "Net per year" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "With the forfettario" })).toBeInTheDocument();
  });
});

import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { getMessages } from "@/i18n/messages/index.ts";
import InverseCalculator from "@/islands/InverseCalculator.tsx";
import { RESTORE_PENDING_ATTRIBUTE } from "@/islands/runtime/restoreSignal.ts";

const MESSAGES = {
  it: getMessages("it", ["form", "inverse"]),
  en: getMessages("en", ["form", "inverse"]),
};

function figure(): string {
  return document.querySelector(".qg-figure__value")?.textContent ?? "";
}

const roots: Root[] = [];

function setup(url = "/calcolo-netto-lordo", locale: "it" | "en" = "it") {
  window.history.replaceState(null, "", url);
  const user = userEvent.setup();
  const island = <InverseCalculator locale={locale} messages={MESSAGES[locale]} />;
  const container = document.createElement("div");
  container.innerHTML = renderToString(island);
  document.body.append(container);
  act(() => {
    roots.push(hydrateRoot(container, island));
  });
  return { user, target: screen.getByRole("textbox", { name: /netto annuo|annual net/i }) };
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

describe("InverseCalculator", () => {
  it("renders the default gross on the server, with its assumptions and a ledger that sums", () => {
    const html = renderToString(<InverseCalculator locale="it" messages={MESSAGES.it} />);
    expect(html).toContain("RAL necessaria");
    expect(html).toMatch(/per 24\.000,00\s€ netti all’anno/);
    expect(html).toContain("Addizionale comunale 0,80%, comune non scelto");
    expect(html).toContain("Addizionale regionale");
    expect(html).toContain("Dettaglio del calcolo");
  });

  it("reads 35k while typing and gives the monthly net after leaving the field", async () => {
    const { user, target } = setup();
    const before = figure();
    await user.clear(target);
    await user.type(target, "30k");
    expect(target).toHaveAccessibleDescription(/Letto come 30\.000,00\s€/);
    expect(figure()).not.toBe(before);
    await user.tab();
    await waitFor(() => {
      expect(target).toHaveValue("30.000");
      expect(target).toHaveAccessibleDescription(/2\.307,69\s€ netti al mese su 13 mensilità/);
    });
  });

  it("asks whether a small amount is monthly", async () => {
    const { user, target } = setup();
    await user.clear(target);
    await user.type(target, "1800");
    await user.tab();
    await waitFor(() => {
      expect(target).toHaveAccessibleDescription(
        /È un importo mensile\? .*1\.800\s€ al mese su 13 mensilità sono 23\.400\s€/,
      );
    });
  });

  it("shows the prompt, not a number, when the target is empty", async () => {
    const { user, target } = setup();
    await user.clear(target);
    expect(screen.getByText("Inserisci il netto annuo per vedere la RAL.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Dettaglio del calcolo" })).toBeNull();
  });

  it("marks the target on blur and keeps the last gross as out of date", async () => {
    const { user, target } = setup();
    await user.clear(target);
    await user.type(target, "ventimila");
    expect(target).not.toHaveAttribute("aria-invalid");
    await user.tab();
    await waitFor(() => {
      expect(target).toHaveAttribute("aria-invalid", "true");
    });
    expect(target).toHaveAccessibleDescription(/Errore: Scrivi il netto annuo come importo/);
    expect(
      screen.getByText(/Non aggiornato: è la RAL per 24\.000,00\s€ netti/),
    ).toBeInTheDocument();
    await user.clear(target);
    await user.type(target, "20000");
    expect(target).not.toHaveAttribute("aria-invalid");
  });

  it("restores a shared link, ends the restore and shows its errors", () => {
    document.documentElement.setAttribute(RESTORE_PENDING_ATTRIBUTE, "");
    setup("/calcolo-netto-lordo?n=30000&r=lazio&m=14&c=3");
    expect(document.documentElement.hasAttribute(RESTORE_PENDING_ATTRIBUTE)).toBe(false);
    expect(screen.getByRole("textbox", { name: /netto annuo/i })).toHaveValue("30.000");
    expect(screen.getByRole("combobox", { name: "Regione di residenza" })).toHaveValue("lazio");
    expect(screen.getByRole("radio", { name: "14" })).toBeChecked();
    const rate = screen.getByRole("textbox", { name: /Aliquota dell’addizionale comunale/ });
    expect(rate).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Correggi i valori segnati per vedere la RAL.")).toBeInTheDocument();
  });

  it("opens the contract group and focuses the choice from the assumptions", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("link", { name: "Cambia contratto" }));
    expect(screen.getByRole("radio", { name: "Tempo indeterminato" })).toHaveFocus();
    await user.click(screen.getByRole("radio", { name: "Apprendistato" }));
    expect(
      screen.getByText("Apprendistato, settore privato", { selector: ".qg-assumptions__text" }),
    ).toBeInTheDocument();
  });

  it("links the gross it found to the payslip and the employer cost", () => {
    setup("/calcolo-netto-lordo?n=30000&y=2025&r=lazio");
    const cost = screen.getByRole("link", { name: /quanto costa all’azienda/ });
    expect(cost.getAttribute("href")).toMatch(/^\/costo-azienda\?l=\d+&y=2025&r=lazio$/);
    const home = screen.getByRole("link", { name: "Calcola il netto dalla RAL" });
    expect(home.getAttribute("href")).toBe("/?y=2025&r=lazio");
  });

  it("says so when no gross gives the target exactly", () => {
    setup("/calcolo-netto-lordo?n=8300&y=2024");
    const aside = document.querySelector(".qg-figure__aside")?.textContent ?? "";
    expect(aside).toMatch(/^Nessuna RAL dà esattamente 8\.300,00\s€ netti/);
    expect(aside).toMatch(/La RAL più vicina dà 9\.373,94\s€ netti all’anno\.$/);
  });

  it("speaks English on the English page", () => {
    setup("/en/net-to-gross", "en");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("From net to gross");
    expect(screen.getByRole("heading", { name: "Gross salary needed" })).toBeInTheDocument();
  });
});

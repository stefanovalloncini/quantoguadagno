import { act, screen, waitFor, within } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { getMessages } from "@/i18n/messages/index.ts";
import EmployeeCalculator from "@/islands/EmployeeCalculator.tsx";
import { RESTORE_PENDING_ATTRIBUTE } from "@/islands/runtime/restoreSignal.ts";

const MESSAGES = {
  it: getMessages("it", ["form", "employee"]),
  en: getMessages("en", ["form", "employee"]),
};

function resultStatus(): HTMLElement {
  const result = document.querySelector<HTMLElement>(".qg-result");
  if (result === null) throw new Error("Missing result");
  const [status] = within(result).getAllByRole("status");
  if (status === undefined) throw new Error("Missing status");
  return status;
}

function figure(): string {
  return document.querySelector(".qg-figure__value")?.textContent ?? "";
}

function figureLines(): string[] {
  return [...document.querySelectorAll(".qg-figure__sub")].map((line) => line.textContent);
}

const roots: Root[] = [];

function setup(url = "/", locale: "it" | "en" = "it") {
  window.history.replaceState(null, "", url);
  const user = userEvent.setup();
  const island = <EmployeeCalculator locale={locale} messages={MESSAGES[locale]} />;
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

describe("EmployeeCalculator", () => {
  it("elides the article before a share read with undici: l’11,77% del lordo", () => {
    setup("/?l=9700");
    expect(document.querySelector(".qg-figure__aside")?.textContent).toMatch(
      /, l’11,\d\d% del lordo/,
    );
  });

  it("renders the default result on the server, so the figure is in the HTML", () => {
    const html = renderToString(<EmployeeCalculator locale="it" messages={MESSAGES.it} />);
    expect(html).toContain("1.801,96 €");
    expect(html).toContain("Netto mensile");
    expect(html).toContain("comune non scelto, 0,80%");
  });

  it("reads 35k while typing and shows the monthly gross after leaving the field", async () => {
    const { user, ral } = setup();
    await user.clear(ral);
    await user.type(ral, "35k");
    expect(ral).toHaveAccessibleDescription(/Letto come 35\.000,00\s€/);
    expect(figure()).toBe("2.002,48 €");
    await user.tab();
    await waitFor(() => {
      expect(ral).toHaveValue("35.000");
      expect(ral).toHaveAccessibleDescription(/2\.692,31\s€ lordi al mese su 13 mensilità/);
    });
  });

  it("shows the prompt, not a number, when the RAL is empty", async () => {
    const { user, ral } = setup();
    await user.clear(ral);
    expect(screen.getByText("Inserisci la RAL per vedere il netto.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Dettaglio del calcolo" })).toBeNull();
  });

  it("marks the RAL on blur and keeps the last figure as out of date", async () => {
    const { user, ral } = setup();
    await user.clear(ral);
    await user.type(ral, "trentacinquemila");
    expect(screen.queryByText(/Inserisci la RAL in cifre/)).toBeNull();
    await user.tab();
    await waitFor(() => {
      expect(ral).toHaveAttribute("aria-invalid", "true");
    });
    expect(ral).toHaveAccessibleDescription(
      /Errore: Inserisci la RAL in cifre, per esempio 35\.000/,
    );
    expect(screen.getByText(/Non aggiornato: è il risultato per/)).toBeInTheDocument();
    await user.clear(ral);
    await user.type(ral, "40000");
    expect(ral).not.toHaveAttribute("aria-invalid");
  });

  it("marks the result out of date after a pause, even before the field is left", async () => {
    const { user, ral } = setup();
    await user.clear(ral);
    await user.type(ral, "trentacinquemila");
    await waitFor(
      () => {
        expect(screen.getByText(/Non aggiornato: è il risultato per/)).toBeInTheDocument();
      },
      { timeout: 1500 },
    );
    expect(ral).not.toHaveAttribute("aria-invalid");
  });

  it("shows the errors of a shared link that carries values the form rejects", () => {
    setup("/?l=35000&c=3");
    const rate = screen.getByRole("textbox", { name: /Aliquota dell’addizionale comunale/ });
    expect(rate).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Correggi i valori segnati per vedere il netto.")).toBeInTheDocument();
  });

  it("keeps the chosen comune until a rate is typed, and brings it back", async () => {
    const { user } = setup("/?k=F205");
    const comune = await screen.findByDisplayValue("Milano (MI)");
    expect(comune).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Inserisci l’aliquota a mano" }));
    const rate = screen.getByRole("textbox", { name: /Aliquota dell’addizionale comunale/ });
    expect(rate).toHaveValue("0,8");
    expect(rate).toHaveAccessibleDescription(/Per ora resta Milano/);
    expect(screen.getByText("Milano, 0,80%")).toBeInTheDocument();
    await user.clear(rate);
    await user.type(rate, "0,5");
    expect(screen.getByText("aliquota inserita, 0,50%")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cerca di nuovo il comune" }));
    expect(screen.getByRole("combobox", { name: "Comune di residenza" })).toHaveValue(
      "Milano (MI)",
    );
  });

  it("mirrors the amount while typing and asks whether it is monthly once the field is left", async () => {
    const { user, ral } = setup();
    await user.clear(ral);
    await user.type(ral, "2500");
    expect(ral).toHaveAccessibleDescription(/Letto come 2\.500,00\s€/);
    await new Promise((resolve) => {
      window.setTimeout(resolve, 800);
    });
    expect(ral).not.toHaveAccessibleDescription(/È un importo mensile\?/);
    await user.tab();
    await waitFor(
      () => {
        expect(ral).toHaveAccessibleDescription(/È un importo mensile\?/);
      },
      { timeout: 1500 },
    );
    expect(figure()).toBe("187,03 €");
  });

  it("announces the new net once, after the changes settle", async () => {
    const { user, ral } = setup();
    const status = resultStatus();
    expect(status).toHaveTextContent("");
    await user.clear(ral);
    await user.type(ral, "35000");
    await waitFor(
      () => {
        expect(status).toHaveTextContent(/Netto mensile 2\.002,48\s€, media su 13 mensilità\./);
      },
      { timeout: 1500 },
    );
  });

  it("keeps the ledger rule consistent with a zero amount and lists credits apart", async () => {
    setup("/?l=20000&k=F205");
    expect(await screen.findByText(/Milano, esente fino a 23\.000\s€/)).toBeInTheDocument();
    expect(document.querySelector(".qg-figure__aside")).toHaveTextContent(
      /Crediti in busta paga: 871,78\s€, già compresi nel netto/,
    );
  });

  it("explains every ledger line on demand", async () => {
    const { user } = setup("/?l=20000");
    expect(
      screen.getByRole("rowheader", { name: /^Somma aggiuntiva, credito/ }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Mostra la spiegazione di ogni voce" }));
    expect(await screen.findByText(/riceve in busta paga una somma in più/)).toBeInTheDocument();
    expect(screen.getByText(/imponibile meno imposte, più crediti/)).toBeInTheDocument();
  });

  it("restores a shared link with its comune before showing the result", async () => {
    document.documentElement.setAttribute(RESTORE_PENDING_ATTRIBUTE, "");
    setup("/?l=42000&y=2025&r=lazio&k=H501");
    expect(document.documentElement).toHaveAttribute(RESTORE_PENDING_ATTRIBUTE);
    await waitFor(() => {
      expect(document.documentElement).not.toHaveAttribute(RESTORE_PENDING_ATTRIBUTE);
    });
    expect(screen.getByRole("combobox", { name: "Comune di residenza" })).toHaveValue("Roma (RM)");
    expect(figure()).toBe("2.156,92 €");
  });

  it("works in English with the euro sign first", () => {
    setup("/", "en");
    expect(figure()).toBe("€1,801.96");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Net salary");
  });

  it("says how many of the values in use are still to be verified", () => {
    setup();
    expect(
      screen.getByText(/valori usati in questo calcolo sono ancora da verificare/),
    ).toBeInTheDocument();
  });
});

// Splits from docs/data-verification/tredicesima.md (Lombardia, 0,80%, 2026).
describe("EmployeeCalculator ordinary month and extra months", () => {
  it("puts the ordinary month and the tredicesima under the average, server side too", () => {
    const html = renderToString(<EmployeeCalculator locale="it" messages={MESSAGES.it} />);
    expect(html).toMatch(/Mese normale <strong>1\.817,66\s€<\/strong>, tredicesima <strong>/);
    setup();
    expect(figure()).toMatch(/^1\.801,96\s€$/);
    const [split, annual] = figureLines();
    expect(split).toMatch(/^Mese normale 1\.817,66\s€, tredicesima 1\.613,62\s€$/);
    expect(annual).toMatch(/^Netto annuo 23\.425,52\s€$/);
  });

  it("names the tredicesima and the quattordicesima with 14 mensilità", () => {
    setup("/?l=35000&m=14");
    expect(figure()).toMatch(/^1\.859,44\s€$/);
    expect(figureLines()[0]).toMatch(
      /^Mese normale 1\.878,00\s€, tredicesima e quattordicesima 1\.748,09\s€ ciascuna$/,
    );
  });

  it("speaks of extra months from 15 mensilità", () => {
    setup("/?m=15");
    expect(figureLines()[0]).toMatch(
      /^Mese normale 1\.602,51\s€, mensilità aggiuntive 1\.398,47\s€ ciascuna$/,
    );
  });

  it("shows only the annual net with 12 mensilità", () => {
    setup("/?m=12");
    expect(figureLines()).toHaveLength(1);
    expect(figureLines()[0]).toMatch(/^Netto annuo 23\.425,52\s€$/);
  });

  it("keeps only the average when a performance bonus joins the year", async () => {
    const { user } = setup();
    const benefits = document.querySelector<HTMLElement>("#gruppo-benefit > summary");
    if (benefits === null) throw new Error("Missing benefits group");
    await user.click(benefits);
    const premio = await screen.findByRole("textbox", { name: /Premio di risultato/ });
    await user.type(premio, "1000");
    await waitFor(() => {
      expect(figureLines()).toHaveLength(1);
    });
    expect(screen.queryByText(/Mese normale/)).toBeNull();
  });

  it("keeps only the average above the INPS contribution cap", () => {
    setup("/?l=150000");
    expect(screen.queryByText(/Mese normale/)).toBeNull();
    expect(figureLines()).toHaveLength(1);
  });

  it("mirrors the line in English", () => {
    setup("/", "en");
    expect(figureLines()[0]).toMatch(/^Normal month €1,817\.66, thirteenth month €1,613\.62$/);
  });
});

describe("EmployeeCalculator timing", () => {
  it("does not announce anything on load", async () => {
    setup("/?l=35000");
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
    });
    const status = resultStatus();
    expect(status).toHaveTextContent("");
  });
});

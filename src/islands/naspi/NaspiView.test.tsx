import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { getMessages } from "@/i18n/messages/index.ts";
import { formatMoney } from "@/i18n/numbers.ts";
import NaspiCalculator from "@/islands/NaspiCalculator.tsx";

const MESSAGES = {
  it: getMessages("it", ["form", "naspi"]),
  en: getMessages("en", ["form", "naspi"]),
};

const roots: Root[] = [];

function euro(value: number, options?: { readonly integer?: boolean }): string {
  return formatMoney(value, "it", options);
}

function summary(): string {
  const root = document.querySelector(".qg-result__summary");
  if (root === null) return "";
  const shown = root.cloneNode(true) as Element;
  for (const hidden of shown.querySelectorAll("[aria-hidden='true']")) hidden.remove();
  return shown.textContent;
}

function setup(locale: "it" | "en" = "it") {
  const user = userEvent.setup();
  const island = <NaspiCalculator locale={locale} messages={MESSAGES[locale]} />;
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
});

describe("NaspiCalculator", () => {
  it("renders the default gross amount, the net estimate, the ledger and the chart on the server", () => {
    const html = renderToString(<NaspiCalculator locale="it" messages={MESSAGES.it} />);
    expect(html).toContain(euro(1270.03));
    expect(html).toContain(`Circa <strong>${euro(1130, { integer: true })}</strong> netti al mese`);
    expect(html).toContain("Dettaglio del calcolo");
    expect(html).toContain("qg-chart__frame");
    expect(html).not.toContain("<template");
  });

  it("leads with the board case: 60.000 € over 104 weeks at 34", async () => {
    const { user } = setup();
    const gross = screen.getByRole("textbox", { name: /Retribuzione lorda/ });
    await user.clear(gross);
    await user.type(gross, "60k");
    const weeks = screen.getByRole("textbox", { name: /Settimane di contributi negli ultimi/ });
    await user.clear(weeks);
    await user.type(weeks, "104");
    const age = screen.getByRole("textbox", { name: /Età alla domanda/ });
    await user.clear(age);
    await user.type(age, "34");
    await waitFor(() => {
      expect(summary()).toContain(euro(1353.36));
    });
    expect(summary()).toContain("nei primi 5 mesi");
    expect(summary()).toContain(euro(15169.22));
  });

  it("says in words when NASpI is not due, with what to check", async () => {
    const { user } = setup();
    const weeks = screen.getByRole("textbox", { name: /Settimane di contributi negli ultimi/ });
    await user.clear(weeks);
    await user.type(weeks, "10");
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "La NASpI non spetta" })).toBeInTheDocument();
    });
    expect(summary()).toContain("ne hai indicate 10");
    expect(screen.getByRole("heading", { name: "Cosa controllare" })).toBeInTheDocument();
    expect(document.querySelector(".qg-chart")).toBeNull();
  });

  it("asks for the weeks after a resignation and blocks NASpI below 13", async () => {
    const { user } = setup("en");
    await user.click(screen.getByRole("checkbox", { name: /You resigned/ }));
    await waitFor(() => {
      expect(summary()).toContain("you entered none");
    });
    const after = screen.getByRole("textbox", { name: /Weeks of contributions after/ });
    await user.type(after, "20");
    await waitFor(() => {
      expect(summary()).toContain("€1,270.03");
    });
  });

  it("keeps the last figure, marked out of date, while a value is wrong", async () => {
    const { user } = setup();
    const weeks = screen.getByRole("textbox", { name: /Settimane di contributi negli ultimi/ });
    await user.clear(weeks);
    await user.type(weeks, "abc");
    await user.tab();
    await waitFor(() => {
      expect(summary()).toContain("Non aggiornato");
    });
    expect(summary()).toContain(euro(1270.03));
    expect(screen.getByText(/Scrivi un numero intero da 0 a 208/)).toBeInTheDocument();
  });
});

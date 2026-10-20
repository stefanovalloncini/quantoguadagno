import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { getMessages } from "@/i18n/messages/index.ts";
import ComparisonCalculator from "@/islands/ComparisonCalculator.tsx";

const MESSAGES = {
  it: getMessages("it", ["form", "comparison"]),
  en: getMessages("en", ["form", "comparison"]),
};

const NBSP = "\u00a0";

const roots: Root[] = [];

function setup(locale: "it" | "en" = "it") {
  const user = userEvent.setup();
  const island = <ComparisonCalculator locale={locale} messages={MESSAGES[locale]} />;
  const container = document.createElement("div");
  container.innerHTML = renderToString(island);
  document.body.append(container);
  act(() => {
    roots.push(hydrateRoot(container, island));
  });
  const [ralA, ralB] = screen.getAllByRole("textbox", { name: /RAL/ });
  if (ralA === undefined || ralB === undefined) throw new Error("Missing RAL fields");
  return { user, ralA, ralB };
}

function verdictHeading(): string {
  return document.querySelector("#verdetto-titolo")?.textContent ?? "";
}

function verdictText(): string {
  return document.querySelector(".qg-verdict__text")?.textContent ?? "";
}

function verdictValue(): string {
  return document.querySelector(".qg-verdict .qg-figure__value")?.textContent ?? "";
}

async function chooseFrequency(
  user: ReturnType<typeof userEvent.setup>,
  offer: "A" | "B",
  count: number,
) {
  const group = screen.getByRole("group", { name: new RegExp(`offerta ${offer}`) });
  await user.click(within(group).getByRole("radio", { name: String(count) }));
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

describe("ComparisonCalculator", () => {
  it("renders the default verdict on the server", () => {
    const html = renderToString(<ComparisonCalculator locale="it" messages={MESSAGES.it} />);
    expect(html).toContain("Con l’offerta B ti resta di più");
    expect(html).toContain(`+2.606,69${NBSP}€`);
    expect(html).toContain("Le due offerte voce per voce");
  });

  it("names B on the approved board, with smaller payslips over a larger year", async () => {
    const { user, ralA, ralB } = setup();
    await user.clear(ralA);
    await user.type(ralA, "35.000");
    await user.clear(ralB);
    await user.type(ralB, "38k");
    await chooseFrequency(user, "B", 14);
    expect(verdictHeading()).toBe("Con l’offerta B ti resta di più");
    expect(verdictValue()).toBe(`+1.206,66${NBSP}€`);
    expect(verdictText()).toContain("Ogni busta paga di B è più bassa");
    expect(verdictText()).toContain("cioè il 40,22%");
  });

  it("names A when A pays more", async () => {
    const { user, ralA, ralB } = setup();
    await user.clear(ralA);
    await user.type(ralA, "36000");
    await user.clear(ralB);
    await user.type(ralB, "35000");
    await chooseFrequency(user, "B", 14);
    expect(verdictHeading()).toBe("Con l’offerta A ti resta di più");
    expect(verdictValue()).toBe(`+420,26${NBSP}€`);
    expect(document.querySelector(".qg-verdict .qg-figure__sub")).toHaveTextContent(
      "In media 35,02 € in più al mese, su 12 mesi",
    );
  });

  it("declares a tie and shows the common net", async () => {
    const { user, ralA } = setup();
    await user.clear(ralA);
    await user.type(ralA, "35000");
    await chooseFrequency(user, "B", 14);
    expect(verdictHeading()).toBe("Le due offerte ti lasciano lo stesso netto");
    expect(verdictValue()).toBe(`26.032,21${NBSP}€`);
    expect(screen.getByText(/13 buste paga con A, 14 con B/)).toBeInTheDocument();
  });

  it("marks a wrong RAL after leaving the field and keeps the last verdict as out of date", async () => {
    const { user, ralB } = setup();
    await user.clear(ralB);
    await user.type(ralB, "abc");
    await user.tab();
    await waitFor(() => {
      expect(ralB).toHaveAccessibleDescription(/Inserisci la RAL in cifre/);
    });
    expect(document.querySelector(".qg-verdict .qg-figure--stale")).not.toBeNull();
    expect(screen.getByText(/è il confronto di prima/)).toBeInTheDocument();
  });

  it("asks for both RAL values instead of showing a number", async () => {
    const { user, ralA } = setup();
    await user.clear(ralA);
    await user.tab();
    expect(
      screen.getByText("Inserisci la RAL di entrambe le offerte per confrontarle."),
    ).toBeInTheDocument();
    expect(ralA).not.toHaveAccessibleDescription(/Errore/);
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("opens a condition group and sums up the choice in its summary", async () => {
    const { user } = setup();
    const group = document.getElementById("gruppo-familiari");
    expect(group?.querySelector(".qg-group__recap")).toHaveTextContent(/^Nessuno$/);
    await user.click(screen.getByText("Familiari a carico"));
    expect(group).toHaveAttribute("open");
    await user.click(await screen.findByRole("checkbox", { name: "Coniuge a carico" }));
    expect(group?.querySelector(".qg-group__recap")).toHaveTextContent(/^Coniuge$/);
  });

  it("speaks English", () => {
    setup("en");
    expect(verdictHeading()).toBe("Offer B leaves you more");
    expect(verdictValue()).toBe("+€2,606.69");
  });
});

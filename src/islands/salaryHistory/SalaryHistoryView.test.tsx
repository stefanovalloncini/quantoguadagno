import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { getMessages } from "@/i18n/messages/index.ts";
import SalaryHistory from "@/islands/SalaryHistory.tsx";
import { SALARY_HISTORY_STORAGE_KEY } from "@/islands/runtime/storedKeys.ts";

const MESSAGES = getMessages("it", ["form", "salaryHistory"]);
const roots: Root[] = [];

function stored(): readonly { readonly year: number; readonly grossAnnual: number }[] {
  return JSON.parse(window.localStorage.getItem(SALARY_HISTORY_STORAGE_KEY) ?? "[]") as {
    year: number;
    grossAnnual: number;
  }[];
}

function setup() {
  const user = userEvent.setup();
  const island = <SalaryHistory locale="it" messages={MESSAGES} />;
  const container = document.createElement("div");
  container.innerHTML = renderToString(island);
  document.body.append(container);
  act(() => {
    roots.push(hydrateRoot(container, island));
  });
  return { user };
}

async function addYear(user: ReturnType<typeof userEvent.setup>, year: string, gross: string) {
  await user.selectOptions(screen.getByRole("combobox", { name: "Anno" }), year);
  const ral = screen.getByRole("textbox", { name: /Stipendio lordo annuo/ });
  await user.clear(ral);
  await user.type(ral, gross);
  await user.click(screen.getByRole("button", { name: "Aggiungi l’anno" }));
}

beforeAll(() => {
  Element.prototype.scrollIntoView = () => undefined;
});

afterEach(() => {
  act(() => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
  window.localStorage.clear();
});

describe("SalaryHistory", () => {
  it("renders an empty state on the server, without stored years", () => {
    const html = renderToString(<SalaryHistory locale="it" messages={MESSAGES} />);
    expect(html).toContain("Aggiungi la RAL di almeno due anni");
    expect(html).not.toContain("Anni inseriti");
  });

  it("adds years to this browser and shows the change in purchasing power", async () => {
    const { user } = setup();
    await addYear(user, "2019", "25k");
    await addYear(user, "2026", "33.000");
    expect(stored().map((entry) => [entry.year, entry.grossAnnual])).toEqual([
      [2019, 25_000],
      [2026, 33_000],
    ]);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Potere d’acquisto" })).toBeInTheDocument();
    });
    expect(document.querySelector(".qg-figure__value")?.textContent).toBe("+9,1%");
    const table = screen.getByRole("table", { name: /Anni inseriti/ });
    expect(
      within(table)
        .getAllByRole("rowheader")
        .map((cell) => cell.textContent),
    ).toEqual(["2019", "2026"]);
  });

  it("blocks a missing salary and a year already added, with an error summary", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Aggiungi l’anno" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Inserisci la RAL");
    await addYear(user, "2019", "25.000");
    await addYear(user, "2019", "26.000");
    expect(await screen.findByRole("alert")).toHaveTextContent("Hai già aggiunto il 2019");
    expect(stored()).toHaveLength(1);
  });

  it("removes a year and reads older stored entries", async () => {
    window.localStorage.setItem(
      SALARY_HISTORY_STORAGE_KEY,
      JSON.stringify([
        { id: "x", year: 2018, grossAnnual: 24_000, createdAt: "2024-05-01T10:00:00.000Z" },
        { id: "y", year: 2023, grossAnnual: 29_000, createdAt: "2024-05-01T10:00:00.000Z" },
      ]),
    );
    const { user } = setup();
    await waitFor(() => {
      expect(screen.getByText(/versione precedente del sito/)).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /Rimuovi il 2018/ }));
    expect(stored().map((entry) => entry.year)).toEqual([2023]);
    expect(document.activeElement?.textContent).toContain("2023");
  });
});

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { LOCALES, type Locale } from "@/i18n/locales.ts";
import { getMessages, getT } from "@/i18n/messages/index.ts";
import { formatMoney } from "@/i18n/numbers.ts";
import NetAmountPage, { NET_AMOUNT_NAMESPACES } from "@/islands/NetAmountPage.tsx";
import NetTableHub from "@/islands/NetTableHub.tsx";
import { hrefFor, routeById } from "@/routes.ts";
import { NET_TABLE_AMOUNTS, netTablePath } from "./amounts.ts";
import { calculatorHref, employerCostHref } from "./links.ts";
import { amountPage, monthlyOf, netRow, type AmountPage, type LedgerLine } from "./model.ts";
import { loadResidences, referenceResidence } from "./residences.ts";

const YEAR = LATEST_SUPPORTED_YEAR;
const milano = referenceResidence(YEAR);
const residences = await loadResidences(YEAR);

describe.each(LOCALES)("gross to net table in %s", (locale) => {
  const messages = getMessages(locale, routeById("netTable").namespaces);

  function renderHub() {
    return render(<NetTableHub locale={locale} messages={messages} />);
  }

  it("names the tax year in the title", () => {
    renderHub();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(String(YEAR));
  });

  it("lists every amount, each linked to its own page", () => {
    renderHub();
    const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(NET_TABLE_AMOUNTS.length);
    NET_TABLE_AMOUNTS.forEach((amount, index) => {
      const row = rows[index];
      if (row === undefined) throw new Error(`missing row for ${String(amount)}`);
      expect(within(row).getByRole("link").getAttribute("href")).toBe(netTablePath(amount, locale));
    });
  });

  it("shows the net of the reference scenario for each amount", () => {
    renderHub();
    const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    const index = NET_TABLE_AMOUNTS.indexOf(30_000);
    const row = netRow(30_000, YEAR, milano);
    expect(rows[index]?.textContent).toContain(formatMoney(row.netAnnual, locale));
    expect(rows[index]?.textContent).toContain(formatMoney(row.monthly[1]?.net ?? 0, locale));
  });

  it("opens the calculator on the reference comune and links the method", () => {
    renderHub();
    const links = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(links).toContain(hrefFor("home", locale, { k: milano.comuneId }));
    expect(links).toContain(hrefFor("method", locale));
    expect(links).toContain(hrefFor("glossary", locale));
  });

  it("ships no script and leaves no placeholder", () => {
    const { container } = renderHub();
    expect(container.querySelectorAll("script")).toHaveLength(0);
    expect(container.textContent).not.toMatch(/NaN|undefined|Infinity|\{/);
  });
});

const SAMPLES = [12_000, 25_000, 30_000, 60_000, 150_000];

/** Cents of an amount as the page writes it, in either language: −1.234,56 € or −€1,234.56. */
function centsOf(text: string): number {
  const digits = Number(text.replace(/[^\d]/g, ""));
  return text.includes("\u2212") ? -digits : digits;
}

function lineText(line: LedgerLine, locale: Locale): string {
  return formatMoney(line.annual, locale, {
    sign: line.kind === "credited" ? "always" : "negative",
  });
}

describe.each(LOCALES)("amount pages in %s", (locale) => {
  const messages = getMessages(locale, NET_AMOUNT_NAMESPACES);
  const t = getT(locale, "netTable");
  const employee = getT(locale, "employee");
  const money = (amount: number) => formatMoney(amount, locale);

  function renderPage(gross: number): { page: AmountPage; container: HTMLElement } {
    const page = amountPage(gross, YEAR, residences);
    const { container } = render(<NetAmountPage locale={locale} messages={messages} page={page} />);
    return { page, container };
  }

  function bodyRows(table: Element | null): readonly Element[] {
    return [...(table?.querySelectorAll("tbody > tr:not(.qg-ledger__explain-row)") ?? [])];
  }

  it.each(SAMPLES)("titles the page of %i with the amount and the tax year", (gross) => {
    renderPage(gross);
    const title = screen.getByRole("heading", { level: 1 }).textContent;
    expect(title).toContain(formatMoney(gross, locale, { integer: true }));
    expect(title).toContain(String(YEAR));
  });

  it.each(SAMPLES)("shows the monthly net of %i as the figure, with the annual net", (gross) => {
    const { page, container } = renderPage(gross);
    expect(container.querySelector(".qg-figure__value")?.textContent).toBe(
      money(page.breakdown.netMonthly),
    );
    expect(container.querySelector(".qg-figure__subs")?.textContent).toContain(
      money(page.row.netAnnual),
    );
  });

  it.each(SAMPLES)("lists the ledger lines of %i that add up to the net", (gross) => {
    const { page, container } = renderPage(gross);
    const ledger = container.querySelector("table.qg-ledger");
    const rows = bodyRows(ledger);
    expect(rows).toHaveLength(page.ledger.lines.length);
    const annuals = rows.map((row) => row.querySelector("td:last-child")?.textContent ?? "");
    expect(annuals).toEqual(page.ledger.lines.map((line) => lineText(line, locale)));
    const net = ledger?.querySelector("tfoot td:last-child")?.textContent ?? "";
    expect(net).toBe(money(page.ledger.net.annual));
    const moving = annuals.filter((_, index) => page.ledger.lines[index]?.kind !== "subtotal");
    expect(moving.reduce((sum, text) => sum + centsOf(text), 0)).toBe(centsOf(net));
  });

  it("says why the municipal surcharge is missing below the Milano threshold", () => {
    const { container } = renderPage(25_000);
    const threshold = formatMoney(milano.rule.exemption ?? 0, locale, { integer: true });
    expect(container.textContent).toContain(
      t("netTable.ledger.municipalExempt", { city: "Milano", threshold }),
    );
  });

  it.each(SAMPLES)("divides the net of %i by 12, 13 and 14 payslips", (gross) => {
    const { page } = renderPage(gross);
    const table = screen.getByRole("table", {
      name: t("netTable.months.caption", {
        gross: formatMoney(gross, locale, { integer: true }),
      }),
    });
    const cells = within(table)
      .getAllByRole("cell")
      .map((cell) => cell.textContent);
    expect(cells).toEqual(
      [12, 13, 14].map((count) => money(monthlyOf(page.row, count as 12 | 13 | 14))),
    );
  });

  it.each(SAMPLES)("compares %i in every capoluogo and marks the reference in words", (gross) => {
    const { page, container } = renderPage(gross);
    const table = container.querySelector("table.qg-table--stack");
    const rows = bodyRows(table);
    expect(rows).toHaveLength(21);
    const marked = rows.filter((row) => row.getAttribute("aria-current") === "true");
    expect(marked).toHaveLength(1);
    expect(marked[0]?.textContent).toContain(t("netTable.cities.reference"));
    expect(marked[0]?.textContent).toContain("Milano");
    const hrefs = rows.map((row) => row.querySelector("a")?.getAttribute("href"));
    expect(new Set(hrefs)).toEqual(
      new Set(page.cities.map((city) => calculatorHref(locale, YEAR, city.residence, gross))),
    );
  });

  it.each(SAMPLES)("opens the calculators on the scenario of %i", (gross) => {
    const { page, container } = renderPage(gross);
    const hrefs = [...container.querySelectorAll("a")].map((link) => link.getAttribute("href"));
    expect(container.querySelector("a.qg-button")?.getAttribute("href")).toBe(
      calculatorHref(locale, YEAR, page.residence, gross),
    );
    expect(hrefs).toContain(employerCostHref(locale, YEAR, page.residence, gross));
    expect(hrefs).toContain(hrefFor("method", locale));
    expect(hrefs).toContain(hrefFor("glossary", locale));
  });

  it.each(SAMPLES)("links the neighbours of %i and the whole table", (gross) => {
    const { page } = renderPage(gross);
    const pager = screen.getByRole("navigation", { name: t("netTable.pager.label") });
    const previous = pager.querySelector('a[rel="prev"]')?.getAttribute("href") ?? null;
    const next = pager.querySelector('a[rel="next"]')?.getAttribute("href") ?? null;
    expect(previous).toBe(page.previous === null ? null : netTablePath(page.previous, locale));
    expect(next).toBe(page.next === null ? null : netTablePath(page.next, locale));
    expect(
      within(pager)
        .getByRole("link", { name: t("netTable.pager.all") })
        .getAttribute("href"),
    ).toBe(hrefFor("netTable", locale));
  });

  it("names every assumption of the scenario, with nothing to change", () => {
    const { container } = renderPage(30_000);
    const list = container.querySelector(".qg-assumptions__list");
    const text = list?.textContent ?? "";
    expect(text).toContain(employee("employee.assumption.year", { year: YEAR }));
    expect(text).toContain("Milano");
    expect(text).toContain(employee("employee.assumption.frequency", { count: 13 }));
    expect(text).toContain(employee("employee.assumption.noDependents"));
    expect(text).toContain(employee("employee.assumption.noExpenses"));
    expect(text).toContain(employee("employee.assumption.noBenefits"));
    expect(list?.querySelectorAll("a")).toHaveLength(0);
  });

  // Worked by hand in model.test.ts from the 2026 rules.
  it("gives 23.425,52 € a year for 30.000 € in Milano, 1.952,13, 1.801,96 and 1.673,25 a month", () => {
    const { container } = renderPage(30_000);
    const text = container.textContent;
    for (const amount of [23_425.52, 1_952.13, 1_801.96, 1_673.25]) {
      expect(text).toContain(money(amount));
    }
  });

  it.each(SAMPLES)("ships no script and leaves no placeholder on the page of %i", (gross) => {
    const { container } = renderPage(gross);
    expect(container.querySelectorAll("script")).toHaveLength(0);
    expect(container.textContent).not.toMatch(/NaN|undefined|Infinity|\{/);
  });
});

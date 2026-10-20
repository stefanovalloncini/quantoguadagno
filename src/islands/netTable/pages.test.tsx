import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { LOCALES } from "@/i18n/locales.ts";
import { getMessages } from "@/i18n/messages/index.ts";
import { formatMoney } from "@/i18n/numbers.ts";
import NetTableHub from "@/islands/NetTableHub.tsx";
import { hrefFor, routeById } from "@/routes.ts";
import { NET_TABLE_AMOUNTS, netTablePath } from "./amounts.ts";
import { netRow } from "./model.ts";
import { referenceResidence } from "./residences.ts";

const YEAR = LATEST_SUPPORTED_YEAR;
const milano = referenceResidence(YEAR);

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

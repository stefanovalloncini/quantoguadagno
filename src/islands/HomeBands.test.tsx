import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { LOCALES } from "@/i18n/locales.ts";
import { getMessages, getT } from "@/i18n/messages/index.ts";
import { formatMoney } from "@/i18n/numbers.ts";
import EmployeeCalculator from "@/islands/EmployeeCalculator.tsx";
import HomeBands, { HOME_BANDS_NAMESPACES } from "@/islands/HomeBands.tsx";
import { COMMON_AMOUNTS, netTablePath } from "@/islands/netTable/amounts.ts";
import { netRow } from "@/islands/netTable/model.ts";
import { referenceResidence } from "@/islands/netTable/residences.ts";
import { hrefFor, routeById } from "@/routes.ts";

const milano = referenceResidence(LATEST_SUPPORTED_YEAR);

describe.each(LOCALES)("bands after the calculator on the home page in %s", (locale) => {
  const t = getT(locale, "netTable");
  const employee = getT(locale, "employee");

  function renderBands() {
    return render(
      <HomeBands locale={locale} messages={getMessages(locale, HOME_BANDS_NAMESPACES)} />,
    );
  }

  it("links the twelve most searched amounts to their pages, with their net", () => {
    renderBands();
    const band = screen.getByRole("region", { name: t("netTable.home.title") });
    const rows = within(band).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(COMMON_AMOUNTS.length);
    COMMON_AMOUNTS.forEach((gross, index) => {
      const row = rows[index];
      if (row === undefined) throw new Error(`missing row for ${String(gross)}`);
      expect(within(row).getByRole("link").getAttribute("href")).toBe(netTablePath(gross, locale));
      expect(row.textContent).toContain(
        formatMoney(netRow(gross, LATEST_SUPPORTED_YEAR, milano).netAnnual, locale),
      );
    });
    expect(
      within(band)
        .getByRole("link", { name: t("netTable.home.all") })
        .getAttribute("href"),
    ).toBe(hrefFor("netTable", locale));
  });

  it("closes with the topics, after the amounts", () => {
    const { container } = renderBands();
    const headings = [...container.querySelectorAll("h2")].map((heading) => heading.textContent);
    expect(headings).toEqual([t("netTable.home.title"), employee("employee.topics.title")]);
    expect(container.querySelectorAll("script")).toHaveLength(0);
  });

  it("leaves the topics out of the calculator island", () => {
    render(
      <EmployeeCalculator
        locale={locale}
        messages={getMessages(locale, routeById("home").namespaces)}
      />,
    );
    expect(screen.queryByRole("heading", { name: employee("employee.topics.title") })).toBeNull();
  });
});

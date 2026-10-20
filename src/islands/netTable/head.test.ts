import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { LOCALES } from "@/i18n/locales.ts";
import { getT } from "@/i18n/messages/index.ts";
import { formatMoney } from "@/i18n/numbers.ts";
import { absoluteUrl, pathFor } from "@/routes.ts";
import { NET_TABLE_AMOUNTS, netTablePaths } from "./amounts.ts";
import { amountHead } from "./head.ts";
import { amountPage } from "./model.ts";
import { loadResidences } from "./residences.ts";

const YEAR = LATEST_SUPPORTED_YEAR;
const residences = await loadResidences(YEAR);
const TITLE_MAX = 65;
const DESCRIPTION_MAX = 155;

describe.each(LOCALES)("head of the amount pages in %s", (locale) => {
  const layout = getT(locale, "layout");
  const heads = NET_TABLE_AMOUNTS.map((gross) => {
    const page = amountPage(gross, YEAR, residences);
    return { gross, page, head: amountHead(page, locale) };
  });

  it("keeps the title within 65 characters with the site name, amount first, year in", () => {
    for (const { gross, head } of heads) {
      const title = layout("title.page", { site: layout("brand.name"), page: head.title });
      expect(title.length, title).toBeLessThanOrEqual(TITLE_MAX);
      expect(head.title.startsWith(formatMoney(gross, locale, { integer: true }))).toBe(true);
      expect(head.title).toContain(String(YEAR));
    }
  });

  it("keeps the description within 155 characters, with the net of 13 and 14 payslips", () => {
    for (const { page, head } of heads) {
      expect(head.description.length, head.description).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(head.description).toContain(formatMoney(page.row.netAnnual, locale));
      expect(head.description).toContain(formatMoney(page.breakdown.netMonthly, locale));
    }
  });

  it("names the same amount in both languages", () => {
    for (const { gross, head } of heads) expect(head.paths).toEqual(netTablePaths(gross));
  });

  it("trails from the home page through the table to the amount", () => {
    for (const { head } of heads) {
      expect(head.trail.map((crumb) => crumb.url)).toEqual([
        absoluteUrl(pathFor("home", locale)),
        absoluteUrl(pathFor("netTable", locale)),
        absoluteUrl(head.paths[locale]),
      ]);
      expect(head.trail[1]?.name).toBe(layout("nav.netTable"));
    }
  });
});

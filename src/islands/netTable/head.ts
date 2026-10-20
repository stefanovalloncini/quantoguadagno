import type { Locale } from "@/i18n/locales.ts";
import { getT } from "@/i18n/messages/index.ts";
import { formatMoney } from "@/i18n/numbers.ts";
import { absoluteUrl, pathFor } from "@/routes.ts";
import type { PageHead } from "@/seo/pageHead.ts";
import { netTablePaths } from "./amounts.ts";
import { monthlyOf, type AmountPage } from "./model.ts";
import { placeName } from "./present.ts";

/** Title, description, paths in both languages and breadcrumb trail of an amount page. */
export function amountHead(page: AmountPage, locale: Locale): PageHead {
  const t = getT(locale, "netTable");
  const layout = getT(locale, "layout");
  const money = (value: number) => formatMoney(value, locale);
  const gross = formatMoney(page.gross, locale, { integer: true });
  const paths = netTablePaths(page.gross);
  return {
    title: t("netTable.page.metaTitle", {
      gross,
      year: page.year,
      monthly: money(page.breakdown.netMonthly),
    }),
    description: t("netTable.page.metaDescription", {
      gross,
      year: page.year,
      net: money(page.row.netAnnual),
      thirteen: money(monthlyOf(page.row, 13)),
      fourteen: money(monthlyOf(page.row, 14)),
      city: placeName(page.residence.comuneName),
    }),
    paths,
    trail: [
      { name: layout("brand.name"), url: absoluteUrl(pathFor("home", locale)) },
      { name: layout("nav.netTable"), url: absoluteUrl(pathFor("netTable", locale)) },
      { name: t("netTable.page.crumb", { gross }), url: absoluteUrl(paths[locale]) },
    ],
  };
}

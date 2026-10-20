import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  COMUNI_SOURCE,
  LATEST_SUPPORTED_YEAR,
  latestVerification,
  param,
  yearStart,
} from "@/data/index.ts";
import { DATASETS, listParameters } from "@/data/fonti.ts";
import { formatMoney } from "@/i18n/numbers.ts";
import { LOCALES } from "@/i18n/locales.ts";
import { getMessages } from "@/i18n/messages/index.ts";
import { dateText, percentText } from "@/islands/prose/phrases.ts";
import { routeById } from "@/routes.ts";
import { SOURCE_REPOSITORY_URL } from "@/sourceRepository.ts";
import AboutPage from "./AboutPage.tsx";
import GlossaryPage from "./GlossaryPage.tsx";
import { methodExample } from "./method/example.ts";
import MethodPage from "./MethodPage.tsx";
import SourcesPage from "./SourcesPage.tsx";

const MINUS_SIGN = "−";

function messagesFor(id: "sources" | "method" | "glossary" | "about", locale: "it" | "en") {
  return getMessages(locale, routeById(id).namespaces);
}

describe.each(LOCALES)("Fonti e dati in %s", (locale) => {
  it("collega ogni fonte che ha un indirizzo e mostra la data del controllo", () => {
    const { container } = render(
      <SourcesPage locale={locale} messages={messagesFor("sources", locale)} />,
    );
    const hrefs = new Set(
      [...container.querySelectorAll("a[href]")].map((link) => link.getAttribute("href")),
    );
    const latestSources = listParameters().flatMap((listing) =>
      listing.years.filter((year) => year.year === LATEST_SUPPORTED_YEAR).map((y) => y.source),
    );
    for (const source of [...latestSources, ...DATASETS.map((set) => set.source)]) {
      if (source.url !== undefined) expect(hrefs).toContain(source.url);
    }
    const checked = latestVerification();
    if (checked !== null) expect(container.textContent).toContain(dateText(checked, locale));
    expect(container.textContent).not.toMatch(/NaN|undefined|Infinity/);
  });

  it("mostra le addizionali comunali con la data in cui sono state scaricate", () => {
    const { container } = render(
      <SourcesPage locale={locale} messages={messagesFor("sources", locale)} />,
    );
    const links = [...container.querySelectorAll(`a[href="${COMUNI_SOURCE.url ?? ""}"]`)];
    const row = links.map((link) => link.closest("tr")).find((candidate) => candidate !== null);
    expect(row).toBeDefined();
    if (row && COMUNI_SOURCE.retrieved !== undefined) {
      expect(row.textContent).toContain(dateText(COMUNI_SOURCE.retrieved, locale));
    }
  });

  it("apre con un indice che porta a ogni gruppo di parametri", () => {
    const { container } = render(
      <SourcesPage locale={locale} messages={messagesFor("sources", locale)} />,
    );
    const contents = screen.getByRole("navigation", {
      name: locale === "it" ? "In questa pagina" : "On this page",
    });
    const targets = within(contents)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href")?.slice(1) ?? "");
    expect(targets).toContain("da-verificare");
    expect(targets).toContain("parametri-irpef");
    expect(targets).toContain("dati");
    for (const id of targets) expect(container.querySelector(`[id="${id}"]`)).not.toBeNull();
  });

  it("apre l’elenco dei valori da verificare senza script", () => {
    const { container } = render(
      <SourcesPage locale={locale} messages={messagesFor("sources", locale)} />,
    );
    const block = container.querySelector("#da-verificare");
    expect(block?.querySelector("details > summary")).not.toBeNull();
    expect(container.querySelectorAll("script")).toHaveLength(0);
  });
});

describe.each(LOCALES)("Come calcoliamo il netto in %s", (locale) => {
  const example = methodExample();
  const { breakdown } = example;
  const money = (amount: number) => formatMoney(amount, locale);

  it("mostra le cifre dell’esempio calcolate dal motore", () => {
    render(<MethodPage locale={locale} messages={messagesFor("method", locale)} />);
    const [inpsLedger, deductionLedger] = screen
      .getAllByRole("table")
      .filter((table) => table.classList.contains("qg-ledger"));
    if (!inpsLedger || !deductionLedger) throw new Error("Missing example ledgers");
    const inpsText = inpsLedger.textContent;
    expect(inpsText).toContain(money(breakdown.grossAnnual));
    expect(inpsText).toContain(`${MINUS_SIGN}${money(breakdown.inpsContribution)}`);
    expect(inpsText).toContain(money(breakdown.taxableIncome));
    const deductionText = deductionLedger.textContent;
    expect(deductionText).toContain(money(breakdown.irpefGross));
    expect(deductionText).toContain(`${MINUS_SIGN}${money(breakdown.irpefDeduction)}`);
    expect(deductionText).toContain(money(breakdown.irpefNet));
  });

  it("scrive la somma dal lordo al netto e torna al centesimo", () => {
    const { container } = render(
      <MethodPage locale={locale} messages={messagesFor("method", locale)} />,
    );
    const text = container.textContent;
    expect(text).toContain(`=\u00a0${money(breakdown.netAnnual)}`);
    expect(text).toContain(money(breakdown.regionalTax));
    expect(text).toContain(money(breakdown.municipalTax));
    for (const share of example.shares) expect(text).toContain(money(share.tax));
    expect(text).not.toMatch(/NaN|undefined|Infinity/);
  });

  it("porta ogni citazione alla sua voce nell’elenco delle fonti", () => {
    const { container } = render(
      <MethodPage locale={locale} messages={messagesFor("method", locale)} />,
    );
    const anchors = [...container.querySelectorAll('a[href^="#fonte-"]')];
    expect(anchors.length).toBeGreaterThan(0);
    for (const anchor of anchors) {
      const target = anchor.getAttribute("href")?.slice(1) ?? "";
      expect(container.querySelector(`li#${target}`)).not.toBeNull();
    }
  });

  it("mostra le aliquote IRPEF di ogni anno nella tabella", () => {
    render(<MethodPage locale={locale} messages={messagesFor("method", locale)} />);
    const table = screen
      .getAllByRole("table")
      .find((candidate) => candidate.classList.contains("qg-table"));
    if (!table) throw new Error("Missing bracket table");
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(param("irpef.brackets", yearStart(LATEST_SUPPORTED_YEAR)).length + 1);
  });
});

describe.each(LOCALES)("Glossario e Informazioni in %s", (locale) => {
  it("riempie ogni definizione con i valori del registro", () => {
    const { container } = render(
      <GlossaryPage locale={locale} messages={messagesFor("glossary", locale)} />,
    );
    expect(container.textContent).not.toMatch(/NaN|undefined|Infinity|\{/);
    const firstBand = param("inps.firstBand", yearStart(LATEST_SUPPORTED_YEAR));
    expect(container.textContent).toContain(formatMoney(firstBand, locale, { integer: true }));
  });

  it("apre con un indice che porta a ogni sezione, anche alle voci della busta paga", () => {
    const { container } = render(
      <GlossaryPage locale={locale} messages={messagesFor("glossary", locale)} />,
    );
    const contents = screen.getByRole("navigation", {
      name: locale === "it" ? "In questa pagina" : "On this page",
    });
    const targets = within(contents)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href")?.slice(1) ?? "");
    expect(targets).toContain("busta-paga");
    for (const id of targets) expect(container.querySelector(`h2[id="${id}"]`)).not.toBeNull();
    const ids = [...container.querySelectorAll("[id]")].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("spiega fringe benefit, buoni pasto e premio di risultato con i valori del registro", () => {
    const { container } = render(
      <GlossaryPage locale={locale} messages={messagesFor("glossary", locale)} />,
    );
    const date = yearStart(LATEST_SUPPORTED_YEAR);
    const money = (amount: number) => formatMoney(amount, locale, { integer: true });
    const definition = (id: string) =>
      container.querySelector(`#busta-paga + dl #${id} .qg-terms__definition`)?.textContent ?? "";
    const welfare = param("fringe.welfare", date);
    expect(definition("fringe")).toContain(money(welfare.welfareThresholdGeneral));
    expect(definition("fringe")).toContain(money(welfare.welfareThresholdWithChildren));
    expect(definition("buoni")).toContain(money(param("fringe.mealVouchers.electronic", date)));
    expect(definition("buoni")).toContain(money(param("fringe.mealVouchers.paper", date)));
    const pdr = param("pdr", date);
    expect(definition("premio")).toContain(money(pdr.maxAmount));
    expect(definition("premio")).toContain(percentText(pdr.rate, locale));
  });

  it("rimanda al codice sorgente pubblico", () => {
    const { container } = render(
      <AboutPage locale={locale} messages={messagesFor("about", locale)} />,
    );
    expect(container.querySelector(`a[href="${SOURCE_REPOSITORY_URL ?? ""}"]`)).not.toBeNull();
    expect(container.querySelector("#codice")).not.toBeNull();
    expect(container.querySelector('a[href="#codice"]')).not.toBeNull();
  });

  it("mostra i conteggi dei parametri nelle informazioni", () => {
    const { container } = render(
      <AboutPage locale={locale} messages={messagesFor("about", locale)} />,
    );
    expect(container.textContent).toContain(String(listParameters().length));
    expect(container.textContent).not.toMatch(/NaN|undefined|\{/);
  });
});

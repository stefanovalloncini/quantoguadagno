import { describe, expect, it } from "vitest";
import {
  compactReference,
  dateText,
  deductionText,
  percentPhrase,
  percentRangeText,
  percentText,
  shortReference,
  wholeMoneyRangeText,
  wholeMoneyText,
  yearSpanText,
  yearsInProse,
} from "./phrases.ts";

describe("percentuali", () => {
  it("mostrano i decimali solo quando servono", () => {
    expect(percentText(0.23, "it")).toBe("23%");
    expect(percentText(0.0919, "it")).toBe("9,19%");
    expect(percentText(0.008, "it")).toBe("0,80%");
    expect(percentText(0.0919, "en")).toBe("9.19%");
  });

  it("scrivono gli intervalli con un solo simbolo", () => {
    expect(percentRangeText(0.0123, 0.0173, "it")).toBe("1,23\u20131,73%");
    expect(percentRangeText(0.25, 0.6, "it")).toBe("25\u201360%");
    expect(percentRangeText(0.1, 0.1, "it")).toBe("10%");
  });

  it("scelgono l'articolo italiano dal suono del numero", () => {
    expect(percentPhrase(0.0919, "it")).toBe("il 9,19%");
    expect(percentPhrase(0.08, "it")).toBe("l’8%");
    expect(percentPhrase(0.0123, "it", "dal")).toBe("dall’1,23%");
    expect(percentPhrase(0.11, "it", "al")).toBe("all’11%");
    expect(percentPhrase(0.86, "it", "al")).toBe("all’86%");
    expect(percentPhrase(0.008, "it")).toBe("lo 0,80%");
    expect(percentPhrase(0.33, "it", "del")).toBe("del 33%");
    expect(percentPhrase(0.0919, "en")).toBe("9.19%");
  });
});

describe("importi", () => {
  it("usano gli euro interi nel testo quando la cifra è tonda", () => {
    expect(wholeMoneyText(28_000, "it")).toBe("28.000\u00a0€");
    expect(wholeMoneyText(2840.51, "it")).toBe("2.840,51\u00a0€");
    expect(wholeMoneyText(28_000, "en")).toBe("€28,000");
  });

  it("scrivono le trattenute con il segno meno tipografico", () => {
    expect(deductionText(3216.5, "it")).toBe("\u22123.216,50\u00a0€");
    expect(deductionText(-3216.5, "en")).toBe("\u2212€3,216.50");
  });

  it("scrivono gli intervalli di euro con un solo simbolo", () => {
    expect(wholeMoneyRangeText(120_000, 240_000, "it")).toBe("120.000\u2013240.000\u00a0€");
    expect(wholeMoneyRangeText(120_000, 240_000, "en")).toBe("€120,000\u2013€240,000");
  });
});

describe("date e anni", () => {
  it("scrive le date per esteso", () => {
    expect(dateText("2026-09-28", "it")).toBe("28 settembre 2026");
    expect(dateText("2026-09-28", "en")).toBe("28 September 2026");
  });

  it("riassume gli anni", () => {
    expect(yearSpanText([2024, 2025, 2026])).toBe("2024\u20132026");
    expect(yearSpanText([2026])).toBe("2026");
    expect(yearsInProse([2024, 2025, 2026], "it")).toBe("il 2024, il 2025 e il 2026");
    expect(yearsInProse([2024, 2025, 2026], "en")).toBe("2024, 2025 and 2026");
  });
});

describe("riferimenti", () => {
  it("accorciano nelle tabelle i riferimenti con un elenco per regione", () => {
    expect(
      compactReference(
        "Dipartimento delle Finanze, addizionale regionale all'IRPEF: Lombardia 2026",
      ),
    ).toBe("Dipartimento delle Finanze, Lombardia 2026");
    expect(compactReference("Circ. INPS 6/2026")).toBe("Circ. INPS 6/2026");
  });

  it("tolgono il nome esteso tra parentesi", () => {
    expect(shortReference("L. 199/2025 (Legge di Bilancio 2026), art. 1 c. 2")).toBe(
      "L. 199/2025, art. 1 c. 2",
    );
    expect(shortReference("Circ. INPS 6/2026")).toBe("Circ. INPS 6/2026");
    expect(shortReference("Art. 13 TUIR, come modificato dall'art. 1 c. 2 L. 213/2023")).toBe(
      "Art. 13 TUIR",
    );
    expect(shortReference("Art. 1 D.L. 3/2020, conv. L. 21/2020; art. 1 c. 3 L. 234/2021")).toBe(
      "Art. 1 D.L. 3/2020",
    );
    expect(
      shortReference("Dipartimento delle Finanze, addizionale regionale all'IRPEF: Lombardia 2026"),
    ).toBe("Dipartimento delle Finanze");
    expect(
      shortReference(
        "Dipartimento delle Finanze - Addizionale comunale all'IRPEF, elenchi generali",
      ),
    ).toBe("Dipartimento delle Finanze");
  });
});

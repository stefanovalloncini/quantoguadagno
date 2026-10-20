import { describe, expect, it } from "vitest";
import { CAPOLUOGHI, LATEST_SUPPORTED_YEAR, REGION_CODES } from "@/data/index.ts";
import { calculateSalaryBreakdown } from "@/domain/index.ts";
import { COMMON_AMOUNTS, NET_TABLE_AMOUNTS } from "./amounts.ts";
import {
  amountPage,
  monthlyOf,
  netRow,
  netRows,
  REFERENCE_REGION,
  scenarioInput,
  type AmountPage,
} from "./model.ts";
import { loadResidences, referenceResidence } from "./residences.ts";

const YEAR = LATEST_SUPPORTED_YEAR;
const residences = await loadResidences(YEAR);
const milano = referenceResidence(YEAR);
const pages = new Map<number, AmountPage>(
  NET_TABLE_AMOUNTS.map((gross) => [gross, amountPage(gross, YEAR, residences)]),
);

function pageOf(gross: number): AmountPage {
  const page = pages.get(gross);
  if (page === undefined) throw new Error(`no page for ${String(gross)}`);
  return page;
}

function cents(amount: number): number {
  return Math.round(amount * 100);
}

describe("reference scenario", () => {
  it("lives in the capoluogo of the reference region, with its rule for the year", () => {
    expect(milano.region).toBe(REFERENCE_REGION);
    expect(milano.comuneId).toBe(CAPOLUOGHI[REFERENCE_REGION].id);
    expect(milano.ruleYear).toBeLessThanOrEqual(YEAR);
    expect(residences[REFERENCE_REGION]).toEqual(milano);
  });

  it("loads the capoluogo of every region", () => {
    for (const region of REGION_CODES) {
      expect(residences[region].comuneId).toBe(CAPOLUOGHI[region].id);
    }
  });

  // Worked by hand from the 2026 rules: INPS 9,19% of 30.000 = 2.757,00; imponibile
  // 27.243,00; IRPEF 23% = 6.265,89; detrazione per lavoro dipendente
  // 1.910 + 1.190 × 757 / 13.000 + 65 = 2.044,29; detrazione aggiuntiva 1.000,00;
  // Lombardia 1,23% of 15.000 + 1,58% of 12.243 = 377,94; Milano 0,8% of 27.243 = 217,94.
  it("leaves 23.425,52 € of 30.000 € in Milano in 2026", () => {
    const page = pageOf(30_000);
    expect(YEAR).toBe(2026);
    const b = page.breakdown;
    expect(b.inpsContribution).toBe(2_757);
    expect(b.taxableIncome).toBe(27_243);
    expect(b.irpefGross).toBe(6_265.89);
    expect(b.irpefDeduction).toBe(2_044.29);
    expect(b.detrazioneAggiuntiva).toBe(1_000);
    expect(b.regionalTax).toBe(377.94);
    expect(b.municipalTax).toBe(217.94);
    expect(page.row.netAnnual).toBe(23_425.52);
    expect(monthlyOf(page.row, 12)).toBe(1_952.13);
    expect(monthlyOf(page.row, 13)).toBe(1_801.96);
    expect(monthlyOf(page.row, 14)).toBe(1_673.25);
    expect(b.netMonthly).toBe(1_801.96);
  });

  it("feeds the engine a plain employee: 13 payslips, no dependants, expenses or benefits", () => {
    const input = scenarioInput(30_000, YEAR, milano);
    expect(input).toMatchObject({
      contractType: "indeterminato",
      paymentFrequency: 13,
      companySize: "small",
      isPublicEmployee: false,
      dependents: null,
      expenseDeductions: null,
      fringeBenefits: null,
      specialConditions: null,
      premioRisultato: null,
    });
    expect(input.municipalTaxRate).toBe(milano.rule);
  });
});

describe.each(NET_TABLE_AMOUNTS)("page for %i € lordi", (gross) => {
  const page = pageOf(gross);
  const { ledger } = page;

  it("adds the ledger rows up to the net, every year and every month", () => {
    const moving = ledger.lines.filter((line) => line.kind !== "subtotal");
    expect(moving.reduce((sum, line) => sum + cents(line.annual), 0)).toBe(
      cents(ledger.net.annual),
    );
    expect(moving.reduce((sum, line) => sum + cents(line.monthly), 0)).toBe(
      cents(ledger.net.monthly),
    );
    expect(ledger.net.annual).toBe(page.row.netAnnual);
  });

  it("leaves out the rows worth nothing", () => {
    for (const line of ledger.lines) expect(cents(line.annual)).not.toBe(0);
  });

  it("puts the taxable income right after the contributions", () => {
    const ids = ledger.lines.map((line) => line.id);
    expect(ids.slice(0, 3)).toEqual(["gross", "inps", "taxable"]);
    const [grossLine, inps, taxable] = ledger.lines;
    expect(cents(taxable?.annual ?? 0)).toBe(
      cents(grossLine?.annual ?? 0) + cents(inps?.annual ?? 0),
    );
  });

  it("lists every capoluogo once, with the reference one marked", () => {
    expect(page.cities.map((city) => city.residence.region)).toEqual(REGION_CODES);
    const references = page.cities.filter((city) => city.reference);
    expect(references).toHaveLength(1);
    expect(references[0]?.netAnnual).toBe(page.row.netAnnual);
  });

  it("names the lowest and the highest net, ties included", () => {
    const nets = page.cities.map((city) => cents(city.netAnnual));
    const low = Math.min(...nets);
    const high = Math.max(...nets);
    expect(page.lowest.length).toBeGreaterThan(0);
    expect(page.highest.length).toBeGreaterThan(0);
    for (const city of page.lowest) expect(cents(city.netAnnual)).toBe(low);
    for (const city of page.highest) expect(cents(city.netAnnual)).toBe(high);
    expect(page.lowest).toHaveLength(nets.filter((net) => net === low).length);
    expect(page.highest).toHaveLength(nets.filter((net) => net === high).length);
  });

  it("measures a raise of 1.000 € on the same scenario", () => {
    const raised = calculateSalaryBreakdown(scenarioInput(gross + 1_000, YEAR, milano));
    const gain = raised.netAnnual - page.row.netAnnual;
    expect(page.raise.increment).toBe(1_000);
    expect(page.raise.netGainAnnual).toBeCloseTo(gain, 2);
    expect(page.raise.netGainMonthly).toBeCloseTo(gain / 13, 2);
    expect(page.raise.keptShare).toBeCloseTo(gain / 1_000, 6);
  });

  it("costs the employer the gross plus contributions, TFR and other charges", () => {
    const b = page.breakdown;
    expect(cents(page.employerCost)).toBe(
      cents(b.grossAnnual) +
        cents(b.employerInps) +
        cents(b.tfrAnnual) +
        cents(b.totalOtherEmployerCosts),
    );
  });
});

describe("ledger details", () => {
  it("explains a missing municipal surcharge with the Milano exemption", () => {
    const exempt = NET_TABLE_AMOUNTS.filter((gross) =>
      pageOf(gross).ledger.notes.some((note) => note.kind === "municipalExempt"),
    );
    expect(exempt).toEqual(NET_TABLE_AMOUNTS.filter((gross) => gross <= 25_000));
    expect(pageOf(25_000).ledger.notes).toEqual([
      { kind: "municipalExempt", threshold: milano.rule.exemption },
    ]);
    expect(pageOf(25_000).ledger.lines.map((line) => line.id)).not.toContain("municipal");
    expect(pageOf(26_000).ledger.notes).toEqual([]);
  });

  it("adds the credits only where they are due", () => {
    const ids = (gross: number) => pageOf(gross).ledger.lines.map((line) => line.id);
    expect(ids(12_000)).toContain("somma");
    expect(ids(12_000)).toContain("trattamento");
    expect(ids(30_000)).not.toContain("somma");
    expect(ids(30_000)).not.toContain("trattamento");
  });
});

describe("hub and home rows", () => {
  it("give the net for every amount, growing with the gross", () => {
    const rows = netRows(NET_TABLE_AMOUNTS, YEAR, milano);
    expect(rows.map((row) => row.gross)).toEqual(NET_TABLE_AMOUNTS);
    for (let index = 1; index < rows.length; index++) {
      expect(rows[index]?.netAnnual).toBeGreaterThan(rows[index - 1]?.netAnnual ?? 0);
    }
  });

  it("match the amount pages", () => {
    for (const gross of COMMON_AMOUNTS) {
      expect(netRow(gross, YEAR, milano)).toEqual(pageOf(gross).row);
    }
  });

  it("count as withheld the part of the gross that does not reach the net", () => {
    for (const gross of [12_000, 30_000, 150_000]) {
      const row = netRow(gross, YEAR, milano);
      expect(cents(row.withheld)).toBe(cents(gross) - cents(row.netAnnual));
      expect(row.withheldShare).toBeCloseTo(row.withheld / gross, 10);
    }
  });

  it("withhold a larger share as the gross grows, credits included", () => {
    const rows = netRows(NET_TABLE_AMOUNTS, YEAR, milano);
    for (let index = 1; index < rows.length; index++) {
      expect(rows[index]?.withheldShare).toBeGreaterThan(rows[index - 1]?.withheldShare ?? 1);
    }
  });
});

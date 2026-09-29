import { describe, expect, it } from "vitest";
import index from "./comuni/index.json";
import {
  COMUNI_SOURCE,
  COMUNI_YEARS,
  comunaleRuleFor,
  comuniCount,
  findComune,
  loadRegionComuni,
  type Comune,
  type ComunaleRule,
} from "./comuni.ts";
import { REGION_CODES } from "./regions.ts";

const files = await Promise.all(REGION_CODES.map((code) => loadRegionComuni(code)));
const comuni = files.flatMap((file) => file.comuni);
const rules = comuni.flatMap((comune) =>
  Object.entries(comune.years).map(([year, rule]) => ({ comune, year, rule })),
);

function ratesOf(rule: ComunaleRule): readonly number[] {
  return rule.brackets === undefined ? [rule.rate] : rule.brackets.map((bracket) => bracket.rate);
}

describe("comuni: i file generati dai dati MEF", () => {
  it("ogni regione ha il suo file, e si carica", () => {
    expect(Object.keys(index.regions).sort()).toEqual([...REGION_CODES].sort());
    files.forEach((file, i) => {
      const code = REGION_CODES[i];
      if (code === undefined) throw new Error("missing region code");
      expect(file.region).toBe(code);
      expect(file.comuni.length).toBe(comuniCount(code));
      expect(file.comuni.length).toBeGreaterThan(0);
    });
  });

  it("i codici catastali sono unici in tutta Italia", () => {
    const ids = comuni.map((comune) => comune.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ogni regola ha un'aliquota unica oppure degli scaglioni", () => {
    for (const { rule } of rules) {
      expect((rule.rate === undefined) !== (rule.brackets === undefined)).toBe(true);
    }
  });

  it("gli scaglioni salgono, e solo l'ultimo è senza limite", () => {
    for (const { rule } of rules) {
      if (rule.brackets === undefined) continue;
      const limits = rule.brackets.map((bracket) => bracket.upTo);
      expect(limits[limits.length - 1]).toBeNull();
      const finite = limits.slice(0, -1);
      for (const limit of finite) expect(limit).not.toBeNull();
      finite.slice(1).forEach((limit, i) => {
        expect(limit ?? 0).toBeGreaterThan(finite[i] ?? 0);
      });
    }
  });

  it("le aliquote sono tra 0 e 1,5%", () => {
    for (const { rule } of rules) {
      for (const rate of ratesOf(rule)) {
        expect(rate).toBeGreaterThanOrEqual(0);
        expect(rate).toBeLessThanOrEqual(1.5);
      }
    }
  });

  it("le soglie di esenzione sono importi positivi", () => {
    for (const { rule } of rules) {
      if (rule.exemption !== undefined) expect(rule.exemption).toBeGreaterThan(0);
    }
  });

  it("gli anni delle regole sono quelli importati", () => {
    for (const { year } of rules) expect(COMUNI_YEARS).toContain(Number(year));
  });

  it("la provenienza viene da index.json", () => {
    expect(COMUNI_SOURCE.ref).toBe(index.source.ref);
    expect(COMUNI_SOURCE.url).toBe(index.source.url);
    expect(COMUNI_SOURCE.retrieved).toBe(index.source.retrieved);
    expect(COMUNI_SOURCE.verified).toBeUndefined();
  });
});

describe("comunaleRuleFor: aliquote dell'anno o dell'ultima delibera", () => {
  const PROVA: Comune = {
    id: "X000",
    name: "Prova",
    province: "XX",
    years: { "2024": { rate: 0.5 }, "2025": { rate: 0.8, exemption: 10_000 } },
  };

  it("usa la regola dell'anno richiesto", () => {
    expect(comunaleRuleFor(PROVA, 2025)).toEqual({
      rule: { rate: 0.8, exemption: 10_000 },
      year: 2025,
    });
    expect(comunaleRuleFor(PROVA, 2024)).toEqual({ rule: { rate: 0.5 }, year: 2024 });
  });

  it("senza delibera per l'anno vale l'ultima precedente (art. 1 c. 169 L. 296/2006)", () => {
    expect(comunaleRuleFor(PROVA, 2026)).toEqual({
      rule: { rate: 0.8, exemption: 10_000 },
      year: 2025,
    });
  });

  it("non usa mai una delibera di un anno successivo", () => {
    const gap: Comune = { ...PROVA, years: { "2024": { rate: 0.4 }, "2026": { rate: 0.9 } } };
    expect(comunaleRuleFor(gap, 2025)).toEqual({ rule: { rate: 0.4 }, year: 2024 });
    expect(comunaleRuleFor(PROVA, 2023)).toBeNull();
  });

  it("un comune senza delibere non ha regola", () => {
    expect(comunaleRuleFor({ ...PROVA, years: {} }, 2026)).toBeNull();
  });

  it("nel 2026 molti comuni non hanno ancora una delibera: si ricade sul 2025", () => {
    const with2026 = comuni.filter((comune) => comune.years["2026"] !== undefined).length;
    expect(with2026).toBeGreaterThan(0);
    expect(with2026).toBeLessThan(comuni.length / 2);
    const lazio = files[REGION_CODES.indexOf("lazio")];
    const accumoli = lazio === undefined ? undefined : findComune(lazio, "A019");
    expect(accumoli?.name).toBe("Accumoli");
    if (accumoli === undefined) return;
    expect(accumoli.years["2026"]).toBeUndefined();
    expect(comunaleRuleFor(accumoli, 2026)).toEqual({ rule: accumoli.years["2025"], year: 2025 });
  });

  it("un comune che non applica l'addizionale ha aliquota 0, non l'assenza di regola", () => {
    const molise = files[REGION_CODES.indexOf("molise")];
    const acquaviva = molise === undefined ? undefined : findComune(molise, "A051");
    expect(acquaviva?.name).toBe("Acquaviva d'Isernia");
    if (acquaviva === undefined) return;
    expect(acquaviva.years["2024"]).toEqual({ rate: 0 });
    expect(acquaviva.years["2025"]).toEqual({ rate: 0 });
    expect(comunaleRuleFor(acquaviva, 2024)).toEqual({ rule: { rate: 0 }, year: 2024 });
    expect(comunaleRuleFor(acquaviva, 2026)).toEqual({ rule: { rate: 0 }, year: 2025 });
  });

  it("le soglie di esenzione mantengono i centesimi", () => {
    const sicilia = files[REGION_CODES.indexOf("sicilia")];
    const agrigento = sicilia === undefined ? undefined : findComune(sicilia, "A089");
    expect(agrigento?.name).toBe("Agrigento");
    if (agrigento === undefined) return;
    expect(agrigento.years["2024"]).toEqual({ rate: 0.8, exemption: 7499.99 });
    expect(comunaleRuleFor(agrigento, 2025)).toEqual({
      rule: { rate: 0.8, exemption: 7499.99 },
      year: 2025,
    });
  });
});

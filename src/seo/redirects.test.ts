import { describe, expect, it } from "vitest";
import { ROUTES } from "@/routes.ts";
import { buildRedirects, isDynamicRule, redirectRules } from "@/seo/redirects.ts";

describe("_redirects", () => {
  it("renders the legacy table in the Cloudflare format", () => {
    expect(buildRedirects(ROUTES)).toBe(
      [
        "/calcola-stipendio / 301",
        "/calcola-stipendio/ / 301",
        "/calcolo-stipendio-netto / 301",
        "/calcolo-stipendio-netto/ / 301",
        "/strumenti-stipendio / 301",
        "/strumenti-stipendio/ / 301",
        "/simulatore-pensione / 301",
        "/simulatore-pensione/ / 301",
        "/statistics / 302",
        "/statistics/ / 302",
        "/statistiche / 302",
        "/statistiche/ / 302",
        "/confronto-tasse-europa / 302",
        "/confronto-tasse-europa/ / 302",
        "/confronto-scenari /confronto-stipendi 301",
        "/confronto-scenari/ /confronto-stipendi 301",
        "/calcolo-partita-iva /partita-iva-forfettario 301",
        "/calcolo-partita-iva/ /partita-iva-forfettario 301",
        "/simulatore-tfr /tfr 301",
        "/simulatore-tfr/ /tfr 301",
        "/analisi-inflazione /inflazione 301",
        "/analisi-inflazione/ /inflazione 301",
        "/fonti-dati /fonti 301",
        "/fonti-dati/ /fonti 301",
        "/simulatore-busta-paga /stampa-busta-paga 302",
        "/simulatore-busta-paga/ /stampa-busta-paga 302",
        "/sistema-fiscale/* / 302",
        "/fonti-dati/* /fonti 301",
        "",
      ].join("\n"),
    );
  });

  it("lists static rules before dynamic ones, as Cloudflare counts every rule after the first splat as dynamic", () => {
    const rules = redirectRules(ROUTES);
    const firstDynamic = rules.findIndex((rule) => isDynamicRule(rule.from));
    expect(firstDynamic).toBeGreaterThan(0);
    expect(rules.slice(firstDynamic).every((rule) => isDynamicRule(rule.from))).toBe(true);
  });

  it("stays within the Cloudflare limits and formats", () => {
    const rules = redirectRules(ROUTES);
    expect(rules.filter((rule) => !isDynamicRule(rule.from)).length).toBeLessThanOrEqual(2000);
    expect(rules.filter((rule) => isDynamicRule(rule.from)).length).toBeLessThanOrEqual(100);
    expect(new Set(rules.map((rule) => rule.from)).size).toBe(rules.length);
    for (const rule of rules) {
      expect([301, 302]).toContain(rule.status);
      expect(rule.to).not.toContain("?");
      expect(rule.from).not.toBe(rule.to);
    }
  });

  it("only points at real Italian pages", () => {
    const italianPaths = new Set(ROUTES.map((route) => route.path.it));
    for (const rule of redirectRules(ROUTES)) expect(italianPaths.has(rule.to)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR, SUPPORTED_YEARS } from "@/data/index.ts";
import { DATASETS, daVerificare, listParameters } from "@/data/fonti.ts";
import { getMessages } from "@/i18n/messages/index.ts";
import { formatMessage } from "@/i18n/format.ts";
import { LOCALES, type Locale } from "@/i18n/locales.ts";
import type { Formatting } from "./describe.ts";
import {
  changedParameterTable,
  datasetTable,
  keysThatDiffer,
  PARAMETER_GROUPS,
  parameterCounts,
  parameterTable,
  todoItems,
} from "./model.ts";
import { todoOverview } from "./questions.ts";

function formatting(locale: Locale): Formatting {
  const messages = getMessages(locale, ["sources"]);
  return {
    locale,
    t: (key, values) => {
      const source = messages[key];
      if (source === undefined) throw new Error(`Missing message ${key}`);
      return formatMessage(source, locale, values);
    },
  };
}

describe("gruppi della tabella dei parametri", () => {
  it("contengono ogni parametro del registro una volta sola", () => {
    const grouped = PARAMETER_GROUPS.flatMap((group) => group.keys);
    const registry = listParameters().map((listing) => listing.key);
    expect([...grouped].sort()).toEqual([...registry].sort());
    expect(new Set(grouped).size).toBe(grouped.length);
  });
});

describe.each(LOCALES)("tabelle di Fonti e dati in %s", (locale) => {
  const f = formatting(locale);

  it.each(SUPPORTED_YEARS)("descrivono ogni parametro del %s con valore e fonte", (year) => {
    const rows = parameterTable(year, f).flatMap((group) => group.rows);
    expect(rows.length).toBeGreaterThanOrEqual(PARAMETER_GROUPS.flatMap((g) => g.keys).length);
    for (const row of rows) {
      expect(row.label).not.toBe("");
      expect(row.value).not.toBe("");
      expect(row.value).not.toMatch(/NaN|undefined|Infinity/);
      expect(row.years).toMatch(/^\d{4}(–\d{4})?$/);
      expect(row.source.ref).not.toBe("");
    }
  });

  it("segna da verificare solo i valori senza data di controllo", () => {
    const rows = parameterTable(LATEST_SUPPORTED_YEAR, f).flatMap((group) => group.rows);
    for (const row of rows) {
      expect(row.status === "todo").toBe(row.source.verified === undefined);
      expect(row.check.kind === "verified").toBe(row.source.verified !== undefined);
    }
  });

  it("elenca i dati, con le addizionali comunali scaricate dal Dipartimento delle Finanze", () => {
    const rows = datasetTable(f).flatMap((group) => group.rows);
    expect(rows.map((row) => row.id).sort()).toEqual(DATASETS.map((set) => set.key).sort());
    const comuni = rows.find((row) => row.id === "comuni.addizionaleComunale");
    expect(comuni?.check.kind).toBe("retrieved");
    expect(comuni?.source.url).toMatch(/^https:\/\/www1\.finanze\.gov\.it\//);
    expect(comuni?.value).toMatch(/\d/);
  });

  it("mostra negli anni precedenti solo i parametri cambiati", () => {
    for (const year of SUPPORTED_YEARS.filter((y) => y !== LATEST_SUPPORTED_YEAR)) {
      const changed = keysThatDiffer(year, LATEST_SUPPORTED_YEAR);
      const tableKeys = changedParameterTable(year, LATEST_SUPPORTED_YEAR, f).flatMap((group) =>
        group.rows.map((row) => row.id),
      );
      for (const key of changed) {
        expect(tableKeys.some((id) => id.startsWith(`${key}-`))).toBe(true);
      }
    }
  });

  it("mette ogni voce da verificare o tra le domande aperte o nell’elenco degli altri", () => {
    const items = todoItems(f);
    const overview = todoOverview(items, LATEST_SUPPORTED_YEAR, f);
    const keys = new Set(daVerificare().map((item) => item.key));
    expect(items.map((item) => item.key).sort()).toEqual([...keys].sort());
    expect(overview.questions.length + overview.others.length).toBe(items.length);
    for (const question of overview.questions) {
      expect(question.title).not.toBe("");
      expect(question.body).not.toMatch(/NaN|undefined/);
    }
  });
});

describe("conteggi", () => {
  it("tornano con il numero di parametri", () => {
    const counts = parameterCounts(LATEST_SUPPORTED_YEAR);
    expect(counts.verified + counts.toVerify).toBe(counts.total);
    expect(counts.total).toBe(listParameters().length);
  });
});

import { describe, expect, it } from "vitest";
import { FOI_LATEST_YEAR } from "@/data/index.ts";
import { defaultGrowthRate } from "./derive.ts";
import {
  adoptField,
  DEFAULT_STATE,
  patchDependents,
  patchDraft,
  patchSettings,
  resetDraftAfterSubmit,
  updateGrowthPct,
  updateHorizon,
  validate,
  validateDraft,
  validateProjection,
  type SalaryHistoryState,
} from "./state.ts";
import { DEFAULT_ENTRY_SETTINGS } from "./storage.ts";

describe("DEFAULT_STATE", () => {
  it("matches the old tool's defaults", () => {
    expect(DEFAULT_STATE.draft.year).toBe(FOI_LATEST_YEAR);
    expect(DEFAULT_STATE.draft.grossAnnual).toBe(30_000);
    expect(DEFAULT_STATE.draft.settings).toEqual(DEFAULT_ENTRY_SETTINGS);
    expect(DEFAULT_STATE.draft.note).toBe("");
    expect(DEFAULT_STATE.horizon).toBe(5);
    expect(DEFAULT_STATE.growthPct).toBeCloseTo(Number((defaultGrowthRate() * 100).toFixed(2)));
  });
});

describe("patchDraft", () => {
  it("only changes the targeted top-level draft fields", () => {
    const next = patchDraft(DEFAULT_STATE, { year: 2020, note: "raise" });
    expect(next.draft.year).toBe(2020);
    expect(next.draft.note).toBe("raise");
    expect(next.draft.grossAnnual).toBe(DEFAULT_STATE.draft.grossAnnual);
    expect(next.draft.settings).toEqual(DEFAULT_STATE.draft.settings);
  });
});

describe("patchSettings", () => {
  it("merges into the draft's settings", () => {
    const next = patchSettings(DEFAULT_STATE, { regionCode: "toscana" });
    expect(next.draft.settings.regionCode).toBe("toscana");
    expect(next.draft.settings.contractType).toBe(DEFAULT_ENTRY_SETTINGS.contractType);
  });
});

describe("patchDependents", () => {
  it("initialises dependents from empty when none are set yet", () => {
    const next = patchDependents(DEFAULT_STATE, { hasSpouse: true });
    expect(next.draft.settings.dependents).toEqual({
      hasSpouse: true,
      childrenOver21: 0,
      otherDependents: 0,
    });
  });

  it("drops the dependents block once it goes back to all-empty", () => {
    const withSpouse = patchDependents(DEFAULT_STATE, { hasSpouse: true });
    const cleared = patchDependents(withSpouse, { hasSpouse: false });
    expect(cleared.draft.settings.dependents).toBeUndefined();
  });

  it("keeps companySize untouched while editing dependents", () => {
    const withCompanySize = patchSettings(DEFAULT_STATE, { companySize: "large" });
    const next = patchDependents(withCompanySize, { childrenOver21: 2 });
    expect(next.draft.settings.companySize).toBe("large");
    expect(next.draft.settings.dependents?.childrenOver21).toBe(2);
  });
});

describe("updateHorizon / updateGrowthPct", () => {
  it("only change their own field", () => {
    expect(updateHorizon(DEFAULT_STATE, 10).horizon).toBe(10);
    expect(updateGrowthPct(DEFAULT_STATE, 3.5).growthPct).toBe(3.5);
  });
});

describe("resetDraftAfterSubmit", () => {
  it("keeps the year and settings but resets gross and note, like the old form", () => {
    const edited: SalaryHistoryState = patchDraft(
      patchSettings(DEFAULT_STATE, { regionCode: "toscana" }),
      { year: 2020, grossAnnual: 99_999, note: "hello" },
    );
    const next = resetDraftAfterSubmit(edited);
    expect(next.draft.year).toBe(2020);
    expect(next.draft.settings.regionCode).toBe("toscana");
    expect(next.draft.grossAnnual).toBe(30_000);
    expect(next.draft.note).toBe("");
  });
});

describe("validateDraft", () => {
  it("returns no errors for the defaults", () => {
    expect(validateDraft(DEFAULT_STATE.draft)).toEqual({});
  });

  it("flags a year outside 1900..2100", () => {
    expect(validateDraft({ ...DEFAULT_STATE.draft, year: 1899 })).toHaveProperty("year");
    expect(validateDraft({ ...DEFAULT_STATE.draft, year: 2101 })).toHaveProperty("year");
  });

  it("flags gross that is not strictly positive, or above 1,000,000", () => {
    expect(validateDraft({ ...DEFAULT_STATE.draft, grossAnnual: 0 })).toHaveProperty("grossAnnual");
    expect(validateDraft({ ...DEFAULT_STATE.draft, grossAnnual: -1 })).toHaveProperty(
      "grossAnnual",
    );
    expect(validateDraft({ ...DEFAULT_STATE.draft, grossAnnual: 1_000_001 })).toHaveProperty(
      "grossAnnual",
    );
  });

  it("flags a municipal rate outside 0%..2%", () => {
    const draft = {
      ...DEFAULT_STATE.draft,
      settings: { ...DEFAULT_ENTRY_SETTINGS, municipalTaxRate: 0.03 },
    };
    expect(validateDraft(draft)).toHaveProperty("municipalTaxRate");
  });

  it("only checks dependent fields when dependents are present", () => {
    expect(validateDraft(DEFAULT_STATE.draft)).not.toHaveProperty("childrenOver21");
    const draft = {
      ...DEFAULT_STATE.draft,
      settings: {
        ...DEFAULT_ENTRY_SETTINGS,
        dependents: { hasSpouse: false, childrenOver21: 21, otherDependents: 0 },
      },
    };
    expect(validateDraft(draft)).toHaveProperty("childrenOver21");
  });

  it("flags a spouse income outside 0..1,000,000", () => {
    const draft = {
      ...DEFAULT_STATE.draft,
      settings: {
        ...DEFAULT_ENTRY_SETTINGS,
        dependents: { hasSpouse: true, spouseIncome: -1, childrenOver21: 0, otherDependents: 0 },
      },
    };
    expect(validateDraft(draft)).toHaveProperty("spouseIncome");
  });
});

describe("validateProjection", () => {
  it("returns no errors for the defaults", () => {
    expect(validateProjection(DEFAULT_STATE)).toEqual({});
  });

  it("flags a horizon outside 1..10", () => {
    expect(validateProjection({ horizon: 0, growthPct: 0 })).toHaveProperty("horizon");
    expect(validateProjection({ horizon: 11, growthPct: 0 })).toHaveProperty("horizon");
  });

  it("flags a growth rate outside -50%..50%", () => {
    expect(validateProjection({ horizon: 5, growthPct: -51 })).toHaveProperty("growthPct");
    expect(validateProjection({ horizon: 5, growthPct: 51 })).toHaveProperty("growthPct");
  });
});

describe("validate", () => {
  it("merges draft and projection errors", () => {
    const state: SalaryHistoryState = {
      draft: { ...DEFAULT_STATE.draft, grossAnnual: 0 },
      horizon: 0,
      growthPct: 0,
    };
    const errors = validate(state);
    expect(errors).toHaveProperty("grossAnnual");
    expect(errors).toHaveProperty("horizon");
  });
});

describe("adoptField", () => {
  it("parses grossAnnual as a money field and year as a plain integer", () => {
    expect(adoptField(DEFAULT_STATE, "grossAnnual", "45k", "it").draft.grossAnnual).toBe(45_000);
    expect(adoptField(DEFAULT_STATE, "year", "2020", "it").draft.year).toBe(2020);
  });

  it("adopts the note verbatim", () => {
    expect(adoptField(DEFAULT_STATE, "note", "promotion", "it").draft.note).toBe("promotion");
  });

  it("parses the municipal rate as a percent written in the page's locale", () => {
    const rateOf = (raw: string, locale: "it" | "en") =>
      adoptField(DEFAULT_STATE, "municipalTaxRate", raw, locale).draft.settings.municipalTaxRate;
    expect(rateOf("0,8", "it")).toBeCloseTo(0.008);
    expect(rateOf("1,5 %", "it")).toBeCloseTo(0.015);
    expect(rateOf("0.8", "en")).toBeCloseTo(0.008);
    expect(adoptField(DEFAULT_STATE, "municipalTaxRate", "1.5", "it")).toEqual(DEFAULT_STATE);
  });

  it("parses the growth as a locale decimal and the counts as whole numbers", () => {
    expect(adoptField(DEFAULT_STATE, "growthPct", "2,5", "it").growthPct).toBe(2.5);
    expect(adoptField(DEFAULT_STATE, "growthPct", "2.5", "en").growthPct).toBe(2.5);
    expect(
      adoptField(DEFAULT_STATE, "childrenOver21", "2", "it").draft.settings.dependents
        ?.childrenOver21,
    ).toBe(2);
    expect(adoptField(DEFAULT_STATE, "childrenOver21", "1,5", "it")).toEqual(DEFAULT_STATE);
  });

  it("adopts a valid contract type, region and payment frequency", () => {
    expect(
      adoptField(DEFAULT_STATE, "contractType", "apprendistato", "it").draft.settings.contractType,
    ).toBe("apprendistato");
    expect(adoptField(DEFAULT_STATE, "regionCode", "toscana", "it").draft.settings.regionCode).toBe(
      "toscana",
    );
    expect(
      adoptField(DEFAULT_STATE, "paymentFrequency", "14", "it").draft.settings.paymentFrequency,
    ).toBe(14);
  });

  it("ignores invalid enum-like values", () => {
    expect(adoptField(DEFAULT_STATE, "contractType", "freelance", "it")).toEqual(DEFAULT_STATE);
    expect(adoptField(DEFAULT_STATE, "regionCode", "atlantis", "it")).toEqual(DEFAULT_STATE);
    expect(adoptField(DEFAULT_STATE, "paymentFrequency", "11", "it")).toEqual(DEFAULT_STATE);
  });

  it("adopts a company size, and clears it back to unspecified", () => {
    const withSize = adoptField(DEFAULT_STATE, "companySize", "large", "it");
    expect(withSize.draft.settings.companySize).toBe("large");
    const cleared = adoptField(withSize, "companySize", "", "it");
    expect(cleared.draft.settings.companySize).toBeUndefined();
  });

  it("adopts dependents fields", () => {
    expect(
      adoptField(DEFAULT_STATE, "hasSpouse", "true", "it").draft.settings.dependents?.hasSpouse,
    ).toBe(true);
    expect(
      adoptField(DEFAULT_STATE, "spouseIncome", "20k", "it").draft.settings.dependents
        ?.spouseIncome,
    ).toBe(20_000);
    expect(
      adoptField(DEFAULT_STATE, "childrenOver21", "2", "it").draft.settings.dependents
        ?.childrenOver21,
    ).toBe(2);
    expect(
      adoptField(DEFAULT_STATE, "otherDependents", "1", "it").draft.settings.dependents
        ?.otherDependents,
    ).toBe(1);
  });

  it("adopts horizon and growthPct", () => {
    expect(adoptField(DEFAULT_STATE, "horizon", "7", "it").horizon).toBe(7);
    expect(adoptField(DEFAULT_STATE, "growthPct", "2,5", "it").growthPct).toBe(2.5);
  });

  it("ignores an unknown field", () => {
    expect(adoptField(DEFAULT_STATE, "bogus", "1", "it")).toEqual(DEFAULT_STATE);
  });
});

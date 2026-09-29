import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import {
  FORFETTARIO_DEFAULTS,
  isActivityCategory,
  isGestion,
  MAX_REVENUE,
  MIN_REVENUE,
  parseRevenue,
  updateActivity,
  updateForfettarioDiscount35,
  updateGestion,
  updateNewRegistrantDiscount50,
  updateRevenue,
  validateForfettario,
} from "./state.ts";

describe("FORFETTARIO_DEFAULTS", () => {
  it("matches the OLD tool defaults", () => {
    expect(FORFETTARIO_DEFAULTS).toEqual({
      revenue: "30000",
      activity: "professionisti",
      year: LATEST_SUPPORTED_YEAR,
      yearsOfActivity: 1,
      hasOtherPension: false,
      employeeCosts: "0",
      gestion: "gestione-separata",
      mesiAttivita: 12,
      isConcurrentFullTimeEmployee: false,
      concurrentEmployeeRal: "0",
      forfettarioDiscount35: false,
      newRegistrantDiscount50: false,
      cassaManualAmount: "0",
      isAnte1996: false,
    });
  });
});

describe("isGestion / isActivityCategory", () => {
  it("recognise the known values and reject anything else", () => {
    expect(isGestion("artigiani")).toBe(true);
    expect(isGestion("nope")).toBe(false);
    expect(isActivityCategory("professionisti")).toBe(true);
    expect(isActivityCategory("nope")).toBe(false);
  });
});

describe("parseRevenue", () => {
  it("parses via the shared i18n money parser", () => {
    expect(parseRevenue(updateRevenue(FORFETTARIO_DEFAULTS, "45.000"), "it")).toBe(45_000);
    expect(parseRevenue(updateRevenue(FORFETTARIO_DEFAULTS, "45k"), "it")).toBe(45_000);
  });
});

describe("updateForfettarioDiscount35 / updateNewRegistrantDiscount50", () => {
  it("are mutually exclusive, like the OLD tool's update()", () => {
    const withBoth50First = updateForfettarioDiscount35(
      updateNewRegistrantDiscount50(FORFETTARIO_DEFAULTS, true),
      true,
    );
    expect(withBoth50First.forfettarioDiscount35).toBe(true);
    expect(withBoth50First.newRegistrantDiscount50).toBe(false);

    const withBoth35First = updateNewRegistrantDiscount50(
      updateForfettarioDiscount35(FORFETTARIO_DEFAULTS, true),
      true,
    );
    expect(withBoth35First.newRegistrantDiscount50).toBe(true);
    expect(withBoth35First.forfettarioDiscount35).toBe(false);
  });

  it("turning one off does not affect the other", () => {
    const state = updateForfettarioDiscount35(FORFETTARIO_DEFAULTS, false);
    expect(state.forfettarioDiscount35).toBe(false);
    expect(state.newRegistrantDiscount50).toBe(false);
  });
});

describe("validateForfettario", () => {
  it("has no errors for the defaults", () => {
    expect(validateForfettario(FORFETTARIO_DEFAULTS, "it")).toEqual({});
  });

  it("flags an unparseable or out-of-range revenue", () => {
    const revenueError = {
      key: "field.error.moneyRange",
      values: { min: MIN_REVENUE, max: MAX_REVENUE },
    };
    expect(validateForfettario(updateRevenue(FORFETTARIO_DEFAULTS, "abc"), "it").revenue).toEqual(
      revenueError,
    );
    expect(
      validateForfettario(updateRevenue(FORFETTARIO_DEFAULTS, String(MAX_REVENUE + 1)), "it")
        .revenue,
    ).toEqual(revenueError);
  });

  it("flags an unknown activity or gestion", () => {
    const state = updateActivity(
      FORFETTARIO_DEFAULTS,
      "nope" as (typeof FORFETTARIO_DEFAULTS)["activity"],
    );
    expect(validateForfettario(state, "it").activity).toBe("forfettario.form.activity.error");

    const gestionState = updateGestion(
      FORFETTARIO_DEFAULTS,
      "nope" as (typeof FORFETTARIO_DEFAULTS)["gestion"],
    );
    expect(validateForfettario(gestionState, "it").gestion).toBe("forfettario.form.gestion.error");
  });
});

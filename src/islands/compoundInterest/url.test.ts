import { describe, expect, it } from "vitest";
import { COMPOUND_INTEREST_PARAMS } from "@/queryParams.ts";
import { readQuery, writeQuery } from "@/islands/runtime/query.ts";
import { DEFAULT_STATE, type CompoundInterestState } from "./state.ts";
import { fromQuery, toQuery } from "./url.ts";

function searchToState(search: string): CompoundInterestState {
  return fromQuery(readQuery(search, COMPOUND_INTEREST_PARAMS), DEFAULT_STATE);
}

function stateToSearch(state: CompoundInterestState): string {
  return writeQuery(toQuery(state), COMPOUND_INTEREST_PARAMS);
}

describe("compound interest URL state", () => {
  it("returns defaults for an empty search string", () => {
    expect(searchToState("")).toEqual(DEFAULT_STATE);
  });

  it("round-trips a non-default state through short keys", () => {
    const state: CompoundInterestState = {
      principal: 50_000,
      annualRate: 0.08,
      years: 10,
      contribution: 500,
      contributionFrequency: "yearly",
      compoundingFrequency: "daily",
      inflationRate: 0.03,
    };
    const search = stateToSearch(state);
    expect(searchToState(search)).toEqual(state);
  });

  it("writes p r y c cf f i, matching the old tool's short param names", () => {
    const search = stateToSearch({
      principal: 50_000,
      annualRate: 0.08,
      years: 10,
      contribution: 500,
      contributionFrequency: "yearly",
      compoundingFrequency: "daily",
      inflationRate: 0.03,
    });
    const params = new URLSearchParams(search);
    expect(params.get("p")).toBe("50000");
    expect(params.get("r")).toBe("8");
    expect(params.get("y")).toBe("10");
    expect(params.get("c")).toBe("500");
    expect(params.get("cf")).toBe("yearly");
    expect(params.get("f")).toBe("daily");
    expect(params.get("i")).toBe("3");
  });

  it("emits an empty search when the state matches the defaults", () => {
    expect(stateToSearch(DEFAULT_STATE)).toBe("");
  });

  it("ignores unknown params and falls back to defaults for bad values", () => {
    const state = searchToState("?p=abc&r=notanumber&cf=invalid&extra=xyz");
    expect(state).toEqual(DEFAULT_STATE);
  });

  it("omits only the fields that match the defaults", () => {
    const search = stateToSearch({ ...DEFAULT_STATE, principal: 20_000 });
    expect(search).toBe("p=20000");
  });

  it("round-trips a rate and inflation rate with a fractional percent", () => {
    const state: CompoundInterestState = {
      ...DEFAULT_STATE,
      annualRate: 0.075,
      inflationRate: 0.025,
    };
    const search = stateToSearch(state);
    expect(searchToState(search)).toEqual(state);
  });
});

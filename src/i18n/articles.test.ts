import { describe, expect, it } from "vitest";
import { percentArticle } from "./articles.ts";

describe("percentArticle", () => {
  it("uses lo before zero: lo 0,80%", () => {
    expect(percentArticle(0.8)).toBe("lo");
  });

  it("elides before uno, undici and the numbers read with otto: l’1,23%, l’11%, l’8,80%", () => {
    expect(percentArticle(1.23)).toBe("l");
    expect(percentArticle(11)).toBe("l");
    expect(percentArticle(8.8)).toBe("l");
    expect(percentArticle(83)).toBe("l");
  });

  it("uses il everywhere else: il 9,19%, il 10,19%, il 23%", () => {
    expect(percentArticle(9.19)).toBe("il");
    expect(percentArticle(10.19)).toBe("il");
    expect(percentArticle(23)).toBe("il");
    expect(percentArticle(18)).toBe("il");
  });
});

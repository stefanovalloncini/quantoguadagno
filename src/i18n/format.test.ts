import { describe, it, expect } from "vitest";
import { formatMessage, extractPlaceholderNames, MessageSyntaxError } from "./format.ts";

describe("formatMessage placeholders", () => {
  it("substitutes a simple named placeholder", () => {
    expect(formatMessage("Hello {name}", "en", { name: "World" })).toBe("Hello World");
  });

  it("substitutes multiple placeholders in order", () => {
    expect(formatMessage("{a}-{b}-{a}", "en", { a: "x", b: "y" })).toBe("x-y-x");
  });

  it("keeps literal text outside placeholders untouched", () => {
    expect(formatMessage("no placeholders here", "en")).toBe("no placeholders here");
  });

  it("throws when a placeholder value is missing", () => {
    expect(() => formatMessage("Hello {name}", "en", {})).toThrow(/Missing value/);
  });

  it("throws when a placeholder value is explicitly undefined", () => {
    expect(() => formatMessage("Hello {name}", "en", { name: undefined as never })).toThrow(
      /Missing value/,
    );
  });

  it("does not throw for a falsy but present value", () => {
    expect(formatMessage("Count: {n}", "en", { n: 0 })).toBe("Count: 0");
    expect(formatMessage("Text: {s}", "en", { s: "" })).toBe("Text: ");
  });
});

describe("formatMessage plural", () => {
  const template = "{n, plural, =0 {no items} =1 {one item} other {# items}}";

  it("matches an exact =0 branch", () => {
    expect(formatMessage(template, "en", { n: 0 })).toBe("no items");
  });

  it("matches an exact =1 branch before the categorical one", () => {
    expect(formatMessage(template, "en", { n: 1 })).toBe("one item");
  });

  it("falls back to the plural category and expands # to the locale-formatted count", () => {
    expect(formatMessage(template, "en", { n: 2 })).toBe("2 items");
    expect(formatMessage(template, "en", { n: 1500 })).toBe("1,500 items");
  });

  it("selects the Italian plural category and formats # with Italian grouping", () => {
    const it_ = "{n, plural, one {# articolo} other {# articoli}}";
    expect(formatMessage(it_, "it", { n: 1 })).toBe("1 articolo");
    expect(formatMessage(it_, "it", { n: 1500 })).toBe("1.500 articoli");
  });

  it("throws when the plural value is missing", () => {
    expect(() => formatMessage(template, "en", {})).toThrow(/Missing value/);
  });

  it("throws when the plural value is not a number", () => {
    expect(() => formatMessage(template, "en", { n: "two" })).toThrow(/must be a number/);
  });
});

describe("formatMessage select", () => {
  const template = "{x, select, a {Alpha} b {Beta} other {Unknown}}";

  it("matches a named branch", () => {
    expect(formatMessage(template, "en", { x: "a" })).toBe("Alpha");
    expect(formatMessage(template, "en", { x: "b" })).toBe("Beta");
  });

  it("falls back to other for an unmatched value", () => {
    expect(formatMessage(template, "en", { x: "c" })).toBe("Unknown");
  });
});

describe("formatMessage nesting", () => {
  it("resolves a placeholder nested inside a select branch", () => {
    const template = "{winner, select, a {A wins {amount}} b {B wins {amount}} other {Tie}}";
    expect(formatMessage(template, "en", { winner: "a", amount: "5" })).toBe("A wins 5");
    expect(formatMessage(template, "en", { winner: "other", amount: "5" })).toBe("Tie");
  });

  it("resolves a select nested inside a plural, keeping # bound to the outer plural value", () => {
    const template =
      "{n, plural, =0 {nothing} other {# in {bucket, select, hot {the hot bucket} other {a bucket}}}}";
    expect(formatMessage(template, "en", { n: 3, bucket: "hot" })).toBe("3 in the hot bucket");
    expect(formatMessage(template, "en", { n: 3, bucket: "cold" })).toBe("3 in a bucket");
    expect(formatMessage(template, "en", { n: 0, bucket: "hot" })).toBe("nothing");
  });
});

describe("formatMessage apostrophes", () => {
  it("keeps a lone apostrophe literal", () => {
    expect(formatMessage("L'offerta", "it")).toBe("L'offerta");
    expect(formatMessage("Cos'è questo?", "it")).toBe("Cos'è questo?");
  });

  it("collapses a doubled apostrophe to one literal quote", () => {
    expect(formatMessage("It''s fine", "en")).toBe("It's fine");
  });

  it("uses an apostrophe to quote literal braces", () => {
    expect(formatMessage("Use '{literal}' here", "en")).toBe("Use {literal} here");
  });

  it("resumes normal parsing after a closed quote", () => {
    expect(formatMessage("'{not a placeholder}' but {name} is", "en", { name: "X" })).toBe(
      "{not a placeholder} but X is",
    );
  });

  it("treats an unterminated quote as running to the end of the message", () => {
    expect(formatMessage("Trailing '{quote", "en")).toBe("Trailing {quote");
  });
});

describe("formatMessage number forms", () => {
  it("formats a plain {v, number} placeholder with locale grouping", () => {
    expect(formatMessage("{v, number}", "it", { v: 45000 })).toBe("45.000");
    expect(formatMessage("{v, number}", "en", { v: 45000 })).toBe("45,000");
  });

  it("formats a {v, number, ::percent .0} placeholder with one fraction digit", () => {
    expect(formatMessage("{v, number, ::percent .0}", "it", { v: 0.032 })).toBe("3,2%");
    expect(formatMessage("{v, number, ::percent .0}", "en", { v: 0.032 })).toBe("3.2%");
  });

  it("keeps the sign for a negative percent", () => {
    expect(formatMessage("{v, number, ::percent .0}", "en", { v: -0.05 })).toBe("-5.0%");
  });

  it("throws when the number value is missing or not a number", () => {
    expect(() => formatMessage("{v, number}", "en", {})).toThrow(/Missing value/);
    expect(() => formatMessage("{v, number}", "en", { v: "5" })).toThrow(/must be a number/);
  });
});

describe("message syntax validation", () => {
  it("throws MessageSyntaxError when a plural or select is missing its other branch", () => {
    expect(() => formatMessage("{x, select, a {A}}", "en", { x: "a" })).toThrow(MessageSyntaxError);
  });

  it("throws MessageSyntaxError for an unclosed placeholder", () => {
    expect(() => formatMessage("Hello {name", "en", { name: "X" })).toThrow(MessageSyntaxError);
  });

  it("throws MessageSyntaxError for an unsupported argument type", () => {
    expect(() => formatMessage("{x, date}", "en", { x: 1 })).toThrow(MessageSyntaxError);
  });

  it("throws MessageSyntaxError for an unsupported number skeleton", () => {
    expect(() => formatMessage("{x, number, ::currency}", "en", { x: 1 })).toThrow(
      MessageSyntaxError,
    );
  });
});

describe("extractPlaceholderNames", () => {
  it("returns simple placeholder names sorted", () => {
    expect(extractPlaceholderNames("{b} and {a}")).toEqual(["a", "b"]);
  });

  it("includes plural and select discriminators plus nested names", () => {
    const template = "{winner, select, a {A wins {amount}} other {Tie}}";
    expect(extractPlaceholderNames(template)).toEqual(["amount", "winner"]);
  });

  it("does not mistake branch body text for a placeholder", () => {
    const template = "{spouse, plural, =0 {} other {married}}";
    expect(extractPlaceholderNames(template)).toEqual(["spouse"]);
  });
});

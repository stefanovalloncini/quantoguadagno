import { formatNumber, formatPercent } from "./numbers.ts";
import type { Locale } from "./locales.ts";

export type MessageValue = string | number;
export type MessageValues = Record<string, MessageValue>;

export class MessageSyntaxError extends Error {}

type NumberStyle = "plain" | "percent";

type MessageNode =
  | { readonly type: "text"; readonly value: string }
  | { readonly type: "pound" }
  | { readonly type: "arg"; readonly name: string }
  | {
      readonly type: "number";
      readonly name: string;
      readonly style: NumberStyle;
      readonly fractionDigits: number | undefined;
    }
  | {
      readonly type: "plural";
      readonly name: string;
      readonly branches: ReadonlyMap<string, readonly MessageNode[]>;
    }
  | {
      readonly type: "select";
      readonly name: string;
      readonly branches: ReadonlyMap<string, readonly MessageNode[]>;
    };

interface ParseState {
  readonly source: string;
  pos: number;
}

function peek(state: ParseState): string {
  return state.source.charAt(state.pos);
}

function isNameChar(ch: string): boolean {
  return ch.length === 1 && /[A-Za-z0-9_]/.test(ch);
}

function parseName(state: ParseState): string {
  const start = state.pos;
  while (state.pos < state.source.length && isNameChar(peek(state))) state.pos += 1;
  if (state.pos === start) {
    throw new MessageSyntaxError(
      `Expected a name at position ${String(start)} in: ${state.source}`,
    );
  }
  return state.source.slice(start, state.pos);
}

function skipWhitespace(state: ParseState): void {
  while (/\s/.test(peek(state)) && state.pos < state.source.length) state.pos += 1;
}

function expect(state: ParseState, ch: string): void {
  if (peek(state) !== ch) {
    throw new MessageSyntaxError(
      `Expected "${ch}" at position ${String(state.pos)} in: ${state.source}`,
    );
  }
  state.pos += 1;
}

function parseMessage(state: ParseState, insidePlural: boolean): MessageNode[] {
  const nodes: MessageNode[] = [];
  let literal = "";

  const flush = () => {
    if (literal !== "") {
      nodes.push({ type: "text", value: literal });
      literal = "";
    }
  };

  while (state.pos < state.source.length) {
    const ch = peek(state);

    if (ch === "}") break;

    if (ch === "'") {
      const next = state.source.charAt(state.pos + 1);
      if (next === "'") {
        literal += "'";
        state.pos += 2;
        continue;
      }
      if (next === "{" || next === "}") {
        state.pos += 1;
        while (state.pos < state.source.length) {
          if (state.source.charAt(state.pos) === "'") {
            if (state.source.charAt(state.pos + 1) === "'") {
              literal += "'";
              state.pos += 2;
              continue;
            }
            state.pos += 1;
            break;
          }
          literal += state.source.charAt(state.pos);
          state.pos += 1;
        }
        continue;
      }
      literal += "'";
      state.pos += 1;
      continue;
    }

    if (ch === "#" && insidePlural) {
      flush();
      nodes.push({ type: "pound" });
      state.pos += 1;
      continue;
    }

    if (ch === "{") {
      flush();
      nodes.push(parseArgument(state));
      continue;
    }

    literal += ch;
    state.pos += 1;
  }

  flush();
  return nodes;
}

function parseArgument(state: ParseState): MessageNode {
  expect(state, "{");
  skipWhitespace(state);
  const name = parseName(state);
  skipWhitespace(state);

  if (peek(state) === "}") {
    state.pos += 1;
    return { type: "arg", name };
  }

  expect(state, ",");
  skipWhitespace(state);
  const argType = parseName(state);
  skipWhitespace(state);

  if (argType === "number") {
    let style: NumberStyle = "plain";
    let fractionDigits: number | undefined;
    if (peek(state) === ",") {
      state.pos += 1;
      skipWhitespace(state);
      const skeletonStart = state.pos;
      while (state.pos < state.source.length && peek(state) !== "}") state.pos += 1;
      const skeleton = state.source.slice(skeletonStart, state.pos).trim();
      const parsed = parseNumberSkeleton(skeleton);
      style = parsed.style;
      fractionDigits = parsed.fractionDigits;
    }
    expect(state, "}");
    return { type: "number", name, style, fractionDigits };
  }

  if (argType === "plural" || argType === "select") {
    expect(state, ",");
    skipWhitespace(state);
    const branches = new Map<string, readonly MessageNode[]>();
    for (;;) {
      skipWhitespace(state);
      if (peek(state) === "}") break;
      const selector = argType === "plural" ? parsePluralSelector(state) : parseName(state);
      skipWhitespace(state);
      expect(state, "{");
      const branchNodes = parseMessage(state, argType === "plural");
      expect(state, "}");
      branches.set(selector, branchNodes);
    }
    expect(state, "}");
    if (!branches.has("other")) {
      throw new MessageSyntaxError(
        `Missing "other" branch for {${name}, ${argType}, ...} in: ${state.source}`,
      );
    }
    return { type: argType, name, branches };
  }

  throw new MessageSyntaxError(`Unsupported argument type "${argType}" in: ${state.source}`);
}

function parsePluralSelector(state: ParseState): string {
  if (peek(state) === "=") {
    const start = state.pos;
    state.pos += 1;
    while (/[0-9]/.test(peek(state))) state.pos += 1;
    return state.source.slice(start, state.pos);
  }
  return parseName(state);
}

function parseNumberSkeleton(skeleton: string): {
  style: NumberStyle;
  fractionDigits: number | undefined;
} {
  if (skeleton === "") return { style: "plain", fractionDigits: undefined };
  if (!skeleton.startsWith("::")) {
    throw new MessageSyntaxError(`Unsupported number format "${skeleton}"`);
  }
  const tokens = skeleton
    .slice(2)
    .trim()
    .split(/\s+/)
    .filter((token) => token !== "");
  const [first, ...rest] = tokens;
  if (first !== "percent") {
    throw new MessageSyntaxError(`Unsupported number skeleton "${skeleton}"`);
  }
  let fractionDigits: number | undefined;
  for (const token of rest) {
    const match = /^\.(0+)$/.exec(token);
    if (!match?.[1]) {
      throw new MessageSyntaxError(`Unsupported number skeleton token "${token}" in "${skeleton}"`);
    }
    fractionDigits = match[1].length;
  }
  return { style: "percent", fractionDigits };
}

const compiledCache = new Map<string, readonly MessageNode[]>();

function compileMessage(source: string): readonly MessageNode[] {
  const cached = compiledCache.get(source);
  if (cached) return cached;

  const state: ParseState = { source, pos: 0 };
  const nodes = parseMessage(state, false);
  if (state.pos !== source.length) {
    throw new MessageSyntaxError(
      `Unexpected "${peek(state)}" at position ${String(state.pos)} in: ${source}`,
    );
  }
  compiledCache.set(source, nodes);
  return nodes;
}

const pluralRulesCache = new Map<Locale, Intl.PluralRules>();

function pluralRulesFor(locale: Locale): Intl.PluralRules {
  let rules = pluralRulesCache.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRulesCache.set(locale, rules);
  }
  return rules;
}

function requireValue(values: MessageValues, name: string): MessageValue {
  if (!Object.prototype.hasOwnProperty.call(values, name) || values[name] === undefined) {
    throw new Error(`Missing value for placeholder "${name}"`);
  }
  return values[name];
}

function requireNumber(values: MessageValues, name: string): number {
  const raw = requireValue(values, name);
  if (typeof raw !== "number") {
    throw new Error(`Value for "${name}" must be a number`);
  }
  return raw;
}

function render(
  nodes: readonly MessageNode[],
  values: MessageValues,
  locale: Locale,
  pluralValue: number | undefined,
): string {
  let out = "";
  for (const node of nodes) {
    switch (node.type) {
      case "text":
        out += node.value;
        break;

      case "pound":
        if (pluralValue === undefined) {
          throw new Error('Unexpected "#" outside a plural branch');
        }
        out += formatNumber(pluralValue, locale);
        break;

      case "arg":
        out += String(requireValue(values, node.name));
        break;

      case "number": {
        const raw = requireNumber(values, node.name);
        out +=
          node.style === "percent"
            ? formatPercent(raw, locale, node.fractionDigits)
            : formatNumber(raw, locale, node.fractionDigits);
        break;
      }

      case "plural": {
        const raw = requireNumber(values, node.name);
        const exact = node.branches.get(`=${String(raw)}`);
        const category = exact ? undefined : pluralRulesFor(locale).select(raw);
        const branch =
          exact ??
          (category !== undefined ? node.branches.get(category) : undefined) ??
          node.branches.get("other");
        if (!branch) throw new Error(`No matching plural branch for "${node.name}"`);
        out += render(branch, values, locale, raw);
        break;
      }

      case "select": {
        const raw = requireValue(values, node.name);
        const branch = node.branches.get(String(raw)) ?? node.branches.get("other");
        if (!branch) throw new Error(`No matching select branch for "${node.name}"`);
        out += render(branch, values, locale, pluralValue);
        break;
      }
    }
  }
  return out;
}

export function formatMessage(source: string, locale: Locale, values: MessageValues = {}): string {
  const nodes = compileMessage(source);
  return render(nodes, values, locale, undefined);
}

function collectNames(nodes: readonly MessageNode[], names: Set<string>): void {
  for (const node of nodes) {
    switch (node.type) {
      case "text":
      case "pound":
        break;
      case "arg":
      case "number":
        names.add(node.name);
        break;
      case "plural":
      case "select":
        names.add(node.name);
        for (const branch of node.branches.values()) collectNames(branch, names);
        break;
    }
  }
}

export function extractPlaceholderNames(source: string): readonly string[] {
  const names = new Set<string>();
  collectNames(compileMessage(source), names);
  return [...names].sort();
}

import { DEFAULT_LOCALE } from "../i18n/locales.ts";
import type { LegacyPath, Route } from "../routes.ts";

export interface RedirectRule {
  readonly from: string;
  readonly to: string;
  readonly status: LegacyPath["status"];
}

export function isDynamicRule(from: string): boolean {
  return from.includes("*") || from.includes(":");
}

function withTrailingSlash(from: string): readonly string[] {
  return isDynamicRule(from) || from.endsWith("/") ? [from] : [from, `${from}/`];
}

export function redirectRules(routes: readonly Route[]): readonly RedirectRule[] {
  const rules = routes.flatMap((route) =>
    (route.legacy ?? []).flatMap((legacy) =>
      withTrailingSlash(legacy.from).map((from) => ({
        from,
        to: route.path[DEFAULT_LOCALE],
        status: legacy.status,
      })),
    ),
  );
  return [
    ...rules.filter((rule) => !isDynamicRule(rule.from)),
    ...rules.filter((rule) => isDynamicRule(rule.from)),
  ];
}

export function buildRedirects(routes: readonly Route[]): string {
  return redirectRules(routes)
    .map((rule) => `${rule.from} ${rule.to} ${String(rule.status)}\n`)
    .join("");
}

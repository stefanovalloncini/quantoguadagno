import { LOCALES, type Locale } from "@/i18n/locales.ts";
import { getT } from "@/i18n/messages/index.ts";
import {
  breadcrumbsFor,
  groupedRoutes,
  hrefFor,
  isInNav,
  type GroupId,
  type Route,
  type RouteId,
} from "@/routes.ts";

export interface NavEntry {
  readonly id: RouteId;
  readonly href: string;
  readonly label: string;
  readonly description: string | undefined;
  readonly current: boolean;
}

export interface NavGroup {
  readonly id: GroupId;
  readonly label: string;
  readonly current: boolean;
  readonly entries: readonly NavEntry[];
}

export interface LocaleLink {
  readonly locale: Locale;
  readonly href: string;
  readonly label: string;
  readonly current: boolean;
}

export interface Crumb {
  readonly href: string;
  readonly label: string;
}

export function navGroupsFor(
  locale: Locale,
  currentId: RouteId | undefined,
  include: (route: Route) => boolean = isInNav,
): readonly NavGroup[] {
  const t = getT(locale, "layout");
  return groupedRoutes(include).map(({ group, routes }) => {
    const entries = routes.map((route) => ({
      id: route.id,
      href: hrefFor(route.id, locale),
      label: t(route.label),
      description: route.navDescription === undefined ? undefined : t(route.navDescription),
      current: route.id === currentId,
    }));
    return {
      id: group.id,
      label: t(group.label),
      current: entries.some((entry) => entry.current),
      entries,
    };
  });
}

export function localeLinksFor(
  locale: Locale,
  currentId: RouteId | undefined,
): readonly LocaleLink[] {
  const t = getT(locale, "layout");
  return LOCALES.map((candidate) => ({
    locale: candidate,
    href: hrefFor(currentId ?? "home", candidate),
    label: t(`locale.${candidate}` as const),
    current: candidate === locale,
  }));
}

function sitePath(absoluteHref: string): string {
  const url = new URL(absoluteHref);
  return `${url.pathname}${url.hash}`;
}

export function visibleCrumbsFor(route: Route, locale: Locale): readonly Crumb[] {
  const t = getT(locale, "layout");
  return breadcrumbsFor(route, locale)
    .slice(0, -1)
    .map((crumb) => ({ href: sitePath(crumb.href), label: t(crumb.label) }));
}

export function navIdFor(prefix: string, groupId: GroupId): string {
  return `${prefix}-${groupId}`;
}

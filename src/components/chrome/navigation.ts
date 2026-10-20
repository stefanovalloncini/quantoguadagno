import { LOCALES, type Locale } from "@/i18n/locales.ts";
import { getT } from "@/i18n/messages/index.ts";
import type { NamedLink } from "@/seo/structuredData.ts";
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

/** Each language links to the same page: the route's, or the given paths of a page outside it. */
export function localeLinksFor(
  locale: Locale,
  currentId: RouteId | undefined,
  paths?: Readonly<Record<Locale, string>>,
): readonly LocaleLink[] {
  const t = getT(locale, "layout");
  return LOCALES.map((candidate) => ({
    locale: candidate,
    href: paths?.[candidate] ?? hrefFor(currentId ?? "home", candidate),
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

/** The visible crumbs of a page outside the route table: the ancestors in its trail. */
export function visibleCrumbsOf(trail: readonly NamedLink[]): readonly Crumb[] {
  return trail.slice(0, -1).map((crumb) => ({ href: sitePath(crumb.url), label: crumb.name }));
}

export function navIdFor(prefix: string, groupId: GroupId): string {
  return `${prefix}-${groupId}`;
}

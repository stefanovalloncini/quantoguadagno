import type { Locale } from "../i18n/locales.ts";
import type { NamedLink } from "./structuredData.ts";

/**
 * The head of a page that is not in the route table, such as one amount of the gross to net
 * table: its title and description, the same page in each language as site paths, and its
 * breadcrumb trail from the home page to the page itself, with absolute URLs.
 */
export interface PageHead {
  readonly title: string;
  readonly description: string;
  readonly paths: Readonly<Record<Locale, string>>;
  readonly trail: readonly NamedLink[];
}

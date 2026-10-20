import { BCP47_TAG, type Locale } from "../i18n/locales.ts";
import type { PageKind } from "../routes.ts";

export interface NamedLink {
  readonly name: string;
  readonly url: string;
}

export interface StructuredPage {
  readonly locale: Locale;
  readonly kind: PageKind;
  readonly siteName: string;
  readonly homeUrl: string;
  readonly title: string;
  readonly description: string;
  readonly canonical: string | undefined;
  readonly breadcrumbs: readonly NamedLink[];
}

type JsonLdNode = Readonly<Record<string, unknown>>;

export function structuredDataFor(page: StructuredPage): JsonLdNode {
  const inLanguage = BCP47_TAG[page.locale];
  const graph: JsonLdNode[] = [
    { "@type": "WebSite", name: page.siteName, url: page.homeUrl, inLanguage },
  ];
  if (page.kind === "calculator" && page.canonical !== undefined) {
    graph.push({
      "@type": "WebApplication",
      name: page.title,
      description: page.description,
      url: page.canonical,
      inLanguage,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    });
  }
  if (page.kind === "text" && page.canonical !== undefined) {
    graph.push({
      "@type": "WebPage",
      name: page.title,
      description: page.description,
      url: page.canonical,
      inLanguage,
      isPartOf: { "@type": "WebSite", name: page.siteName, url: page.homeUrl },
    });
  }
  if (page.canonical !== undefined && page.breadcrumbs.length > 1) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: page.breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function serializeJsonLd(data: JsonLdNode): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

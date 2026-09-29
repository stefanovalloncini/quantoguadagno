import { describe, expect, it } from "vitest";
import { serializeJsonLd, structuredDataFor, type StructuredPage } from "@/seo/structuredData.ts";

const calculator: StructuredPage = {
  locale: "it",
  kind: "calculator",
  siteName: "Quanto guadagno",
  homeUrl: "https://quantoguadagno.com/",
  title: "Calcolo TFR",
  description: "Calcola il TFR.",
  canonical: "https://quantoguadagno.com/tfr",
  breadcrumbs: [
    { name: "Quanto guadagno", url: "https://quantoguadagno.com/" },
    { name: "Contratto e lavoro", url: "https://quantoguadagno.com/#group-work" },
    { name: "TFR", url: "https://quantoguadagno.com/tfr" },
  ],
};

function typesOf(page: StructuredPage): unknown[] {
  const graph = structuredDataFor(page)["@graph"];
  return Array.isArray(graph) ? graph.map((node: Record<string, unknown>) => node["@type"]) : [];
}

describe("structured data", () => {
  it("describes the site, the calculator and its breadcrumb trail", () => {
    const data = structuredDataFor(calculator);
    expect(data["@context"]).toBe("https://schema.org");
    expect(typesOf(calculator)).toEqual(["WebSite", "WebApplication", "BreadcrumbList"]);
    expect(data["@graph"]).toContainEqual({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Quanto guadagno",
          item: "https://quantoguadagno.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Contratto e lavoro",
          item: "https://quantoguadagno.com/#group-work",
        },
        { "@type": "ListItem", position: 3, name: "TFR", item: "https://quantoguadagno.com/tfr" },
      ],
    });
    expect(data["@graph"]).toContainEqual(
      expect.objectContaining({
        "@type": "WebApplication",
        url: "https://quantoguadagno.com/tfr",
        inLanguage: "it-IT",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      }),
    );
  });

  it("keeps text pages to the site and the breadcrumb", () => {
    expect(typesOf({ ...calculator, kind: "text" })).toEqual(["WebSite", "BreadcrumbList"]);
  });

  it("only describes the site on noindex pages", () => {
    expect(typesOf({ ...calculator, kind: "print", canonical: undefined })).toEqual(["WebSite"]);
    expect(typesOf({ ...calculator, kind: "text", canonical: undefined, breadcrumbs: [] })).toEqual(
      ["WebSite"],
    );
  });

  it("escapes markup so the JSON cannot close its script element", () => {
    const serialized = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(serialized).not.toContain("</script>");
    expect(JSON.parse(serialized)).toEqual({ name: "</script><script>alert(1)</script>" });
  });
});

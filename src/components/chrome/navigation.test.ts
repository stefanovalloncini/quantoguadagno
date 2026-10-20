import { describe, expect, it } from "vitest";
import { localeLinksFor, visibleCrumbsOf } from "./navigation.ts";

describe("language links", () => {
  it("point to the same route in each language", () => {
    expect(
      localeLinksFor("it", "tfr").map((link) => [link.locale, link.href, link.current]),
    ).toEqual([
      ["it", "/tfr", true],
      ["en", "/en/tfr-severance-pay", false],
    ]);
  });

  it("point to the same page outside the route table when given its paths", () => {
    const paths = {
      it: "/stipendio-netto/30000-euro-lordi",
      en: "/en/net-salary/30000-euro-gross",
    };
    expect(localeLinksFor("en", undefined, paths).map((link) => link.href)).toEqual([
      paths.it,
      paths.en,
    ]);
  });
});

describe("visible crumbs of a page outside the route table", () => {
  it("keep the ancestors as site paths and leave out the page itself", () => {
    expect(
      visibleCrumbsOf([
        { name: "Quanto guadagno", url: "https://quantoguadagno.com/" },
        { name: "Tabella lordo netto", url: "https://quantoguadagno.com/stipendio-netto" },
        {
          name: "30.000 € lordi",
          url: "https://quantoguadagno.com/stipendio-netto/30000-euro-lordi",
        },
      ]),
    ).toEqual([
      { href: "/", label: "Quanto guadagno" },
      { href: "/stipendio-netto", label: "Tabella lordo netto" },
    ]);
  });
});

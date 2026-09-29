import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ROUTES, type PageKind } from "@/routes.ts";

const catchAll = readFileSync(new URL("../pages/[...slug].astro", import.meta.url), "utf8");

const DIRECTIVE: Record<PageKind, string> = {
  calculator: "client:load ",
  print: 'client:only="react" ',
  text: "",
};

describe.each(ROUTES.filter((route) => route.island !== undefined))("island of $id", (route) => {
  const name = route.island ?? "";

  it("has a component file", () => {
    expect(existsSync(new URL(`./${name}.tsx`, import.meta.url))).toBe(true);
  });

  it("is imported statically by the catch-all page", () => {
    expect(catchAll).toContain(`import ${name} from "@/islands/${name}.tsx";`);
  });

  it(`is rendered with the directive of a ${route.kind} page and the island props`, () => {
    const usage = new RegExp(
      `island === "${name}" &&\\s*\\(?\\s*<${name} ${DIRECTIVE[route.kind]}locale=\\{locale\\} messages=\\{messages\\} />`,
    );
    expect(catchAll).toMatch(usage);
  });
});

describe("catch-all page", () => {
  it("never hydrates a text page", () => {
    const textBranch = catchAll.slice(
      catchAll.indexOf('route.kind === "text"'),
      catchAll.indexOf("<div data-restore-target>"),
    );
    expect(textBranch).not.toContain("client:");
  });
});

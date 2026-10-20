import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { getMessages } from "@/i18n/messages/index.ts";
import ForfettarioCalculator from "@/islands/ForfettarioCalculator.tsx";

const MESSAGES = getMessages("it", ["form", "forfettario"]);

const roots: Root[] = [];

function setup() {
  const user = userEvent.setup();
  const island = <ForfettarioCalculator locale="it" messages={MESSAGES} />;
  const container = document.createElement("div");
  container.innerHTML = renderToString(island);
  document.body.append(container);
  act(() => {
    roots.push(hydrateRoot(container, island));
  });
  return { user };
}

beforeAll(() => {
  Element.prototype.scrollIntoView = () => undefined;
});

afterEach(() => {
  act(() => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
});

describe("ForfettarioCalculator", () => {
  it("lists a contribution reduction only when one applies, since no summary shows it", async () => {
    const { user } = setup();
    expect(screen.queryByRole("heading", { name: "Ipotesi del calcolo" })).toBeNull();
    await user.click(screen.getByText("Cassa previdenziale e contributi"));
    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Cassa previdenziale" }),
      "artigiani",
    );
    await user.click(await screen.findByRole("checkbox", { name: /riduzione 35%/ }));
    const list = screen.getByRole("heading", { name: "Ipotesi del calcolo" }).closest("section");
    expect(list?.querySelectorAll("li")).toHaveLength(1);
    expect(list).toHaveTextContent("Applicata la riduzione 35% (L. 190/2014).");
    expect(list?.querySelector("a")).toBeNull();
  });
});

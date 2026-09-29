import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import emiliaFile from "@/data/comuni/emilia-romagna.json";
import lombardiaFile from "@/data/comuni/lombardia.json";
import type { RegionCode, RegionComuni } from "@/data/index.ts";
import type { ComuneLookup, ComuniList } from "@/islands/home/useComune.ts";
import { ComuneField } from "./ComuneField.tsx";
import { KitTestProvider } from "./testing.tsx";

const FILES: Readonly<Partial<Record<RegionCode, RegionComuni>>> = {
  lombardia: lombardiaFile as RegionComuni,
  "emilia-romagna": emiliaFile as RegionComuni,
};

function Harness({
  onSelect = () => undefined,
}: {
  readonly onSelect?: (id: string | null) => void;
}) {
  const [region, setRegion] = useState<RegionCode>("lombardia");
  const [id, setId] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [rate, setRate] = useState("0,8");
  const file = FILES[region];
  const list: ComuniList =
    file === undefined ? { status: "loading" } : { status: "ready", comuni: file.comuni };
  const found = id === null ? undefined : file?.comuni.find((comune) => comune.id === id);
  const selection: ComuneLookup =
    id === null
      ? { status: "none" }
      : found === undefined
        ? { status: "missing", id }
        : { status: "ready", id, comune: found };
  return (
    <>
      <p data-testid="region">{region}</p>
      <ComuneField
        region={region}
        year={2026}
        list={list}
        selection={selection}
        manual={manual}
        manualRate={rate}
        onLoad={() => undefined}
        onSelect={(next) => {
          setId(next);
          onSelect(next);
        }}
        onSwitchRegion={(nextRegion, nextId) => {
          setRegion(nextRegion);
          setId(nextId);
        }}
        onManualChange={setManual}
        onManualRateChange={setRate}
      />
    </>
  );
}

function setup(onSelect?: (id: string | null) => void) {
  const user = userEvent.setup();
  render(
    <KitTestProvider>
      <Harness {...(onSelect === undefined ? {} : { onSelect })} />
    </KitTestProvider>,
  );
  return { user, input: screen.getByRole("combobox", { name: "Comune di residenza" }) };
}

beforeAll(() => {
  Element.prototype.scrollIntoView = () => undefined;
});

describe("ComuneField", () => {
  it("says which rate applies while no comune is chosen", () => {
    const { input } = setup();
    expect(input).toHaveAccessibleDescription(/Nessun comune scelto: per ora usiamo lo 0,80%/);
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("lists the region's comuni with their rate and picks one with the keyboard", async () => {
    const onSelect = vi.fn();
    const { user, input } = setup(onSelect);
    await user.type(input, "Mil");
    expect(input).toHaveAttribute("aria-expanded", "true");
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveTextContent("Milano (MI)0,80%");
    expect(screen.getByRole("status")).toHaveTextContent(/comuni in Lombardia/);
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant", options[0]?.id);
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("F205");
    expect(input).toHaveValue("Milano (MI)");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveAccessibleDescription(/Milano: 0,80%, esente fino a 23\.000/);
  });

  it("closes the list with Escape and keeps the typed text", async () => {
    const { user, input } = setup();
    await user.type(input, "Ber");
    expect(input).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveValue("Ber");
  });

  it("puts back the chosen comune when the search is abandoned", async () => {
    const { user, input } = setup();
    await user.type(input, "Mil");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(input).toHaveValue("Milano (MI)");
    await user.clear(input);
    await user.type(input, "Ber");
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("Ber");
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("Milano (MI)");
    await user.type(input, "{Backspace}{Backspace}xx");
    await user.click(document.body);
    expect(input).toHaveValue("Milano (MI)");
  });

  it("finds a comune in another region and switches to it", async () => {
    const { user, input } = setup();
    await user.type(input, "Piacenza");
    const choice = await screen.findByRole("button", {
      name: "Scegli Piacenza (PC), in Emilia-Romagna",
    });
    expect(input).toHaveAccessibleDescription(/Piacenza è in Emilia-Romagna, non in Lombardia/);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Piacenza è in Emilia-Romagna, non in Lombardia. Scegli Piacenza (PC), in Emilia-Romagna",
    );
    await user.click(choice);
    expect(screen.getByTestId("region")).toHaveTextContent("emilia-romagna");
    await waitFor(() => {
      expect(input).toHaveValue("Piacenza (PC)");
    });
    expect(input).toHaveFocus();
  });

  it("offers the manual rate only from its button, and goes back to the search", async () => {
    const { user } = setup();
    expect(screen.queryByRole("textbox", { name: /Aliquota/ })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Inserisci l’aliquota a mano" }));
    const rate = screen.getByRole("textbox", {
      name: "Aliquota dell’addizionale comunale in percentuale",
    });
    expect(rate).toHaveFocus();
    expect(rate).toHaveAccessibleDescription(/Letto come 0,80%, senza soglia di esenzione/);
    await user.click(screen.getByRole("button", { name: "Cerca di nuovo il comune" }));
    expect(screen.getByRole("combobox", { name: "Comune di residenza" })).toHaveFocus();
  });
});

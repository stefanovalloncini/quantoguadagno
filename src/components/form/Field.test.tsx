import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./Checkbox.tsx";
import { Field } from "./Field.tsx";
import { MoneyInput } from "./MoneyInput.tsx";
import { RadioGroup } from "./RadioGroup.tsx";
import { KitTestProvider } from "./testing.tsx";

function Money({ initial = "" }: { readonly initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <Field id="ral" label="RAL" labelSuffix="in euro" hint="Dal contratto" after="Riga dopo">
      {(control) => <MoneyInput {...control} name="gross" value={value} onValueChange={setValue} />}
    </Field>
  );
}

describe("Field", () => {
  it("labels the control and describes it with hint and after-line", () => {
    render(
      <KitTestProvider>
        <Money />
      </KitTestProvider>,
    );
    const input = screen.getByRole("textbox", { name: "RAL in euro" });
    expect(input).toHaveAccessibleDescription("Dal contratto Riga dopo");
    expect(input).toHaveAttribute("inputmode", "decimal");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("puts the error between hint and control, with a hidden prefix, and marks the control invalid", () => {
    render(
      <KitTestProvider>
        <Field id="ral" label="RAL" hint="Dal contratto" error="Inserisci la RAL in cifre">
          {(control) => <MoneyInput {...control} value="abc" onValueChange={() => undefined} />}
        </Field>
      </KitTestProvider>,
    );
    const input = screen.getByRole("textbox", { name: "RAL" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Dal contratto Errore: Inserisci la RAL in cifre");
  });
});

describe("MoneyInput", () => {
  it("keeps the raw text while typing and tidies it on blur", async () => {
    const user = userEvent.setup();
    render(
      <KitTestProvider>
        <Money />
      </KitTestProvider>,
    );
    const input = screen.getByRole("textbox", { name: "RAL in euro" });
    await user.type(input, "35k");
    expect(input).toHaveValue("35k");
    await user.tab();
    await waitFor(() => {
      expect(input).toHaveValue("35.000");
    });
  });

  it("shows two decimals only when there are cents, and leaves text it cannot read", async () => {
    const user = userEvent.setup();
    render(
      <KitTestProvider>
        <Money initial="932,5" />
      </KitTestProvider>,
    );
    const input = screen.getByRole("textbox", { name: "RAL in euro" });
    await user.click(input);
    await user.tab();
    await waitFor(() => {
      expect(input).toHaveValue("932,50");
    });
    await user.clear(input);
    await user.type(input, "trentacinque");
    await user.tab();
    expect(input).toHaveValue("trentacinque");
  });

  it("puts the euro sign before the amount in English", () => {
    const { container } = render(
      <KitTestProvider locale="en">
        <Money initial="35,000" />
      </KitTestProvider>,
    );
    expect(container.querySelector(".qg-input--unit-start")).not.toBeNull();
  });
});

describe("RadioGroup and Checkbox", () => {
  it("groups radios under a legend and gives each a predictable id", async () => {
    const user = userEvent.setup();
    function Years() {
      const [year, setYear] = useState("2026");
      return (
        <RadioGroup
          idPrefix="anno"
          name="year"
          legend="Anno fiscale"
          value={year}
          options={["2024", "2025", "2026"].map((value) => ({ value, label: value }))}
          onValueChange={setYear}
        />
      );
    }
    render(
      <KitTestProvider>
        <Years />
      </KitTestProvider>,
    );
    const group = screen.getByRole("group", { name: "Anno fiscale" });
    expect(group).toBeInTheDocument();
    expect(document.getElementById("anno-2026")).toBeChecked();
    await user.click(screen.getByLabelText("2024"));
    expect(document.getElementById("anno-2024")).toBeChecked();
  });

  it("reveals its follow-up fields only when checked", async () => {
    const user = userEvent.setup();
    function Madre() {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox
          id="madre"
          label="Esonero"
          hint="Se hai i requisiti"
          checked={checked}
          onCheckedChange={setChecked}
        >
          <p>Numero di figli</p>
        </Checkbox>
      );
    }
    render(
      <KitTestProvider>
        <Madre />
      </KitTestProvider>,
    );
    expect(screen.queryByText("Numero di figli")).not.toBeVisible();
    await user.click(screen.getByRole("checkbox", { name: "Esonero" }));
    expect(screen.getByText("Numero di figli")).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "Esonero" })).toHaveAccessibleDescription(
      "Se hai i requisiti",
    );
  });
});

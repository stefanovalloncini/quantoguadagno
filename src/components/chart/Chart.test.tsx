import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KitTestProvider } from "@/components/form/testing.tsx";
import { formatMoney } from "@/i18n/numbers.ts";
import { Chart } from "./Chart.tsx";
import type { ChartSeries } from "./chartModel.ts";
import { ChartTable, seriesColumns, seriesRows } from "./ChartTable.tsx";

const SERIES: readonly ChartSeries[] = [
  {
    id: "nominal",
    label: "RAL",
    kind: "line",
    endLabels: "last",
    data: [
      { x: 2019, y: 25_000 },
      { x: 2026, y: 32_000 },
    ],
  },
  {
    id: "real",
    label: "RAL in euro del 2026",
    kind: "line",
    tone: "muted",
    data: [
      { x: 2019, y: 30_239 },
      { x: 2026, y: 32_000 },
    ],
  },
];

describe("Chart", () => {
  it("is one image named by its summary, with a legend for two series", () => {
    render(
      <KitTestProvider>
        <Chart
          summary="La RAL passa da 25.000 € a 32.000 €."
          series={SERIES}
          caption="Importi in euro."
          formatX={String}
        />
      </KitTestProvider>,
    );
    const image = screen.getByRole("img", { name: "La RAL passa da 25.000 € a 32.000 €." });
    expect(image).toBeInTheDocument();
    const legend = screen.getByRole("list");
    expect(
      within(legend)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["RAL", "RAL in euro del 2026"]);
    expect(screen.getByText("Importi in euro.")).toBeInTheDocument();
  });

  it("formats ticks with the page locale and keeps years ungrouped", () => {
    const { container } = render(
      <KitTestProvider locale="it">
        <Chart summary="Riepilogo" series={SERIES} formatX={String} zeroBased={false} />
      </KitTestProvider>,
    );
    const ticks = [...container.querySelectorAll(".qg-chart__y text")].map(
      (tick) => tick.textContent,
    );
    expect(ticks).toContain("30.000");
    const years = [...container.querySelectorAll(".qg-chart__x-ticks--wide text")].map(
      (tick) => tick.textContent,
    );
    expect(years[0]).toBe("2019");
  });

  it("leaves out the legend for a single series", () => {
    render(
      <KitTestProvider>
        <Chart summary="Riepilogo" series={SERIES.slice(0, 1)} />
      </KitTestProvider>,
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});

describe("ChartTable", () => {
  it("is a focusable region named by its caption, one row per x", () => {
    const money = (value: number) => formatMoney(value, "it");
    render(
      <ChartTable
        caption="RAL anno per anno"
        columns={seriesColumns(SERIES, { xHeader: "Anno", formatX: String, formatY: money })}
        rows={seriesRows(SERIES)}
        rowKey={(row) => String(row.x)}
      />,
    );
    const region = screen.getByRole("region", { name: "RAL anno per anno" });
    expect(region).toHaveAttribute("tabindex", "0");
    const table = within(region).getByRole("table", { name: "RAL anno per anno" });
    expect(
      within(table)
        .getAllByRole("rowheader")
        .map((cell) => cell.textContent),
    ).toEqual(["2019", "2026"]);
    expect(table.textContent).toContain(formatMoney(30_239, "it"));
  });
});

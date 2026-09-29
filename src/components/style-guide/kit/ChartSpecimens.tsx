import { Chart } from "@/components/chart/Chart.tsx";
import type { ChartSeries } from "@/components/chart/chartModel.ts";
import { ChartTable, seriesColumns, seriesRows } from "@/components/chart/ChartTable.tsx";
import { formatMoney } from "@/i18n/numbers.ts";
import { KitProvider, KitSpecimen } from "./KitProvider.tsx";

const MONTHS = [
  1353.36, 1353.36, 1353.36, 1353.36, 1353.36, 1312.76, 1273.38, 1235.18, 1198.12, 1162.18, 1127.31,
  1093.49,
];

const money = (value: number) => formatMoney(value, "it");
const whole = (value: number) => formatMoney(value, "it", { integer: true });

const BARS: readonly ChartSeries[] = [
  {
    id: "gross",
    label: "Lordo",
    kind: "bar",
    endLabels: "first-last",
    data: MONTHS.map((y, index) => ({ x: index + 1, y })),
  },
];

const LINES: readonly ChartSeries[] = [
  {
    id: "nominal",
    label: "RAL",
    kind: "line",
    data: [
      { x: 2019, y: 25_000 },
      { x: 2022, y: 28_000 },
      { x: 2024, y: 30_500 },
      { x: 2026, y: 33_000 },
    ],
  },
  {
    id: "real",
    label: "RAL in euro del 2026",
    kind: "line",
    tone: "muted",
    data: [
      { x: 2019, y: 30_239 },
      { x: 2022, y: 30_887 },
      { x: 2024, y: 31_621 },
      { x: 2026, y: 33_000 },
    ],
  },
  {
    id: "projected",
    label: "RAL stimata",
    kind: "line",
    stroke: "dashed",
    markers: false,
    endLabels: "last",
    data: [
      { x: 2026, y: 33_000 },
      { x: 2028, y: 34_011 },
      { x: 2031, y: 35_585 },
    ],
  },
];

const STACKED: readonly ChartSeries[] = [
  {
    id: "paid",
    label: "Versamenti",
    kind: "bar",
    data: [1, 2, 3, 4, 5, 6].map((year) => ({ x: year, y: 1_200 * year })),
  },
  {
    id: "interest",
    label: "Interessi",
    kind: "bar",
    tone: "muted",
    data: [1, 2, 3, 4, 5, 6].map((year) => ({
      x: year,
      y: Math.round(1_200 * year * (1.03 ** year - 1)),
    })),
  },
];

const STEP: readonly ChartSeries[] = [
  {
    id: "rate",
    label: "Aliquota",
    kind: "step",
    endLabels: "last",
    data: [
      { x: 2021, y: 1.9 },
      { x: 2022, y: 8.1 },
      { x: 2023, y: 5.4 },
      { x: 2024, y: 0.9 },
      { x: 2025, y: 1.4 },
      { x: 2026, y: 2.2 },
    ],
  },
];

export function ChartSpecimens() {
  return (
    <KitProvider>
      <KitSpecimen
        label="Barre con tabella accanto"
        note="Chart con una serie a barre e le etichette sulla prima e sull’ultima barra; ChartTable è la tabella con gli stessi numeri, una regione che prende il focus. Nessun valore solo al passaggio del mouse."
        column
      >
        <div className="qg-split">
          <Chart
            summary="Importo lordo della NASpI mese per mese: 1.353,36 € nei primi 5 mesi, poi in calo del 3% al mese fino a 1.093,49 € nel mese 12."
            series={BARS}
            xLabel="Mese"
            caption="Importo lordo per mese, in euro: dal sesto mese ogni barra è il 3% più bassa della precedente."
            formatValue={money}
          />
          <ChartTable
            caption="Importo mese per mese"
            columns={seriesColumns(BARS, { xHeader: "Mese", formatX: String, formatY: money })}
            rows={seriesRows(BARS)}
            rowKey={(row) => String(row.x)}
          />
        </div>
      </KitSpecimen>
      <KitSpecimen
        label="Linee, legenda e stima tratteggiata"
        note="Con due serie o più la legenda è sempre presente. Inchiostro per la serie principale, grigio per la seconda, tratteggio per le stime. zeroBased={false} per linee che si muovono in un intervallo."
        column
      >
        <Chart
          summary="RAL dal 2019 al 2026: da 25.000 € a 33.000 €; in euro del 2026 da 30.239 € a 33.000 €. Stima fino al 2031: 35.585 €."
          series={LINES}
          zeroBased={false}
          formatX={String}
          formatValue={whole}
          caption="RAL annue in euro."
        />
      </KitSpecimen>
      <KitSpecimen
        label="Barre impilate"
        note='barLayout="stacked": i segmenti si separano con 2 px di carta, non con un bordo.'
        column
      >
        <Chart
          summary="Capitale dopo 6 anni: 7.200 € versati e 1.397 € di interessi."
          series={STACKED}
          barLayout="stacked"
          xLabel="Anno"
          caption="Capitale a fine anno, in euro."
        />
      </KitSpecimen>
      <KitSpecimen
        label="Gradini"
        note='kind="step" per valori che restano fermi fino al cambio successivo.'
        column
      >
        <Chart
          summary="Inflazione annua dal 2021 al 2026: massimo 8,1% nel 2022, 2,2% nel 2026."
          series={STEP}
          xScale="band"
          formatX={String}
          formatY={(value) => `${String(value).replace(".", ",")}%`}
          caption="Variazione annua dei prezzi, in percentuale."
        />
      </KitSpecimen>
    </KitProvider>
  );
}

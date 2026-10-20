import { LinkList } from "@/components/page/LinkList.tsx";
import { Pager } from "@/components/page/Pager.tsx";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { getMessages } from "@/i18n/messages/index.ts";
import { I18nProvider } from "@/i18n/react.tsx";
import { AmountTable } from "@/islands/netTable/AmountTable.tsx";
import { CityTable } from "@/islands/netTable/CityTable.tsx";
import { netRows, type CityRow } from "@/islands/netTable/model.ts";
import { referenceResidence } from "@/islands/netTable/residences.ts";
import { KitSpecimen } from "./KitProvider.tsx";

const MESSAGES = getMessages("it", ["form", "netTable"]);
const YEAR = LATEST_SUPPORTED_YEAR;
const ROWS = netRows([20_000, 30_000, 40_000], YEAR, referenceResidence(YEAR));

const LINKS = [
  {
    href: "#lordo-netto",
    label: "Come calcoliamo il netto",
    description: "Ogni passaggio del calcolo, con le fonti",
  },
  { href: "#testo", label: "Glossario", description: "Le parole della busta paga" },
];

export interface NetTableSpecimensProps {
  readonly cities: readonly CityRow[];
}

export function NetTableSpecimens({ cities }: NetTableSpecimensProps) {
  return (
    <I18nProvider locale="it" messages={MESSAGES}>
      <KitSpecimen
        label="Tabella degli importi"
        note="AmountTable: la RAL è l’intestazione di riga e porta alla pagina dell’importo, con l’area di tocco di 44 px. Impilata sotto 720 px: RAL e netto annuo in alto, le altre colonne sotto con la loro etichetta."
        column
      >
        <AmountTable
          caption={`Netto ${String(YEAR)} per RAL, con residenza a Milano`}
          rows={ROWS}
          counts={[13, 14]}
          withheld
          stacked
        />
      </KitSpecimen>
      <KitSpecimen
        label="Tabella breve"
        note="La stessa tabella non impilata, con una sola colonna mensile: sta in 320 px."
        column
      >
        <AmountTable
          caption={`Netto ${String(YEAR)} delle RAL più cercate`}
          rows={ROWS}
          counts={[13]}
        />
      </KitSpecimen>
      <KitSpecimen
        label="Capoluoghi a confronto"
        note="CityTable: una riga per capoluogo, nell’ordine delle regioni del calcolatore. La riga di riferimento lo dice a parole («riferimento») e il grassetto lo ripete; ogni capoluogo apre il calcolatore con il suo comune."
        column
      >
        <CityTable
          caption={`Netto ${String(YEAR)} con 30.000 € lordi in quattro capoluoghi`}
          cities={cities}
          count={13}
          hrefOf={() => "#lordo-netto"}
        />
      </KitSpecimen>
      <KitSpecimen
        label="Importi vicini"
        note="Pager: la paginazione di GOV.UK nella forma a blocchi, con il titolo in grassetto dopo il suo chevron e sotto il nome della pagina. Dopo i due vicini, il link a tutta la serie."
        column
      >
        <Pager
          label="Altri importi"
          previousTitle="Precedente"
          nextTitle="Successivo"
          previous={{ href: "#lordo-netto", label: "29.000 € lordi" }}
          next={{ href: "#lordo-netto", label: "31.000 € lordi" }}
          all={{ href: "#lordo-netto", label: "Tutti gli importi nella tabella lordo netto" }}
        />
      </KitSpecimen>
      <KitSpecimen
        label="Elenco di link"
        note="LinkList: le voci del menu fuori dal menu, per la fascia «Per capire …» delle pagine di testo."
        column
      >
        <LinkList links={LINKS} />
      </KitSpecimen>
    </I18nProvider>
  );
}

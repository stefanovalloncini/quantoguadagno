import { LinkList } from "@/components/page/LinkList.tsx";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { getMessages } from "@/i18n/messages/index.ts";
import { I18nProvider } from "@/i18n/react.tsx";
import { AmountTable } from "@/islands/netTable/AmountTable.tsx";
import { netRows } from "@/islands/netTable/model.ts";
import { referenceResidence } from "@/islands/netTable/residences.ts";
import { KitSpecimen } from "./KitProvider.tsx";

const MESSAGES = getMessages("it", ["netTable"]);
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

export function NetTableSpecimens() {
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
        label="Elenco di link"
        note="LinkList: le voci del menu fuori dal menu, per la fascia «Per capire …» delle pagine di testo."
        column
      >
        <LinkList links={LINKS} />
      </KitSpecimen>
    </I18nProvider>
  );
}

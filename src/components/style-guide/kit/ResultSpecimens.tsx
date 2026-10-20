import { Actions } from "@/components/result/Actions.tsx";
import { Assumptions, NoteLine } from "@/components/result/Assumptions.tsx";
import { BottomBar } from "@/components/result/BottomBar.tsx";
import {
  BracketIndicator,
  InsightList,
  RaiseImpact,
  YearComparison,
} from "@/components/result/Insights.tsx";
import { Ledger, WorkedSum, type LedgerRow } from "@/components/result/Ledger.tsx";
import { ResultFigure } from "@/components/result/ResultFigure.tsx";
import { Topics } from "@/components/result/Topics.tsx";
import { KitProvider, KitSpecimen, noop } from "./KitProvider.tsx";

const COLUMNS = { term: "Voce", monthly: "Media mensile", annual: "Annuo" };

const ROWS: readonly LedgerRow[] = [
  {
    id: "gross",
    name: "Lordo",
    rule: "RAL",
    kind: "plain",
    monthly: "2.692,31 €",
    annual: "35.000,00 €",
  },
  {
    id: "inps",
    name: "Contributi INPS",
    rule: "9,19% del lordo",
    kind: "deducted",
    monthly: "−247,42 €",
    annual: "−3.216,50 €",
  },
  {
    id: "taxable",
    name: "Reddito imponibile",
    rule: "lordo meno contributi",
    kind: "subtotal",
    monthly: "2.444,89 €",
    annual: "31.783,50 €",
  },
  {
    id: "irpef",
    name: "IRPEF netta",
    rule: "a scaglioni, meno detrazioni",
    kind: "deducted",
    monthly: "−387,85 €",
    annual: "−5.042,04 €",
    explanation: (
      <>
        <p>
          L’IRPEF si calcola a scaglioni sul reddito imponibile; poi si tolgono le detrazioni che ti
          spettano.
        </p>
        <WorkedSum
          rows={[
            {
              id: "gross",
              label: "IRPEF lorda: 23% fino a 28.000 €, 33% oltre",
              amount: "7.688,56 €",
            },
            { id: "work", label: "Detrazione per lavoro dipendente", amount: "−1.646,52 €" },
            {
              id: "wedge",
              label: "Detrazione aggiuntiva del taglio del cuneo fiscale",
              amount: "−1.000,00 €",
            },
          ]}
          total={{ id: "net", label: "IRPEF netta", amount: "5.042,04 €" }}
        />
      </>
    ),
  },
  {
    id: "regional",
    name: "Addizionale regionale",
    rule: "Lombardia, 1,23–1,73%",
    kind: "deducted",
    monthly: "−35,00 €",
    annual: "−454,98 €",
  },
  {
    id: "municipal",
    name: "Addizionale comunale",
    rule: "Milano, 0,80%",
    kind: "deducted",
    monthly: "−19,56 €",
    annual: "−254,27 €",
  },
];

const TOTAL: LedgerRow = {
  id: "net",
  name: "Netto",
  rule: "imponibile meno IRPEF e addizionali",
  kind: "total",
  monthly: "2.002,48 €",
  annual: "26.032,21 €",
};

const CREDIT_ROWS: readonly LedgerRow[] = [
  { id: "gross", name: "Lordo", rule: "RAL", kind: "plain", annual: "20.000,00 €" },
  {
    id: "inps",
    name: "Contributi INPS",
    rule: "9,19% del lordo",
    kind: "deducted",
    annual: "−1.838,00 €",
  },
  {
    id: "taxable",
    name: "Reddito imponibile",
    rule: "lordo meno contributi",
    kind: "subtotal",
    annual: "18.162,00 €",
  },
  {
    id: "irpef",
    name: "IRPEF netta",
    rule: "a scaglioni, meno detrazioni",
    kind: "deducted",
    annual: "−1.366,70 €",
  },
  {
    id: "regional",
    name: "Addizionale regionale",
    rule: "Lombardia, 1,23–1,73%",
    kind: "deducted",
    annual: "−234,46 €",
  },
  {
    id: "municipal",
    name: "Addizionale comunale",
    rule: "Milano, 0,80%",
    kind: "deducted",
    annual: "0,00 €",
  },
  {
    id: "somma",
    name: "Somma aggiuntiva",
    rule: "taglio del cuneo fiscale",
    kind: "credited",
    annual: "+871,78 €",
  },
];

const ASSUMPTIONS = [
  {
    id: "year",
    text: "Anno fiscale 2026",
    changeLabel: "anno fiscale",
    targetId: "sg-kit-anno-2026",
  },
  { id: "region", text: "Regione Lombardia", changeLabel: "regione", targetId: "sg-regione" },
  {
    id: "comune",
    text: "Comune di Milano, addizionale 0,80%",
    changeLabel: "comune",
    targetId: "sg-comune-3",
  },
];

export function ResultSpecimens() {
  return (
    <KitProvider>
      <KitSpecimen
        label="Cifra del risultato"
        note="ResultFigure: etichetta, cifra dimensionata sulla colonna, base di calcolo e righe sotto. Con più di 12 mensilità e un profilo semplice la prima riga divide la media in mese normale e mensilità aggiuntive. La cifra si assesta in 150 ms, niente movimento con riduzione del movimento."
        column
      >
        <div className="sg-figure-stage">
          <ResultFigure
            headingId="sg-figura-1"
            label="Netto mensile"
            state="ready"
            value="2.002,48 €"
            basis="media su 13 mensilità"
            subLines={[
              <>
                Mese normale <strong>2.013,40 €</strong>, tredicesima <strong>1.871,41 €</strong>
              </>,
              <>
                Netto annuo <strong>26.032,21 €</strong>
              </>,
            ]}
          />
        </div>
      </KitSpecimen>
      <KitSpecimen
        label="Non aggiornato"
        note="L’ultima cifra valida in grigio, con il motivo."
        column
      >
        <div className="sg-figure-stage">
          <ResultFigure
            headingId="sg-figura-2"
            label="Netto mensile"
            state="stale"
            value="2.002,48 €"
            basis="media su 13 mensilità"
            staleNote="Non aggiornato: è il risultato per 35.000,00 € lordi. Correggi la RAL per ricalcolare."
          />
        </div>
      </KitSpecimen>
      <KitSpecimen label="Vuoto" note="Mai 0,00 €, NaN o un trattino." column>
        <div className="sg-figure-stage">
          <ResultFigure
            headingId="sg-figura-3"
            label="Netto mensile"
            state="empty"
            prompt="Inserisci la RAL per vedere il netto."
          />
        </div>
      </KitSpecimen>
      <KitSpecimen
        label="Ipotesi del calcolo e nota di stima"
        note="Nomina solo ciò che il modulo della pagina non mostra. Cambia apre il gruppo del campo e ci porta il fuoco; un fatto fisso non ha Cambia."
        column
      >
        <div className="sg-figure-stage">
          <Assumptions headingId="sg-ipotesi" items={ASSUMPTIONS} onChange={noop} />
        </div>
        <NoteLine term="Stima:">
          la busta paga resta il riferimento.{" "}
          <a href="#risultato">Dati controllati il 28 settembre 2026</a>: 7 valori usati in questo
          calcolo sono ancora da verificare.
        </NoteLine>
      </KitSpecimen>
      <KitSpecimen
        label="Dettaglio del calcolo"
        note="Ledger: righe che si sommano, trattenute con “, trattenuta” nascosto, totale con filetto di 2 px. La colonna mensile sparisce sotto 34rem di colonna."
        column
      >
        <div className="sg-figure-stage">
          <Ledger
            headingId="sg-dettaglio-1"
            toggleId="sg-spiega-1"
            title="Dettaglio del calcolo"
            caption="Dettaglio del calcolo 2026, importi in euro"
            columns={COLUMNS}
            rows={ROWS}
            total={TOTAL}
            explained
          />
        </div>
      </KitSpecimen>
      <KitSpecimen
        label="Dettaglio con crediti"
        note="Sotto circa 22.000 € di RAL compaiono crediti che si aggiungono al netto, con “, credito” nascosto e il segno più."
        column
      >
        <div className="sg-figure-stage">
          <Ledger
            headingId="sg-dettaglio-2"
            toggleId="sg-spiega-2"
            title="Dettaglio del calcolo"
            caption="Dettaglio del calcolo 2026, importi in euro"
            columns={{ term: "Voce", annual: "Annuo" }}
            rows={CREDIT_ROWS}
            total={{
              id: "net",
              name: "Netto",
              rule: "imponibile meno imposte, più crediti",
              kind: "total",
              annual: "17.432,62 €",
            }}
            explained={false}
          />
        </div>
      </KitSpecimen>
      <KitSpecimen
        label="Azioni"
        note="Link sottolineati con icona; Copia il link conferma a voce e a schermo."
      >
        <Actions
          links={[
            { id: "print", icon: "print", label: "Stampa la busta paga", href: "#azioni" },
            {
              id: "cost",
              icon: "building",
              label: "Calcola quanto costi all’azienda",
              href: "#azioni",
            },
          ]}
          copyLink
        />
      </KitSpecimen>
      <KitSpecimen
        label="Barra del netto"
        note="BottomBar: solo sotto 60rem, quando la cifra non è tutta visibile; sparisce mentre scrivi e sotto 30rem di altezza. Tutta la barra porta al risultato."
        column
      >
        <div className="sg-netbar">
          <BottomBar
            label="Netto mensile"
            value="2.002,48 €"
            targetId="sg-figura-1"
            visible
            inline
          />
        </div>
      </KitSpecimen>
      <KitSpecimen label="Approfondimenti" column>
        <InsightList>
          <BracketIndicator
            headingId="sg-scaglione"
            title="Scaglione IRPEF"
            bands={[
              { id: "1", rate: "23%", range: "fino a 28.000 €" },
              { id: "2", rate: "33%", range: "da 28.000 a 50.000 €" },
              { id: "3", rate: "43%", range: "oltre 50.000 €" },
            ]}
            currentIndex={1}
            progress={0.172}
            text="Il tuo reddito imponibile, 31.783,50 €, arriva nello scaglione del 33%, che vale solo per la parte sopra 28.000 €. Mancano 18.216,50 € allo scaglione successivo."
          />
          <RaiseImpact
            headingId="sg-aumento"
            title="Se il lordo aumenta di 1.000 €"
            figure="+420,26 €"
            unit="netti all’anno"
            text="Cioè 32,33 € in più al mese, su 13 mensilità. Di ogni euro lordo in più ti restano 42 centesimi."
            note="Aliquota marginale 57,97%, cioè la parte di ogni euro lordo in più che va in trattenute."
          />
          <YearComparison
            headingId="sg-anni"
            title="Stesso lordo, altri anni"
            caption="Netto annuo con 35.000,00 € lordi, per anno fiscale"
            columns={{ year: "Anno", net: "Netto annuo", delta: "Rispetto al 2026" }}
            rows={[
              { year: 2024, net: "24.956,54 €", delta: "−1.075,67 €", selected: false },
              { year: 2025, net: "25.956,54 €", delta: "−75,67 €", selected: false },
              { year: 2026, net: "26.032,21 €", delta: "anno scelto", selected: true },
            ]}
            note="Nel 2026 l’aliquota da 28.000 a 50.000 € è scesa dal 35% al 33%."
          />
        </InsightList>
      </KitSpecimen>
      <KitSpecimen
        label="Per capire"
        note="Topics: dettagli nativi, funzionano senza JavaScript."
        column
      >
        <Topics
          headingId="sg-capire"
          title="Per capire il calcolo"
          topics={[
            {
              id: "sg-topic-1",
              summary: "Dal lordo al netto: i passaggi",
              body: <p>Dal lordo annuo si tolgono i contributi a tuo carico.</p>,
            },
            {
              id: "sg-topic-2",
              summary: "Differenze con la busta paga",
              body: <p>Il calcolo usa le regole generali.</p>,
            },
          ]}
        />
      </KitSpecimen>
    </KitProvider>
  );
}

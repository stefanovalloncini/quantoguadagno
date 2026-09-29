import { NextSteps } from "@/components/result/NextSteps.tsx";
import { ResultAnswer } from "@/components/result/ResultAnswer.tsx";
import { ResultFigure } from "@/components/result/ResultFigure.tsx";
import { KitProvider, KitSpecimen } from "./KitProvider.tsx";

export function AnswerSpecimens() {
  return (
    <KitProvider>
      <KitSpecimen
        label="Cifra con più righe"
        note="ResultFigure con subLines: ogni riga in più resta attaccata alla cifra."
        column
      >
        <div className="sg-figure-stage">
          <ResultFigure
            headingId="sg-esito-1"
            label="Importo mensile lordo"
            state="ready"
            size="small"
            value="1.353,36 €"
            basis="nei primi 5 mesi"
            sub={
              <>
                Circa <strong>1.300 €</strong> netti al mese, se nel 2026 non hai altri redditi
              </>
            }
            subLines={[
              <>
                Per 52 settimane, circa 12 mesi: in tutto <strong>15.169,22 €</strong> lordi
              </>,
            ]}
          />
        </div>
      </KitSpecimen>
      <KitSpecimen
        label="Risposta al posto della cifra"
        note="ResultAnswer quando il risultato non è un numero: la risposta in parole, la regola e il valore inserito. NextSteps elenca cosa controllare."
        column
      >
        <div className="sg-figure-stage qg-result">
          <ResultAnswer
            headingId="sg-esito-2"
            answer="La NASpI non spetta"
            lines={[
              "Servono almeno 13 settimane di contributi negli ultimi 4 anni: ne hai indicate 10.",
            ]}
          />
          <NextSteps
            headingId="sg-esito-3"
            title="Cosa controllare"
            steps={[
              {
                id: "estratto",
                text: "Le settimane nel tuo estratto conto contributivo, nell’area personale del sito dell’INPS.",
              },
              {
                id: "periodo",
                text: "Il periodo: contano le settimane dei 4 anni prima della fine del lavoro.",
              },
            ]}
          />
        </div>
      </KitSpecimen>
    </KitProvider>
  );
}

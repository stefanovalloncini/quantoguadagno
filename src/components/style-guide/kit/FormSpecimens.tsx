import { Checkbox } from "@/components/form/Checkbox.tsx";
import { DetailsGroup, DetailsGroupList } from "@/components/form/DetailsGroup.tsx";
import { ErrorSummary } from "@/components/form/ErrorSummary.tsx";
import { Field, FieldAlt } from "@/components/form/Field.tsx";
import { MoneyInput } from "@/components/form/MoneyInput.tsx";
import { NumberInput } from "@/components/form/NumberInput.tsx";
import { RadioGroup } from "@/components/form/RadioGroup.tsx";
import { Select } from "@/components/form/Select.tsx";
import { TextInput } from "@/components/form/TextInput.tsx";
import { KitProvider, KitSpecimen, noop } from "./KitProvider.tsx";

const REGIONS = [
  { value: "lazio", label: "Lazio" },
  { value: "lombardia", label: "Lombardia" },
  { value: "veneto", label: "Veneto" },
] as const;

const YEARS = ["2024", "2025", "2026"].map((year) => ({ value: year, label: year }));
const FREQUENCIES = ["12", "13", "14", "15", "16"].map((count) => ({ value: count, label: count }));

export function FormSpecimens() {
  return (
    <KitProvider>
      <KitSpecimen
        label="Campo di testo"
        note="Field: etichetta, suggerimento, controllo, riga dopo il campo e domanda alternativa. Tutti i controlli sono alti 48 px, con un bordo di 2 px su fondo bianco e il testo alla misura del corpo."
        narrow
      >
        <Field
          id="sg-nome"
          label="Nome del contratto"
          hint="Come compare nella lettera di assunzione."
        >
          {(control) => <TextInput {...control} value="Commercio" onValueChange={noop} />}
        </Field>
      </KitSpecimen>
      <KitSpecimen
        label="Importo in euro"
        note="MoneyInput: accetta 35000, 35.000, 35k, 35 mila; all’uscita dal campo scrive 35.000, oppure 932,50 se ci sono i centesimi. Il simbolo segue la lingua."
        narrow
      >
        <Field
          id="sg-ral"
          label="Stipendio lordo annuo (RAL)"
          labelSuffix="in euro"
          hint="Lo trovi nel contratto o nella lettera di assunzione."
          after="2.692,31 € lordi al mese su 13 mensilità"
          alt={
            <FieldAlt>
              Conosci solo il netto? <a href="#sg-ral">Calcola il lordo dal netto</a>
            </FieldAlt>
          }
        >
          {(control) => <MoneyInput {...control} value="35.000" onValueChange={noop} />}
        </Field>
      </KitSpecimen>
      <KitSpecimen
        label="Mentre scrivi"
        note="La riga dopo il campo mostra come leggiamo il valore."
        narrow
      >
        <Field
          id="sg-ral-typing"
          label="Stipendio lordo annuo (RAL)"
          after="Letto come 35.000,00 €"
        >
          {(control) => <MoneyInput {...control} value="35k" onValueChange={noop} />}
        </Field>
      </KitSpecimen>
      <KitSpecimen
        label="Nota, non errore"
        note="Riga in inchiostro dopo una pausa di 700 ms o all’uscita dal campo, solo tra 500 e 6.000 €."
        narrow
      >
        <Field
          id="sg-ral-note"
          label="Stipendio lordo annuo (RAL)"
          afterTone="note"
          after="È un importo mensile? La RAL è il lordo di un anno: 2.500 € al mese su 13 mensilità sono 32.500 €."
        >
          {(control) => <MoneyInput {...control} value="2.500" onValueChange={noop} />}
        </Field>
      </KitSpecimen>
      <KitSpecimen
        label="Errore"
        note="Compare all’uscita dal campo, dopo il clic che l’ha causata; sparisce appena il valore è corretto."
        narrow
      >
        <Field
          id="sg-ral-error"
          label="Stipendio lordo annuo (RAL)"
          hint="Lo trovi nel contratto o nella lettera di assunzione."
          error="Inserisci la RAL in cifre, per esempio 35.000"
        >
          {(control) => <MoneyInput {...control} value="trentacinquemila" onValueChange={noop} />}
        </Field>
      </KitSpecimen>
      <KitSpecimen label="Percentuale e numero intero" note="NumberInput, larghezza corta." narrow>
        <Field
          id="sg-aliquota"
          label="Aliquota dell’addizionale comunale"
          labelSuffix="in percentuale"
          after="Letto come 0,80%, senza soglia di esenzione."
        >
          {(control) => (
            <NumberInput {...control} kind="percent" value="0,8" onValueChange={noop} />
          )}
        </Field>
        <Field id="sg-figli" label="Figli a carico dai 21 ai 29 anni">
          {(control) => <NumberInput {...control} kind="integer" value="2" onValueChange={noop} />}
        </Field>
      </KitSpecimen>
      <KitSpecimen label="Menu" note="Select nativo, freccia disegnata." narrow>
        <Field id="sg-regione" label="Regione di residenza">
          {(control) => (
            <Select {...control} value="lombardia" options={REGIONS} onValueChange={noop} />
          )}
        </Field>
      </KitSpecimen>
      <KitSpecimen
        label="Scelte"
        note="RadioGroup: in linea per poche opzioni brevi (segmented, fill), in colonna per etichette lunghe (stacked)."
        column
      >
        <div className="sg-narrow">
          <RadioGroup
            idPrefix="sg-kit-anno"
            name="sg-anno-kit"
            legend="Anno fiscale"
            value="2026"
            options={YEARS}
            onValueChange={noop}
          />
        </div>
        <RadioGroup
          idPrefix="sg-mensilita"
          name="sg-mensilita-kit"
          legend="Mensilità"
          hint="Quante buste paga ricevi in un anno."
          layout="fill"
          value="13"
          options={FREQUENCIES}
          onValueChange={noop}
        />
        <RadioGroup
          idPrefix="sg-contratto"
          name="sg-contratto-kit"
          legend="Tipo di contratto"
          hint="Tempo determinato e indeterminato danno lo stesso netto."
          layout="stacked"
          value="indeterminato"
          options={[
            { value: "indeterminato", label: "Tempo indeterminato" },
            { value: "determinato", label: "Tempo determinato" },
            { value: "apprendistato", label: "Apprendistato" },
          ]}
          onValueChange={noop}
        />
      </KitSpecimen>
      <KitSpecimen
        label="Casella"
        note="Checkbox con suggerimento; spuntata, mostra i campi che le servono."
        column
      >
        <Checkbox
          id="sg-coniuge"
          label="Coniuge a carico"
          hint="Se nel 2026 il coniuge ha un reddito fino a 2.840,51 €."
          checked={false}
          onCheckedChange={noop}
        />
        <Checkbox
          id="sg-madre"
          label="Esonero contributivo per madri lavoratrici"
          hint="Contributi INPS ridotti per le madri con più figli, se hai i requisiti."
          checked
          onCheckedChange={noop}
        >
          <Field id="sg-madre-figli" label="Numero di figli">
            {(control) => (
              <NumberInput {...control} kind="integer" value="3" onValueChange={noop} />
            )}
          </Field>
        </Checkbox>
      </KitSpecimen>
      <KitSpecimen
        label="Gruppi di opzioni"
        note="DetailsGroup: il riassunto dice i valori in uso, in grassetto quando non sono quelli di partenza."
        column
      >
        <DetailsGroupList>
          <DetailsGroup
            id="sg-gruppo-1"
            title="Contratto e INPS"
            recap="Tempo indeterminato, settore privato, contributi 9,19%"
            open={false}
            onOpenChange={noop}
          >
            {null}
          </DetailsGroup>
          <DetailsGroup
            id="sg-gruppo-2"
            title="Spese detraibili"
            recap="Spese sanitarie 1.200,00 €"
            recapSet
            open
            onOpenChange={noop}
          >
            <Field
              id="sg-sanitarie"
              label="Spese sanitarie"
              labelSuffix="in euro"
              hint="Detraibili al 19% per la parte oltre 129,11 €."
              after="Detrazione di 203,47 €: il 19% di 1.070,89 €."
            >
              {(control) => <MoneyInput {...control} value="1.200" onValueChange={noop} />}
            </Field>
          </DetailsGroup>
        </DetailsGroupList>
      </KitSpecimen>
      <KitSpecimen
        label="Riepilogo degli errori"
        note="ErrorSummary: solo nei moduli che si inviano davvero, mai nei calcolatori."
        column
      >
        <ErrorSummary
          title="C’è un problema"
          focusOnShow={false}
          errors={[
            { fieldId: "sg-ral-error", message: "Inserisci la RAL in cifre, per esempio 35.000" },
            { fieldId: "sg-aliquota", message: "Scrivi una percentuale da 0% a 1,5%" },
          ]}
        />
      </KitSpecimen>
    </KitProvider>
  );
}

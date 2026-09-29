import { ComuneField } from "@/components/form/ComuneField.tsx";
import { Field, FieldAlt } from "@/components/form/Field.tsx";
import { TextInput } from "@/components/form/TextInput.tsx";
import bolzanoFile from "@/data/comuni/bolzano.json";
import lombardiaFile from "@/data/comuni/lombardia.json";
import type { Comune, RegionComuni } from "@/data/index.ts";
import type { ComuneLookup, ComuniList } from "@/islands/home/useComune.ts";
import { KitProvider, KitSpecimen, noop } from "./KitProvider.tsx";

const lombardia = lombardiaFile as RegionComuni;
const bolzano = bolzanoFile as RegionComuni;

function comune(file: RegionComuni, id: string): Comune {
  const found = file.comuni.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`Missing comune ${id}`);
  return found;
}

const LOMBARDIA: ComuniList = { status: "ready", comuni: lombardia.comuni };
const BOLZANO: ComuniList = { status: "ready", comuni: bolzano.comuni };
const NONE: ComuneLookup = { status: "none" };
const MILANO: ComuneLookup = { status: "ready", id: "F205", comune: comune(lombardia, "F205") };
const CORTACCIA: ComuneLookup = { status: "ready", id: "D048", comune: comune(bolzano, "D048") };

const shared = {
  year: 2026,
  manualRate: "0,8",
  onLoad: noop,
  onSelect: noop,
  onSwitchRegion: noop,
  onManualChange: noop,
  onManualRateChange: noop,
} as const;

export function ComuneSpecimens() {
  return (
    <KitProvider>
      <KitSpecimen
        label="Nessun comune scelto"
        note="Stato di partenza: usiamo l’aliquota predefinita e lo diciamo in una nota in inchiostro."
        narrow
      >
        <ComuneField
          id="sg-comune-1"
          region="lombardia"
          list={LOMBARDIA}
          selection={NONE}
          manual={false}
          {...shared}
        />
      </KitSpecimen>
      <KitSpecimen
        label="Elenco aperto"
        note="Combobox ARIA con elenco: frecce per muoversi, Invio per scegliere, Esc per chiudere. L’opzione attiva è in blu; ogni comune mostra la sua aliquota. Lo stato per i lettori di schermo è fuori dall’elenco."
        narrow
      >
        <ComuneField
          id="sg-comune-2"
          region="lombardia"
          list={LOMBARDIA}
          selection={NONE}
          manual={false}
          defaultQuery="Mil"
          defaultListOpen
          {...shared}
        />
      </KitSpecimen>
      <KitSpecimen
        label="Comune scelto"
        note="Aliquota, esenzione, anno della regola e fonte."
        narrow
      >
        <ComuneField
          id="sg-comune-3"
          region="lombardia"
          list={LOMBARDIA}
          selection={MILANO}
          manual={false}
          {...shared}
        />
      </KitSpecimen>
      <KitSpecimen label="Comune senza addizionale" narrow>
        <ComuneField
          id="sg-comune-4"
          region="bolzano"
          list={BOLZANO}
          selection={CORTACCIA}
          manual={false}
          {...shared}
        />
      </KitSpecimen>
      <KitSpecimen
        label="Nessun comune con quel nome nella regione"
        note="Cerchiamo il nome nelle altre regioni con un indice caricato solo in questo caso."
        narrow
      >
        <ComuneField
          id="sg-comune-5"
          region="lombardia"
          list={LOMBARDIA}
          selection={NONE}
          manual={false}
          defaultQuery="Piacenza"
          {...shared}
        />
      </KitSpecimen>
      <KitSpecimen
        label="Trovato in un’altra regione"
        note="Il pulsante cambia regione e comune insieme, poi riporta il fuoco nel campo."
        narrow
      >
        <Field
          id="sg-comune-6"
          label="Comune di residenza"
          hint="Scrivi almeno 2 lettere: cerchiamo tra i comuni della Lombardia."
          afterTone="note"
          after={
            <>
              Piacenza è in Emilia-Romagna, non in Lombardia.
              <button className="qg-link-button qg-field__choice" type="button">
                Scegli Piacenza (PC), in Emilia-Romagna
              </button>
            </>
          }
          alt={
            <FieldAlt>
              Non trovi il comune?{" "}
              <button className="qg-link-button" type="button">
                Inserisci l’aliquota a mano
              </button>
            </FieldAlt>
          }
        >
          {(control) => (
            <TextInput {...control} icon="search" value="Piacenza" onValueChange={noop} />
          )}
        </Field>
      </KitSpecimen>
      <KitSpecimen
        label="Aliquota a mano"
        note="Si apre solo dal pulsante; il ritorno alla ricerca è sempre a un passo."
        narrow
      >
        <ComuneField
          id="sg-comune-7"
          rateId="sg-aliquota-7"
          region="lombardia"
          list={LOMBARDIA}
          selection={NONE}
          manual
          {...shared}
        />
      </KitSpecimen>
      <KitSpecimen label="Elenco non caricato" narrow>
        <ComuneField
          id="sg-comune-8"
          region="lombardia"
          list={{ status: "error" }}
          selection={NONE}
          manual={false}
          defaultQuery="Mi"
          {...shared}
        />
      </KitSpecimen>
    </KitProvider>
  );
}

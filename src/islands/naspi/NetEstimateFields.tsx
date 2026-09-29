import { ComuneField } from "@/components/form/ComuneField.tsx";
import { Field } from "@/components/form/Field.tsx";
import { MoneyInput } from "@/components/form/MoneyInput.tsx";
import { useRegionText } from "@/components/form/regionText.ts";
import { Select } from "@/components/form/Select.tsx";
import type { RegionCode, SupportedYear } from "@/data/index.ts";
import { useT } from "@/i18n/react.tsx";
import type { ComuneLookup, ComuniList } from "@/islands/home/useComune.ts";
import type { NetInputs } from "./netInputs.ts";
import { IDS } from "./viewIds.ts";

export interface NetEstimateFieldsProps {
  readonly year: SupportedYear;
  readonly inputs: NetInputs;
  readonly list: ComuniList;
  readonly selection: ComuneLookup;
  readonly otherIncomeError: string | undefined;
  readonly municipalRateError: string | undefined;
  readonly onOtherIncomeChange: (text: string) => void;
  readonly onRegionChange: (region: RegionCode) => void;
  readonly onComuneChange: (id: string | null) => void;
  readonly onSwitchRegion: (region: RegionCode, id: string) => void;
  readonly onManualChange: (manual: boolean) => void;
  readonly onManualRateChange: (text: string) => void;
  readonly onLoadComuni: () => void;
  readonly onFieldFocus: () => void;
  readonly onFieldBlur: (field: "otherIncome" | "municipalRate") => void;
}

export default function NetEstimateFields({
  year,
  inputs,
  list,
  selection,
  otherIncomeError,
  municipalRateError,
  onOtherIncomeChange,
  onRegionChange,
  onComuneChange,
  onSwitchRegion,
  onManualChange,
  onManualRateChange,
  onLoadComuni,
  onFieldFocus,
  onFieldBlur,
}: NetEstimateFieldsProps) {
  const t = useT();
  const regions = useRegionText();
  return (
    <>
      <Field
        id={IDS.otherIncome}
        label={t("naspi.other.label", { year })}
        labelSuffix={t("field.unit.euro")}
        hint={t("naspi.other.hint", { year })}
        error={otherIncomeError}
      >
        {(control) => (
          <MoneyInput
            {...control}
            name="otherIncome"
            value={inputs.otherIncome}
            onValueChange={onOtherIncomeChange}
            onFocus={onFieldFocus}
            onBlur={() => {
              onFieldBlur("otherIncome");
            }}
          />
        )}
      </Field>
      <Field id={IDS.region} label={t("naspi.region.label")}>
        {(control) => (
          <Select<RegionCode>
            {...control}
            name="region"
            value={inputs.region}
            options={regions.options}
            onValueChange={onRegionChange}
          />
        )}
      </Field>
      <ComuneField
        id={IDS.comune}
        rateId={IDS.municipalRate}
        region={inputs.region}
        year={year}
        list={list}
        selection={selection}
        manual={inputs.manual}
        manualRate={inputs.municipalRate}
        manualRateError={municipalRateError}
        onLoad={onLoadComuni}
        onSelect={onComuneChange}
        onSwitchRegion={onSwitchRegion}
        onManualChange={onManualChange}
        onManualRateChange={onManualRateChange}
        onManualRateFocus={onFieldFocus}
        onManualRateBlur={() => {
          onFieldBlur("municipalRate");
        }}
      />
    </>
  );
}

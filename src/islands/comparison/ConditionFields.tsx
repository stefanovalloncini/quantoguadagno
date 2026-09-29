import type { ReactNode } from "react";
import { Checkbox } from "@/components/form/Checkbox.tsx";
import { ComuneField, type ComuneFieldProps } from "@/components/form/ComuneField.tsx";
import { Field } from "@/components/form/Field.tsx";
import { NumberInput } from "@/components/form/NumberInput.tsx";
import { RadioGroup } from "@/components/form/RadioGroup.tsx";
import { useRegionText } from "@/components/form/regionText.ts";
import { Select } from "@/components/form/Select.tsx";
import { SUPPORTED_YEARS, type RegionCode } from "@/data/index.ts";
import { resolveInpsRates } from "@/domain/inpsRates.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import { useRichT, useT } from "@/i18n/react.tsx";
import { employeeLimits } from "@/islands/home/employeeLimits.ts";
import { Amount, type ViewFormat } from "@/islands/home/viewFormat.tsx";
import {
  CONTRACT_TYPES,
  type ComparisonField,
  type ConditionsState,
  type ConditionUpdate,
} from "./state.ts";
import { IDS, type ConditionGroup } from "./viewIds.ts";

export type ComuneControls = Omit<
  ComuneFieldProps,
  "id" | "rateId" | "region" | "year" | "manualRate" | "defaultQuery" | "defaultListOpen"
>;

type CountField = "childrenOver21" | "otherDependents";

export interface ConditionFieldsProps {
  readonly group: ConditionGroup;
  readonly conditions: ConditionsState;
  readonly errors: Readonly<Record<CountField, string | undefined>>;
  readonly comune: ComuneControls;
  readonly f: ViewFormat;
  readonly update: ConditionUpdate;
  readonly onFieldFocus: () => void;
  readonly onFieldBlur: (field: ComparisonField) => void;
}

export default function ConditionFields({
  group,
  conditions,
  errors,
  comune,
  f,
  update,
  onFieldFocus,
  onFieldBlur,
}: ConditionFieldsProps) {
  const t = useT();
  const rt = useRichT();
  const regions = useRegionText();
  const config = getTaxConfig(conditions.year);
  const limits = employeeLimits(conditions.year);
  const from2025 = limits.dependantRulesFrom2025 ? "yes" : "no";

  const countField = (field: CountField, id: string, label: string, hint: ReactNode) => (
    <Field id={id} label={label} hint={hint} error={errors[field]}>
      {(control) => (
        <NumberInput
          {...control}
          kind="integer"
          name={field}
          value={conditions[field]}
          onValueChange={(value) => {
            update(field, value);
          }}
          onFocus={onFieldFocus}
          onBlur={() => {
            onFieldBlur(field);
          }}
        />
      )}
    </Field>
  );

  if (group === "residence") {
    return (
      <>
        <RadioGroup
          idPrefix={IDS.year}
          name="year"
          legend={t("comparison.year.legend")}
          value={String(conditions.year)}
          options={SUPPORTED_YEARS.map((year) => ({ value: String(year), label: String(year) }))}
          onValueChange={(value) => {
            const year = SUPPORTED_YEARS.find((option) => String(option) === value);
            if (year !== undefined) update("year", year);
          }}
        />
        <Field id={IDS.region} label={t("comparison.region.label")}>
          {(control) => (
            <Select<RegionCode>
              {...control}
              name="region"
              value={conditions.region}
              options={regions.options}
              onValueChange={(value) => {
                update("region", value);
              }}
            />
          )}
        </Field>
        <ComuneField
          {...comune}
          id={IDS.comune}
          rateId={IDS.municipalRate}
          region={conditions.region}
          year={conditions.year}
          manualRate={conditions.municipalRate}
        />
      </>
    );
  }

  if (group === "contract") {
    const base = resolveInpsRates(config.inps, {
      contractType: "indeterminato",
      companySize: "small",
      isPublicEmployee: false,
    }).standardRate;
    const apprenticeRate = config.inps.apprenticeshipRate ?? base;
    const publicRate = config.inps.publicEmployeeRate ?? base;
    return (
      <>
        <RadioGroup
          idPrefix={IDS.contract}
          name="contractType"
          legend={t("comparison.contract.legend")}
          hint={rt("comparison.contract.hint", {
            article: f.article(apprenticeRate),
            rate: <Amount>{f.percent(apprenticeRate)}</Amount>,
          })}
          layout="stacked"
          value={conditions.contractType}
          options={CONTRACT_TYPES.map((type) => ({
            value: type,
            label: t("comparison.contract.option", { type }),
          }))}
          onValueChange={(value) => {
            update("contractType", value);
          }}
        />
        <Checkbox
          id={IDS.isPublicEmployee}
          name="isPublicEmployee"
          label={t("comparison.public.label")}
          hint={rt("comparison.public.hint", {
            article: f.article(publicRate),
            publicRate: <Amount>{f.percent(publicRate)}</Amount>,
            baseArticle: f.article(base),
            rate: <Amount>{f.percent(base)}</Amount>,
          })}
          checked={conditions.isPublicEmployee}
          onCheckedChange={(checked) => {
            update("isPublicEmployee", checked);
          }}
        />
        <Checkbox
          id={IDS.insuredBefore1996}
          name="insuredBefore1996"
          label={t("comparison.before1996.label")}
          hint={rt("comparison.before1996.hint", {
            massimale: <Amount>{f.whole(limits.massimale)}</Amount>,
          })}
          checked={conditions.insuredBefore1996}
          onCheckedChange={(checked) => {
            update("insuredBefore1996", checked);
          }}
        />
      </>
    );
  }

  return (
    <>
      <Checkbox
        id={IDS.hasSpouse}
        name="hasSpouse"
        label={t("comparison.spouse.label")}
        hint={rt("comparison.spouse.hint", {
          year: conditions.year,
          limit: <Amount>{f.money(limits.spouseIncomeLimit)}</Amount>,
        })}
        checked={conditions.hasSpouse}
        onCheckedChange={(checked) => {
          update("hasSpouse", checked);
        }}
      />
      {countField(
        "childrenOver21",
        IDS.childrenOver21,
        t("comparison.children.label", { from2025 }),
        rt("comparison.children.hint", {
          from2025,
          young: <Amount>{f.whole(config.dependentsDeduction.dependentIncomeLimitYoung)}</Amount>,
          limit: <Amount>{f.money(limits.spouseIncomeLimit)}</Amount>,
        }),
      )}
      {countField(
        "otherDependents",
        IDS.otherDependents,
        t("comparison.others.label"),
        t("comparison.others.hint", { from2025 }),
      )}
    </>
  );
}

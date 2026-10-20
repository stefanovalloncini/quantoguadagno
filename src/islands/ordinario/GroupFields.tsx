import { Checkbox } from "@/components/form/Checkbox.tsx";
import { ComuneField, type ComuneFieldProps } from "@/components/form/ComuneField.tsx";
import { Field } from "@/components/form/Field.tsx";
import { MoneyInput } from "@/components/form/MoneyInput.tsx";
import { NumberInput } from "@/components/form/NumberInput.tsx";
import { Select } from "@/components/form/Select.tsx";
import { ACTIVITY_CATEGORIES, type ActivityCategory } from "@/data/forfettarioActivities.ts";
import type { Gestion } from "@/domain/inpsGestioni.ts";
import { getAutonomiConfig, getTaxConfig } from "@/domain/taxConfig.ts";
import { useT } from "@/i18n/react.tsx";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";
import {
  GESTIONS,
  hasMinimum,
  type OrdinarioErrors,
  type OrdinarioField,
  type OrdinarioState,
} from "./state.ts";
import type { OrdinarioUpdate } from "./useOrdinarioController.ts";
import { IDS, type ViewGroup } from "./viewIds.ts";

export interface GroupFieldsProps {
  readonly group: ViewGroup;
  readonly comune: ComuneFieldProps;
  readonly state: OrdinarioState;
  readonly errors: OrdinarioErrors;
  readonly f: ViewFormat;
  readonly update: OrdinarioUpdate;
  readonly onFieldFocus: () => void;
  readonly onFieldBlur: (field: OrdinarioField) => void;
}

function PrevidenzaFields({
  state,
  errors,
  f,
  update,
  onFieldFocus,
  onFieldBlur,
}: GroupFieldsProps) {
  const t = useT();
  const errorText = (field: OrdinarioField): string | undefined => {
    const error = errors[field];
    return error === undefined ? undefined : t(error.key, { ...error.values });
  };
  const reducedRate = getAutonomiConfig(state.year).gestionSeparata.reducedRate;
  return (
    <>
      <Field
        id={IDS.gestion}
        label={t("ordinario.gestion.label")}
        hint={t("ordinario.gestion.hint")}
      >
        {(control) => (
          <Select<Gestion>
            {...control}
            name="gestion"
            value={state.gestion}
            options={GESTIONS.map((gestion) => ({
              value: gestion,
              label: t(`ordinario.gestion.${gestion}`),
            }))}
            onValueChange={(value) => {
              update("gestion", value);
            }}
          />
        )}
      </Field>
      {state.gestion === "gestione-separata" && (
        <Checkbox
          id={IDS.hasOtherPension}
          name="hasOtherPension"
          label={t("ordinario.otherPension.label")}
          hint={t("ordinario.otherPension.hint", {
            article: f.article(reducedRate),
            rate: f.percent(reducedRate),
          })}
          checked={state.hasOtherPension}
          onCheckedChange={(checked) => {
            update("hasOtherPension", checked);
          }}
        />
      )}
      {hasMinimum(state.gestion) && (
        <Field
          id={IDS.months}
          label={t("ordinario.months.label")}
          hint={t("ordinario.months.hint")}
          error={errorText("months")}
        >
          {(control) => (
            <NumberInput
              {...control}
              kind="integer"
              name="months"
              value={state.months}
              onValueChange={(value) => {
                update("months", value);
              }}
              onFocus={onFieldFocus}
              onBlur={() => {
                onFieldBlur("months");
              }}
            />
          )}
        </Field>
      )}
      {state.gestion === "cassa-professionale" && (
        <Field
          id={IDS.cassaAmount}
          label={t("ordinario.cassa.label")}
          labelSuffix={t("field.unit.euro")}
          hint={t("ordinario.cassa.hint")}
          error={errorText("cassaAmount")}
        >
          {(control) => (
            <MoneyInput
              {...control}
              name="cassaAmount"
              value={state.cassaAmount}
              onValueChange={(value) => {
                update("cassaAmount", value);
              }}
              onFocus={onFieldFocus}
              onBlur={() => {
                onFieldBlur("cassaAmount");
              }}
            />
          )}
        </Field>
      )}
    </>
  );
}

function ForfettarioFields({ state, f, update }: GroupFieldsProps) {
  const t = useT();
  const cfg = getTaxConfig(state.year).forfettario;
  return (
    <>
      <Field
        id={IDS.activity}
        label={t("ordinario.activity.label")}
        hint={t("ordinario.activity.hint")}
      >
        {(control) => (
          <Select<ActivityCategory>
            {...control}
            name="activity"
            value={state.activity}
            options={ACTIVITY_CATEGORIES.map((activity) => ({
              value: activity,
              label: t(`ordinario.activity.${activity}`),
            }))}
            onValueChange={(value) => {
              update("activity", value);
            }}
          />
        )}
      </Field>
      <Checkbox
        id={IDS.startup}
        name="startup"
        label={t("ordinario.startup.label", { years: cfg.startupYears })}
        hint={t("ordinario.startup.hint", {
          startupArticle: f.article(cfg.startupRate),
          startupRate: f.percent(cfg.startupRate),
          standardArticle: f.article(cfg.standardRate),
          standardRate: f.percent(cfg.standardRate),
        })}
        checked={state.startup}
        onCheckedChange={(checked) => {
          update("startup", checked);
        }}
      />
    </>
  );
}

export default function GroupFields(props: GroupFieldsProps) {
  switch (props.group) {
    case "comune":
      return <ComuneField {...props.comune} />;
    case "previdenza":
      return <PrevidenzaFields {...props} />;
    case "forfettario":
      return <ForfettarioFields {...props} />;
  }
}

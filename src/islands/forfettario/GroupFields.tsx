import { Checkbox } from "@/components/form/Checkbox.tsx";
import { Field } from "@/components/form/Field.tsx";
import { MoneyInput } from "@/components/form/MoneyInput.tsx";
import { NumberInput } from "@/components/form/NumberInput.tsx";
import { Select } from "@/components/form/Select.tsx";
import { getTaxConfig } from "@/domain/index.ts";
import { useT } from "@/i18n/react.tsx";
import type { ForfettarioController } from "./useForfettarioController.ts";
import { GESTION_OPTIONS, type ForfettarioErrorValue, type ForfettarioState } from "./state.ts";
import { IDS, type ViewGroup } from "./viewIds.ts";

export interface GroupFieldsProps {
  readonly group: ViewGroup;
  readonly controller: ForfettarioController;
  readonly errors: Readonly<Partial<Record<keyof ForfettarioState, ForfettarioErrorValue>>>;
  readonly isArtigianiOrCommercianti: boolean;
  readonly isCassaManual: boolean;
  readonly onFieldFocus: () => void;
  readonly onFieldBlur: (field: string) => void;
}

export default function GroupFields({
  group,
  controller,
  errors,
  isArtigianiOrCommercianti,
  isCassaManual,
  onFieldFocus,
  onFieldBlur,
}: GroupFieldsProps) {
  const t = useT();
  const { state } = controller;
  const cfg = getTaxConfig(state.year).forfettario;
  const errorText = (field: keyof ForfettarioState): string | undefined => {
    const error = errors[field];
    if (error === undefined) return undefined;
    return typeof error === "string" ? t(error) : t(error.key, { ...error.values });
  };

  switch (group) {
    case "previdenza":
      return (
        <>
          <Field
            id={IDS.gestion}
            label={t("forfettario.form.gestion")}
            hint={t("forfettario.form.gestion.hint")}
            error={errorText("gestion")}
          >
            {(control) => (
              <Select
                {...control}
                name="gestion"
                value={state.gestion}
                options={GESTION_OPTIONS.map((gestion) => ({
                  value: gestion,
                  label: t(`forfettario.form.gestion.${gestion}`),
                }))}
                onValueChange={controller.updateGestion}
              />
            )}
          </Field>
          {!isArtigianiOrCommercianti && !isCassaManual && (
            <Checkbox
              id={IDS.hasOtherPension}
              name="hasOtherPension"
              label={t("forfettario.form.hasOtherPension")}
              hint={t("forfettario.form.hasOtherPension.hint")}
              checked={state.hasOtherPension}
              onCheckedChange={controller.updateHasOtherPension}
            />
          )}
          {isArtigianiOrCommercianti && (
            <>
              <Field
                id={IDS.mesiAttivita}
                label={t("forfettario.form.mesiAttivita")}
                hint={t("forfettario.form.mesiAttivita.hint")}
                error={errorText("mesiAttivita")}
              >
                {(control) => (
                  <NumberInput
                    {...control}
                    kind="integer"
                    name="mesiAttivita"
                    value={String(state.mesiAttivita)}
                    onValueChange={(value) => {
                      const parsed = Number.parseInt(value, 10);
                      controller.updateMesiAttivita(Number.isFinite(parsed) ? parsed : 0);
                    }}
                    onFocus={onFieldFocus}
                    onBlur={() => {
                      onFieldBlur("mesiAttivita");
                    }}
                  />
                )}
              </Field>
              <Checkbox
                id={IDS.isAnte1996}
                name="isAnte1996"
                label={t("forfettario.form.isAnte1996")}
                hint={t("forfettario.form.isAnte1996.hint")}
                checked={state.isAnte1996}
                onCheckedChange={controller.updateIsAnte1996}
              />
              <Checkbox
                id={IDS.forfettarioDiscount35}
                name="forfettarioDiscount35"
                label={t("forfettario.form.forfettarioDiscount35")}
                hint={t("forfettario.form.forfettarioDiscount35.hint")}
                checked={state.forfettarioDiscount35}
                onCheckedChange={controller.updateForfettarioDiscount35}
              />
              <Checkbox
                id={IDS.newRegistrantDiscount50}
                name="newRegistrantDiscount50"
                label={t("forfettario.form.newRegistrantDiscount50")}
                hint={t("forfettario.form.newRegistrantDiscount50.hint")}
                checked={state.newRegistrantDiscount50}
                onCheckedChange={controller.updateNewRegistrantDiscount50}
              />
            </>
          )}
          {isCassaManual && (
            <Field
              id={IDS.cassaManualAmount}
              label={t("forfettario.form.cassaManualAmount")}
              labelSuffix={t("field.unit.euro")}
              hint={t("forfettario.form.cassaManualAmount.hint")}
              error={errorText("cassaManualAmount")}
            >
              {(control) => (
                <MoneyInput
                  {...control}
                  name="cassaManualAmount"
                  value={state.cassaManualAmount}
                  onValueChange={controller.updateCassaManualAmount}
                  onFocus={onFieldFocus}
                  onBlur={() => {
                    onFieldBlur("cassaManualAmount");
                  }}
                />
              )}
            </Field>
          )}
        </>
      );
    case "regime":
      return (
        <>
          <Field
            id={IDS.yearsOfActivity}
            label={t("forfettario.form.yearsOfActivity")}
            hint={t("forfettario.form.yearsOfActivity.hint")}
            error={errorText("yearsOfActivity")}
          >
            {(control) => (
              <NumberInput
                {...control}
                kind="integer"
                name="yearsOfActivity"
                value={String(state.yearsOfActivity)}
                onValueChange={(value) => {
                  const parsed = Number.parseInt(value, 10);
                  controller.updateYearsOfActivity(Number.isFinite(parsed) ? parsed : 0);
                }}
                onFocus={onFieldFocus}
                onBlur={() => {
                  onFieldBlur("yearsOfActivity");
                }}
              />
            )}
          </Field>
          <Field
            id={IDS.employeeCosts}
            label={t("forfettario.form.employeeCosts")}
            labelSuffix={t("field.unit.euro")}
            hint={t("forfettario.form.employeeCosts.hint", {
              limit: cfg.maxEmployeeCosts,
            })}
            error={errorText("employeeCosts")}
          >
            {(control) => (
              <MoneyInput
                {...control}
                name="employeeCosts"
                value={state.employeeCosts}
                onValueChange={controller.updateEmployeeCosts}
                onFocus={onFieldFocus}
                onBlur={() => {
                  onFieldBlur("employeeCosts");
                }}
              />
            )}
          </Field>
        </>
      );
    case "dipendente":
      return (
        <Checkbox
          id={IDS.isConcurrentFullTimeEmployee}
          name="isConcurrentFullTimeEmployee"
          label={t("forfettario.form.isConcurrentFullTimeEmployee")}
          hint={t("forfettario.form.isConcurrentFullTimeEmployee.hint")}
          checked={state.isConcurrentFullTimeEmployee}
          onCheckedChange={controller.updateIsConcurrentFullTimeEmployee}
        >
          <Field
            id={IDS.concurrentEmployeeRal}
            label={t("forfettario.form.concurrentEmployeeRal")}
            labelSuffix={t("field.unit.euro")}
            hint={t("forfettario.form.concurrentEmployeeRal.hint")}
            error={errorText("concurrentEmployeeRal")}
          >
            {(control) => (
              <MoneyInput
                {...control}
                name="concurrentEmployeeRal"
                value={state.concurrentEmployeeRal}
                onValueChange={controller.updateConcurrentEmployeeRal}
                onFocus={onFieldFocus}
                onBlur={() => {
                  onFieldBlur("concurrentEmployeeRal");
                }}
              />
            )}
          </Field>
        </Checkbox>
      );
  }
}

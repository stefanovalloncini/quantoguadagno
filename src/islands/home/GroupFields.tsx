import type { ReactNode } from "react";
import { Checkbox } from "@/components/form/Checkbox.tsx";
import { Field } from "@/components/form/Field.tsx";
import { MoneyInput } from "@/components/form/MoneyInput.tsx";
import { NumberInput, type NumberKind } from "@/components/form/NumberInput.tsx";
import { RadioGroup } from "@/components/form/RadioGroup.tsx";
import { Select } from "@/components/form/Select.tsx";
import { CCNL_PRESET_IDS, CCNL_PRESETS, type CcnlId } from "@/data/index.ts";
import { resolveInpsRates } from "@/domain/inpsRates.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import { parseMoneyInput } from "@/i18n/numbers.ts";
import { useRichT, useT } from "@/i18n/react.tsx";
import type { EmployeeHints, EmployeeNotices } from "./derive.ts";
import {
  CONTRACT_TYPES,
  MEAL_VOUCHER_TYPES,
  type EmployeeErrors,
  type EmployeeState,
  type EmployeeTextField,
} from "./state.ts";
import type { EmployeeUpdate } from "./useEmployeeController.ts";
import { Amount, type ViewFormat } from "./viewFormat.tsx";
import { IDS, type ViewGroup } from "./viewIds.ts";

export interface GroupFieldsProps {
  readonly group: ViewGroup;
  readonly state: EmployeeState;
  readonly hints: EmployeeHints;
  readonly notices: EmployeeNotices | null;
  readonly errors: EmployeeErrors;
  readonly f: ViewFormat;
  readonly update: EmployeeUpdate;
  readonly onFieldFocus: () => void;
  readonly onFieldBlur: (field: EmployeeTextField) => void;
}

const NO_CCNL = "none";
type CcnlChoice = CcnlId | typeof NO_CCNL;

function ccnlSelectKey(id: CcnlId): string {
  return id.replaceAll("-", "_");
}

export default function GroupFields({
  group,
  state,
  hints,
  notices,
  errors,
  f,
  update,
  onFieldFocus,
  onFieldBlur,
}: GroupFieldsProps) {
  const t = useT();
  const rt = useRichT();
  const { limits } = hints;
  const config = getTaxConfig(state.year);
  const errorText = (field: EmployeeTextField): string | undefined => {
    const error = errors[field];
    return error === undefined ? undefined : t(error.key, { ...error.values });
  };

  const textField = (
    field: EmployeeTextField,
    id: string,
    label: string,
    kind: NumberKind | "money",
    options: {
      readonly hint?: ReactNode;
      readonly after?: ReactNode;
      readonly suffix?: string;
    } = {},
  ) => (
    <Field
      id={id}
      label={label}
      {...(kind === "money" ? { labelSuffix: t("field.unit.euro") } : {})}
      {...(kind === "percent" ? { labelSuffix: t("field.unit.percent") } : {})}
      {...(options.hint === undefined ? {} : { hint: options.hint })}
      {...(options.after === undefined ? {} : { after: options.after })}
      error={errorText(field)}
    >
      {(control) =>
        kind === "money" ? (
          <MoneyInput
            {...control}
            name={field}
            value={state[field]}
            onValueChange={(value) => {
              update(field, value);
            }}
            onFocus={onFieldFocus}
            onBlur={() => {
              onFieldBlur(field);
            }}
          />
        ) : (
          <NumberInput
            {...control}
            kind={kind}
            name={field}
            value={state[field]}
            onValueChange={(value) => {
              update(field, value);
            }}
            onFocus={onFieldFocus}
            onBlur={() => {
              onFieldBlur(field);
            }}
          />
        )
      }
    </Field>
  );

  const baseRates = resolveInpsRates(config.inps, {
    contractType: "indeterminato",
    companySize: "small",
    isPublicEmployee: false,
  });
  const apprenticeRate = config.inps.apprenticeshipRate ?? baseRates.standardRate;
  const publicRate = config.inps.publicEmployeeRate ?? baseRates.standardRate;
  const largeRate = baseRates.standardRate + (config.inps.largeCompanyAdditionalRate ?? 0);
  const impatriati = config.regimeImpatriati;
  const medical = parseMoneyInput(state.medicalExpenses, f.locale) ?? 0;
  const medicalBase = Math.max(0, medical - limits.medicalExpenseFloor);
  const welfare = parseMoneyInput(state.welfare, f.locale) ?? 0;

  const ccnlOptions = [
    { value: NO_CCNL, label: t("employee.ccnl.none") },
    ...CCNL_PRESET_IDS.map((id) => ({
      value: id,
      label: t("employee.ccnl.option", {
        ccnl: ccnlSelectKey(id),
        count: CCNL_PRESETS[id].paymentFrequency,
      }),
    })),
  ] satisfies readonly { value: CcnlChoice; label: string }[];

  const madre = notices?.madreLavoratrice ?? null;

  switch (group) {
    case "contract":
      return (
        <>
          <RadioGroup
            idPrefix={IDS.contract}
            name="contractType"
            legend={t("employee.contract.legend")}
            hint={rt("employee.contract.hint", {
              article: f.article(apprenticeRate),
              rate: <Amount>{f.percent(apprenticeRate)}</Amount>,
            })}
            layout="stacked"
            value={state.contractType}
            options={CONTRACT_TYPES.map((type) => ({
              value: type,
              label: t(`employee.contract.${type}`),
            }))}
            onValueChange={(value) => {
              update("contractType", value);
            }}
          />
          <Field id={IDS.ccnl} label={t("employee.ccnl.label")} hint={t("employee.ccnl.hint")}>
            {(control) => (
              <Select<CcnlChoice>
                {...control}
                name="ccnl"
                value={state.ccnl ?? NO_CCNL}
                options={ccnlOptions}
                onValueChange={(value) => {
                  update("ccnl", value === NO_CCNL ? null : value);
                }}
              />
            )}
          </Field>
          <Checkbox
            id={IDS.isPublicEmployee}
            name="isPublicEmployee"
            label={t("employee.public.label")}
            hint={rt("employee.public.hint", {
              article: f.article(publicRate),
              publicRate: <Amount>{f.percent(publicRate)}</Amount>,
              baseArticle: f.article(baseRates.standardRate),
              rate: <Amount>{f.percent(baseRates.standardRate)}</Amount>,
            })}
            checked={state.isPublicEmployee}
            onCheckedChange={(checked) => {
              update("isPublicEmployee", checked);
            }}
          />
          <Checkbox
            id={IDS.companySize}
            name="companySize"
            label={t("employee.large.label")}
            hint={rt("employee.large.hint", {
              article: f.article(largeRate),
              rate: <Amount>{f.percent(largeRate)}</Amount>,
            })}
            checked={state.companySize === "large"}
            onCheckedChange={(checked) => {
              update("companySize", checked ? "large" : "small");
            }}
          />
          <Checkbox
            id={IDS.insuredBefore1996}
            name="insuredBefore1996"
            label={t("employee.before1996.label")}
            hint={rt("employee.before1996.hint", {
              massimale: <Amount>{f.whole(limits.massimale)}</Amount>,
            })}
            checked={state.insuredBefore1996}
            onCheckedChange={(checked) => {
              update("insuredBefore1996", checked);
            }}
          />
          <Checkbox
            id={IDS.inpsOverride}
            name="inpsOverride"
            label={t("employee.override.label")}
            hint={t("employee.override.hint")}
            checked={state.inpsOverride}
            onCheckedChange={(checked) => {
              update("inpsOverride", checked);
            }}
          >
            {textField(
              "inpsEmployeeRate",
              IDS.inpsEmployeeRate,
              t("employee.override.employee"),
              "percent",
            )}
            {textField(
              "inpsEmployerRate",
              IDS.inpsEmployerRate,
              t("employee.override.employer"),
              "percent",
              {
                hint: t("employee.override.employerHint"),
              },
            )}
          </Checkbox>
        </>
      );
    case "dependents":
      return (
        <>
          <Checkbox
            id={IDS.hasSpouse}
            name="hasSpouse"
            label={t("employee.spouse.label")}
            hint={rt("employee.spouse.hint", {
              year: state.year,
              limit: <Amount>{f.money(limits.spouseIncomeLimit)}</Amount>,
            })}
            checked={state.hasSpouse}
            onCheckedChange={(checked) => {
              update("hasSpouse", checked);
            }}
          />
          {textField(
            "childrenOver21",
            IDS.childrenOver21,
            t("employee.children.label", {
              from2025: limits.dependantRulesFrom2025 ? "yes" : "no",
            }),
            "integer",
            {
              hint: rt("employee.children.hint", {
                from2025: limits.dependantRulesFrom2025 ? "yes" : "no",
                young: (
                  <Amount>{f.whole(config.dependentsDeduction.dependentIncomeLimitYoung)}</Amount>
                ),
                limit: <Amount>{f.money(limits.spouseIncomeLimit)}</Amount>,
              }),
            },
          )}
          {textField(
            "otherDependents",
            IDS.otherDependents,
            t("employee.others.label"),
            "integer",
            {
              hint: t("employee.others.hint", {
                from2025: limits.dependantRulesFrom2025 ? "yes" : "no",
              }),
            },
          )}
        </>
      );
    case "expenses":
      return (
        <>
          {textField(
            "mortgageInterest",
            IDS.mortgageInterest,
            t("employee.mortgage.label"),
            "money",
            {
              hint: rt("employee.mortgage.hint", {
                max: <Amount>{f.whole(limits.maxMortgageInterest)}</Amount>,
              }),
            },
          )}
          {textField("medicalExpenses", IDS.medicalExpenses, t("employee.medical.label"), "money", {
            hint: rt("employee.medical.hint", {
              floor: <Amount>{f.money(limits.medicalExpenseFloor)}</Amount>,
            }),
            ...(medicalBase > 0 && errors.medicalExpenses === undefined
              ? {
                  after: rt("employee.medical.after", {
                    amount: <Amount>{f.money(Math.round(medicalBase * 19) / 100)}</Amount>,
                    base: <Amount>{f.money(medicalBase)}</Amount>,
                  }),
                }
              : {}),
          })}
          {textField(
            "otherDeductions",
            IDS.otherDeductions,
            t("employee.otherExpenses.label"),
            "money",
            {
              hint: t("employee.otherExpenses.hint"),
            },
          )}
          {textField("pensionFund", IDS.pensionFund, t("employee.pensionFund.label"), "money", {
            hint: rt("employee.pensionFund.hint", {
              max: <Amount>{f.money(limits.maxPensionFund)}</Amount>,
            }),
          })}
        </>
      );
    case "special":
      return (
        <>
          <Checkbox
            id={IDS.impatriati}
            name="impatriati"
            label={t("employee.impatriati.label")}
            hint={rt("employee.impatriati.hint", {
              standard: <Amount>{f.percent(impatriati.standardExemptionRate)}</Amount>,
              withChildren: <Amount>{f.percent(impatriati.withMinorChildrenExemptionRate)}</Amount>,
            })}
            checked={state.impatriati}
            onCheckedChange={(checked) => {
              update("impatriati", checked);
            }}
          >
            <Checkbox
              id={IDS.impatriatiMinorChildren}
              name="impatriatiMinorChildren"
              label={t("employee.impatriatiChildren.label")}
              hint={rt("employee.impatriatiChildren.hint", {
                article: f.article(impatriati.withMinorChildrenExemptionRate),
                rate: <Amount>{f.percent(impatriati.withMinorChildrenExemptionRate)}</Amount>,
              })}
              checked={state.impatriatiMinorChildren}
              onCheckedChange={(checked) => {
                update("impatriatiMinorChildren", checked);
              }}
            />
          </Checkbox>
          <Checkbox
            id={IDS.madreLavoratrice}
            name="madreLavoratrice"
            label={t("employee.madre.label")}
            hint={t("employee.madre.hint")}
            checked={state.madreLavoratrice}
            onCheckedChange={(checked) => {
              update("madreLavoratrice", checked);
            }}
          >
            {textField(
              "madreChildren",
              IDS.madreChildren,
              t("employee.madreChildren.label"),
              "integer",
            )}
            {textField(
              "madreYoungestChildAge",
              IDS.madreYoungestChildAge,
              t("employee.madreAge.label"),
              "integer",
            )}
            {madre !== null && (
              <p className="qg-field__after qg-field__after--note" role="status">
                {madre.eligible
                  ? rt("employee.madre.eligible", {
                      max: <Amount>{f.whole(config.madreLavoratrice.maxAnnualExemption)}</Amount>,
                    })
                  : madre.notEnoughChildren
                    ? t("employee.madre.notEnoughChildren", {
                        min: config.madreLavoratrice.minChildrenFullExemption,
                      })
                    : t("employee.madre.childTooOld", {
                        age: config.madreLavoratrice.maxYoungestChildAge,
                      })}
              </p>
            )}
          </Checkbox>
        </>
      );
    case "benefits":
      return (
        <>
          {textField(
            "mealVoucherValue",
            IDS.mealVoucherValue,
            t("employee.vouchers.label"),
            "money",
            {
              hint: rt("employee.vouchers.hint", {
                year: state.year,
                electronic: <Amount>{f.money(limits.mealVouchers.electronic)}</Amount>,
                paper: <Amount>{f.money(limits.mealVouchers.paper)}</Amount>,
              }),
            },
          )}
          {textField(
            "mealVoucherDays",
            IDS.mealVoucherDays,
            t("employee.voucherDays.label"),
            "integer",
            {
              hint: t("employee.voucherDays.hint"),
            },
          )}
          <RadioGroup
            idPrefix={IDS.mealVoucherType}
            name="mealVoucherType"
            legend={t("employee.voucherType.legend")}
            value={state.mealVoucherType}
            options={MEAL_VOUCHER_TYPES.map((type) => ({
              value: type,
              label: t(`employee.voucherType.${type}`),
            }))}
            onValueChange={(value) => {
              update("mealVoucherType", value);
            }}
          />
          {textField("welfare", IDS.welfare, t("employee.welfare.label"), "money", {
            hint: rt("employee.welfare.hint", {
              general: <Amount>{f.whole(limits.welfare.general)}</Amount>,
              children: <Amount>{f.whole(limits.welfare.withChildren)}</Amount>,
            }),
          })}
          {welfare > 0 && (
            <Checkbox
              id={IDS.welfareHasChildren}
              name="welfareHasChildren"
              label={t("employee.welfareChildren.label")}
              hint={rt("employee.welfareChildren.hint", {
                amount: <Amount>{f.whole(limits.welfare.withChildren)}</Amount>,
              })}
              checked={state.welfareHasChildren}
              onCheckedChange={(checked) => {
                update("welfareHasChildren", checked);
              }}
            />
          )}
          {textField("healthInsurance", IDS.healthInsurance, t("employee.health.label"), "money", {
            hint: rt("employee.health.hint", {
              amount: <Amount>{f.money(limits.healthInsurance)}</Amount>,
            }),
          })}
          {textField("carValue", IDS.carValue, t("employee.car.label"), "money", {
            hint: t("employee.car.hint"),
          })}
          {textField("premio", IDS.premio, t("employee.premio.label"), "money", {
            hint: rt("employee.premio.hint", {
              year: state.year,
              article: f.article(limits.premio.rate),
              rate: <Amount>{f.percent(limits.premio.rate)}</Amount>,
              max: <Amount>{f.whole(limits.premio.maxAmount)}</Amount>,
            }),
          })}
        </>
      );
  }
}

import { Checkbox } from "@/components/form/Checkbox.tsx";
import { DetailsGroup, DetailsGroupList } from "@/components/form/DetailsGroup.tsx";
import { ErrorSummary, type ErrorSummaryItem } from "@/components/form/ErrorSummary.tsx";
import { Field, type AfterTone } from "@/components/form/Field.tsx";
import { MoneyInput } from "@/components/form/MoneyInput.tsx";
import { NumberInput } from "@/components/form/NumberInput.tsx";
import { RadioGroup } from "@/components/form/RadioGroup.tsx";
import type { RegionText } from "@/components/form/regionText.ts";
import { Select } from "@/components/form/Select.tsx";
import { TextInput } from "@/components/form/TextInput.tsx";
import type { RegionCode } from "@/data/index.ts";
import type { ContractType, DependentsInput } from "@/domain/index.ts";
import { useT } from "@/i18n/react.tsx";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";
import { ENTRY_YEARS, type DraftField, type DraftTexts } from "./draft.ts";
import type { SalaryHistoryDraft } from "./state.ts";
import { IDS } from "./viewIds.ts";

export const CONTRACT_TYPES: readonly ContractType[] = [
  "indeterminato",
  "determinato",
  "apprendistato",
];
const PAYMENT_FREQUENCIES = [12, 13, 14, 15, 16] as const;

export type EntryGroup = "net" | "family";

export interface EntryFormProps {
  readonly draft: SalaryHistoryDraft;
  readonly texts: DraftTexts;
  readonly errors: Readonly<Partial<Record<DraftField, string>>>;
  readonly summary: readonly ErrorSummaryItem[];
  readonly attempt: number;
  readonly grossAfter: { readonly text: string; readonly tone: AfterTone } | null;
  readonly open: Readonly<Record<EntryGroup, boolean>>;
  readonly f: ViewFormat;
  readonly regions: RegionText;
  readonly onOpenChange: (group: EntryGroup, open: boolean) => void;
  readonly onYearChange: (year: number) => void;
  readonly onTextChange: (field: keyof DraftTexts, text: string) => void;
  readonly onNoteChange: (note: string) => void;
  readonly onSettingsChange: (patch: {
    readonly contractType?: ContractType;
    readonly paymentFrequency?: 12 | 13 | 14 | 15 | 16;
    readonly regionCode?: RegionCode;
  }) => void;
  readonly onLargeCompanyChange: (large: boolean) => void;
  readonly onDependentsChange: (patch: Partial<DependentsInput>) => void;
  readonly onFieldFocus: () => void;
  readonly onFieldBlur: (field: DraftField) => void;
  readonly onGrossFocus: () => void;
  readonly onGrossBlur: () => void;
  readonly onSubmit: () => void;
}

function familyRecap(draft: SalaryHistoryDraft, t: ReturnType<typeof useT>, f: ViewFormat) {
  const dependents = draft.settings.dependents;
  if (dependents === undefined) return { text: t("history.family.none"), set: false };
  const parts = [
    ...(dependents.hasSpouse ? [t("history.family.part.spouse")] : []),
    ...(dependents.childrenOver21 > 0
      ? [t("history.family.part.children", { count: dependents.childrenOver21 })]
      : []),
    ...(dependents.otherDependents > 0
      ? [t("history.family.part.others", { count: dependents.otherDependents })]
      : []),
  ];
  if (parts.length === 0) return { text: t("history.family.none"), set: false };
  return { text: f.capitalize(f.list(parts)), set: true };
}

export function EntryForm({
  draft,
  texts,
  errors,
  summary,
  attempt,
  grossAfter,
  open,
  f,
  regions,
  onOpenChange,
  onYearChange,
  onTextChange,
  onNoteChange,
  onSettingsChange,
  onLargeCompanyChange,
  onDependentsChange,
  onFieldFocus,
  onFieldBlur,
  onGrossFocus,
  onGrossBlur,
  onSubmit,
}: EntryFormProps) {
  const t = useT();
  const settings = draft.settings;
  const family = familyRecap(draft, t, f);
  const netRecap = t("history.net.recap", {
    contract: t(`history.contract.${settings.contractType}`),
    count: settings.paymentFrequency,
    region: regions.name(settings.regionCode),
    rate: f.percent(settings.municipalTaxRate),
  });

  return (
    <form
      className="qg-form"
      id={IDS.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      aria-labelledby={IDS.formHeading}
    >
      <h2 className="qg-heading" id={IDS.formHeading} tabIndex={-1}>
        {t("history.form.title")}
      </h2>
      <ErrorSummary key={attempt} title={t("history.form.errors")} errors={summary} />
      <Field id={IDS.year} label={t("history.form.year")} error={errors.year}>
        {(control) => (
          <Select<string>
            {...control}
            name="year"
            value={String(draft.year)}
            options={ENTRY_YEARS.map((year) => ({ value: String(year), label: String(year) }))}
            onValueChange={(value) => {
              onYearChange(Number(value));
            }}
          />
        )}
      </Field>
      <Field
        id={IDS.gross}
        label={t("history.form.gross")}
        labelSuffix={t("field.unit.euro")}
        hint={t("history.form.gross.hint")}
        error={errors.gross}
        {...(grossAfter === null ? {} : { after: grossAfter.text, afterTone: grossAfter.tone })}
      >
        {(control) => (
          <MoneyInput
            {...control}
            name="grossAnnual"
            value={texts.gross}
            onValueChange={(value) => {
              onTextChange("gross", value);
            }}
            onFocus={onGrossFocus}
            onBlur={onGrossBlur}
          />
        )}
      </Field>
      <Field id={IDS.note} label={t("history.form.note")} hint={t("history.form.note.hint")}>
        {(control) => (
          <TextInput
            {...control}
            name="note"
            value={draft.note}
            autoComplete="off"
            spellCheck
            onValueChange={onNoteChange}
          />
        )}
      </Field>
      <DetailsGroupList>
        <DetailsGroup
          id={IDS.netGroup}
          title={t("history.net.title")}
          recap={netRecap}
          open={open.net}
          onOpenChange={(next) => {
            onOpenChange("net", next);
          }}
        >
          <RadioGroup<ContractType>
            idPrefix={IDS.contract}
            name="contractType"
            legend={t("history.contract.legend")}
            layout="stacked"
            value={settings.contractType}
            options={CONTRACT_TYPES.map((type) => ({
              value: type,
              label: t(`history.contract.${type}`),
            }))}
            onValueChange={(contractType) => {
              onSettingsChange({ contractType });
            }}
          />
          <RadioGroup
            idPrefix={IDS.frequency}
            name="paymentFrequency"
            legend={t("history.frequency.legend")}
            hint={t("history.frequency.hint")}
            layout="fill"
            value={String(settings.paymentFrequency)}
            options={PAYMENT_FREQUENCIES.map((count) => ({
              value: String(count),
              label: String(count),
            }))}
            onValueChange={(value) => {
              const count = PAYMENT_FREQUENCIES.find((option) => String(option) === value);
              if (count !== undefined) onSettingsChange({ paymentFrequency: count });
            }}
          />
          <Field id={IDS.region} label={t("history.region.label")}>
            {(control) => (
              <Select<RegionCode>
                {...control}
                name="regionCode"
                value={settings.regionCode}
                options={regions.options}
                onValueChange={(regionCode) => {
                  onSettingsChange({ regionCode });
                }}
              />
            )}
          </Field>
          <Field
            id={IDS.municipal}
            label={t("history.municipal.label")}
            labelSuffix={t("field.unit.percent")}
            hint={t("history.municipal.hint")}
            error={errors.municipal}
          >
            {(control) => (
              <NumberInput
                {...control}
                kind="percent"
                name="municipalTaxRate"
                value={texts.municipal}
                onValueChange={(value) => {
                  onTextChange("municipal", value);
                }}
                onFocus={onFieldFocus}
                onBlur={() => {
                  onFieldBlur("municipal");
                }}
              />
            )}
          </Field>
          <Checkbox
            id={IDS.largeCompany}
            name="companySize"
            label={t("history.largeCompany.label")}
            checked={settings.companySize === "large"}
            onCheckedChange={onLargeCompanyChange}
          />
        </DetailsGroup>
        <DetailsGroup
          id={IDS.familyGroup}
          title={t("history.family.title")}
          recap={family.text}
          recapSet={family.set}
          open={open.family}
          onOpenChange={(next) => {
            onOpenChange("family", next);
          }}
        >
          <Checkbox
            id={IDS.spouse}
            name="hasSpouse"
            label={t("history.family.spouse")}
            checked={settings.dependents?.hasSpouse ?? false}
            onCheckedChange={(hasSpouse) => {
              onDependentsChange({ hasSpouse });
            }}
          />
          <Field
            id={IDS.children}
            label={t("history.family.children")}
            hint={t("history.family.children.hint")}
            error={errors.children}
          >
            {(control) => (
              <NumberInput
                {...control}
                kind="integer"
                name="childrenOver21"
                value={texts.children}
                onValueChange={(value) => {
                  onTextChange("children", value);
                }}
                onFocus={onFieldFocus}
                onBlur={() => {
                  onFieldBlur("children");
                }}
              />
            )}
          </Field>
          <Field id={IDS.others} label={t("history.family.others")} error={errors.others}>
            {(control) => (
              <NumberInput
                {...control}
                kind="integer"
                name="otherDependents"
                value={texts.others}
                onValueChange={(value) => {
                  onTextChange("others", value);
                }}
                onFocus={onFieldFocus}
                onBlur={() => {
                  onFieldBlur("others");
                }}
              />
            )}
          </Field>
        </DetailsGroup>
      </DetailsGroupList>
      <div className="qg-form__submit">
        <button className="qg-button" type="submit" id={IDS.submit}>
          {t("history.form.submit")}
        </button>
        <p className="qg-field__hint">{t("history.form.privacy")}</p>
      </div>
    </form>
  );
}

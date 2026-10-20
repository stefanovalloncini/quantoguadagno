import { Checkbox } from "@/components/form/Checkbox.tsx";
import { DetailsGroup, DetailsGroupList } from "@/components/form/DetailsGroup.tsx";
import { RadioGroup } from "@/components/form/RadioGroup.tsx";
import type { SupportedYear } from "@/data/index.ts";
import type { ContractType } from "@/domain/employerCostCalculations.ts";
import { resolveInpsRates } from "@/domain/inpsRates.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import { useRichT, useT, type TranslateFn } from "@/i18n/react.tsx";
import { CONTRACT_TYPES } from "@/islands/home/choices.ts";
import { contractAssumption } from "@/islands/home/contract.ts";
import { Amount, type ViewFormat } from "@/islands/home/viewFormat.tsx";
import type { InverseState } from "./state.ts";
import type { InverseUpdate } from "./useInverseController.ts";
import { IDS } from "./viewIds.ts";

type ContractFields = Pick<
  InverseState,
  "year" | "contractType" | "companySize" | "isPublicEmployee"
>;

function contractText(values: ContractFields, t: TranslateFn, f: ViewFormat): string {
  const facts = { ...values, taxYear: values.year, insuredBefore1996: false, inpsOverride: null };
  const rate = contractAssumption(facts).employeeInpsRate;
  return [
    t("inverse.part.contractType", { type: values.contractType }),
    t("inverse.part.sector", { public: values.isPublicEmployee ? "yes" : "no" }),
    ...(values.companySize === "large" ? [t("inverse.part.largeCompany")] : []),
    t("inverse.part.inpsRate", { rate: f.percent(rate) }),
  ].join(", ");
}

export function contractIsDefault(values: ContractFields): boolean {
  return (
    values.contractType === "indeterminato" &&
    values.companySize === "small" &&
    !values.isPublicEmployee
  );
}

function ratesFor(year: SupportedYear) {
  const config = getTaxConfig(year).inps;
  const base = resolveInpsRates(config, {
    contractType: "indeterminato",
    companySize: "small",
    isPublicEmployee: false,
  }).standardRate;
  return {
    base,
    apprentice: config.apprenticeshipRate ?? base,
    public: config.publicEmployeeRate ?? base,
    large: base + (config.largeCompanyAdditionalRate ?? 0),
  };
}

export interface ContractGroupProps {
  readonly state: InverseState;
  readonly open: boolean;
  readonly f: ViewFormat;
  readonly onOpenChange: (open: boolean) => void;
  readonly update: InverseUpdate;
}

export function ContractGroup({ state, open, f, onOpenChange, update }: ContractGroupProps) {
  const t = useT();
  const rt = useRichT();
  const rates = ratesFor(state.year);
  return (
    <DetailsGroupList>
      <DetailsGroup
        id={IDS.contractGroup}
        title={t("inverse.group.contract")}
        recap={contractText(state, t, f)}
        recapSet={!contractIsDefault(state)}
        open={open}
        onOpenChange={onOpenChange}
      >
        <RadioGroup<ContractType>
          idPrefix={IDS.contract}
          name="contractType"
          legend={t("inverse.contract.legend")}
          hint={rt("inverse.contract.hint", {
            article: f.article(rates.apprentice),
            rate: <Amount>{f.percent(rates.apprentice)}</Amount>,
          })}
          layout="stacked"
          value={state.contractType}
          options={CONTRACT_TYPES.map((type) => ({
            value: type,
            label: t(`inverse.contract.${type}`),
          }))}
          onValueChange={(value) => {
            update("contractType", value);
          }}
        />
        <Checkbox
          id={IDS.isPublicEmployee}
          name="isPublicEmployee"
          label={t("inverse.public.label")}
          hint={rt("inverse.public.hint", {
            article: f.article(rates.public),
            publicRate: <Amount>{f.percent(rates.public)}</Amount>,
            baseArticle: f.article(rates.base),
            rate: <Amount>{f.percent(rates.base)}</Amount>,
          })}
          checked={state.isPublicEmployee}
          onCheckedChange={(checked) => {
            update("isPublicEmployee", checked);
          }}
        />
        <Checkbox
          id={IDS.companySize}
          name="companySize"
          label={t("inverse.large.label")}
          hint={rt("inverse.large.hint", {
            article: f.article(rates.large),
            rate: <Amount>{f.percent(rates.large)}</Amount>,
          })}
          checked={state.companySize === "large"}
          onCheckedChange={(checked) => {
            update("companySize", checked ? "large" : "small");
          }}
        />
      </DetailsGroup>
    </DetailsGroupList>
  );
}

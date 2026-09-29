import type { ReactNode } from "react";
import { ClientSuspense } from "@/islands/runtime/ClientSuspense.tsx";
import { DetailsGroup, DetailsGroupList } from "@/components/form/DetailsGroup.tsx";
import { RadioGroup } from "@/components/form/RadioGroup.tsx";
import { useT } from "@/i18n/react.tsx";
import { preloadable } from "@/islands/runtime/preloadable.tsx";
import type { GroupFieldsProps } from "./GroupFields.tsx";
import type { GroupRecap } from "./summaries.ts";
import { PAYMENT_FREQUENCIES } from "./state.ts";
import { GROUP_IDS, IDS, VIEW_GROUPS, type ViewGroup } from "./viewIds.ts";

const groupFields = preloadable(() => import("./GroupFields.tsx"));

export const loadGroupFields = groupFields.load;

const GroupFields = groupFields.Component;

export interface ExtrasFieldsProps extends Omit<GroupFieldsProps, "group"> {
  readonly recaps: Readonly<Record<ViewGroup, GroupRecap>>;
  readonly open: Readonly<Record<ViewGroup, boolean>>;
  readonly comuneField: ReactNode;
  readonly onOpenChange: (group: ViewGroup, open: boolean) => void;
}

const GROUP_TITLES: Readonly<Record<ViewGroup, string>> = {
  contract: "employee.group.contract",
  dependents: "employee.group.dependents",
  expenses: "employee.group.expenses",
  special: "employee.group.special",
  benefits: "employee.group.benefits",
};

export function ExtrasFields({
  recaps,
  open,
  comuneField,
  onOpenChange,
  ...fields
}: ExtrasFieldsProps) {
  const t = useT();
  const { state, update } = fields;
  return (
    <>
      {comuneField}
      <RadioGroup
        idPrefix={IDS.frequency}
        name="paymentFrequency"
        legend={t("employee.frequency.legend")}
        hint={t("employee.frequency.hint")}
        layout="fill"
        value={String(state.paymentFrequency)}
        options={PAYMENT_FREQUENCIES.map((count) => ({
          value: String(count),
          label: String(count),
        }))}
        onValueChange={(value) => {
          const count = PAYMENT_FREQUENCIES.find((option) => String(option) === value);
          if (count !== undefined) update("paymentFrequency", count);
        }}
      />
      <section className="qg-section" aria-labelledby={IDS.extrasHeading}>
        <div className="qg-section__intro">
          <h2 className="qg-heading" id={IDS.extrasHeading}>
            {t("employee.extras.title")}
          </h2>
          <p className="qg-section__hint">{t("employee.extras.hint")}</p>
        </div>
        <DetailsGroupList>
          {VIEW_GROUPS.map((group) => (
            <DetailsGroup
              key={group}
              id={GROUP_IDS[group]}
              title={t(GROUP_TITLES[group])}
              recap={recaps[group].text}
              recapSet={recaps[group].set}
              open={open[group]}
              onOpenChange={(next) => {
                onOpenChange(group, next);
              }}
            >
              {open[group] && (
                <ClientSuspense fallback={null}>
                  <GroupFields group={group} {...fields} />
                </ClientSuspense>
              )}
            </DetailsGroup>
          ))}
        </DetailsGroupList>
      </section>
    </>
  );
}

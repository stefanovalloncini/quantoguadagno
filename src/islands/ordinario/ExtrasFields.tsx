import { DetailsGroup, DetailsGroupList } from "@/components/form/DetailsGroup.tsx";
import { useT } from "@/i18n/react.tsx";
import { ClientSuspense } from "@/islands/runtime/ClientSuspense.tsx";
import { preloadable } from "@/islands/runtime/preloadable.tsx";
import type { GroupFieldsProps } from "./GroupFields.tsx";
import type { GroupRecap } from "./recaps.ts";
import { GROUP_IDS, IDS, VIEW_GROUPS, type ViewGroup } from "./viewIds.ts";

const groupFields = preloadable<GroupFieldsProps>(() => import("./GroupFields.tsx"));

export const loadGroupFields = groupFields.load;

const GroupFields = groupFields.Component;

const GROUP_TITLES: Readonly<Record<ViewGroup, string>> = {
  comune: "ordinario.group.comune",
  previdenza: "ordinario.group.previdenza",
  forfettario: "ordinario.group.forfettario",
};

export interface ExtrasFieldsProps extends Omit<GroupFieldsProps, "group"> {
  readonly recaps: Readonly<Record<ViewGroup, GroupRecap>>;
  readonly open: Readonly<Record<ViewGroup, boolean>>;
  readonly onOpenChange: (group: ViewGroup, open: boolean) => void;
}

export function ExtrasFields({ recaps, open, onOpenChange, ...fields }: ExtrasFieldsProps) {
  const t = useT();
  return (
    <>
      <div className="qg-section__intro">
        <h2 className="qg-heading" id={IDS.extrasHeading}>
          {t("ordinario.extras.title")}
        </h2>
        <p className="qg-section__hint">{t("ordinario.extras.hint")}</p>
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
    </>
  );
}

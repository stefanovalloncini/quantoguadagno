import { useMemo } from "react";
import { REGION_CODES, type RegionCode } from "@/data/index.ts";
import { BCP47_TAG } from "@/i18n/locales.ts";
import { useLocale, useT } from "@/i18n/react.tsx";
import type { SelectOption } from "./Select.tsx";

export interface RegionText {
  readonly name: (region: RegionCode) => string;
  readonly within: (region: RegionCode) => string;
  readonly of: (region: RegionCode) => string;
  readonly options: readonly SelectOption<RegionCode>[];
}

export function regionSelectKey(region: RegionCode): string {
  return region.replaceAll("-", "_");
}

export function useRegionText(): RegionText {
  const t = useT();
  const locale = useLocale();
  return useMemo(() => {
    const name = (region: RegionCode) => t("region.name", { region: regionSelectKey(region) });
    const collator = new Intl.Collator(BCP47_TAG[locale]);
    const options = REGION_CODES.map((region) => ({
      value: region,
      label: t("region.option", { region: regionSelectKey(region), name: name(region) }),
    })).sort((a, b) => collator.compare(a.label, b.label));
    return {
      name,
      within: (region: RegionCode) => t("region.in", { region: regionSelectKey(region) }),
      of: (region: RegionCode) => t("region.of", { region: regionSelectKey(region) }),
      options,
    };
  }, [t, locale]);
}

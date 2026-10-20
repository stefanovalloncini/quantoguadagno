import { useMemo } from "react";
import { NoteLine } from "@/components/result/Assumptions.tsx";
import { verifiedLine } from "@/components/result/verifiedLine.ts";
import {
  countUnverified,
  isComuniDatasetVerified,
  type RegionCode,
  type SupportedYear,
} from "@/data/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import { useRichT, useT } from "@/i18n/react.tsx";
import type { ToolNamespace } from "./localTax.ts";

export const NET_PAY_PREFIXES: readonly string[] = ["irpef.", "inps.employee.", "deductions."];

export interface TrustScope {
  readonly prefixes: readonly string[];
  readonly region: RegionCode;
  readonly year: SupportedYear;
  readonly withComune: boolean;
}

export function valuesToVerify({ prefixes, region, year, withComune }: TrustScope): number {
  const unverified = countUnverified(year, [...prefixes, `regions.${region}`]);
  return unverified + (withComune && !isComuniDatasetVerified() ? 1 : 0);
}

export type TrustNamespace = ToolNamespace | "apprenticeship";

export interface TrustNoteProps {
  readonly ns: TrustNamespace;
  readonly locale: Locale;
  readonly scope: TrustScope;
}

export function TrustNote({ ns, locale, scope }: TrustNoteProps) {
  const t = useT();
  const rt = useRichT();
  const checked = useMemo(() => verifiedLine(locale), [locale]);
  const { prefixes, region, year, withComune } = scope;
  const pending = useMemo(
    () => valuesToVerify({ prefixes, region, year, withComune }),
    [prefixes, region, year, withComune],
  );
  return (
    <NoteLine term={t("result.estimate.term")}>
      {t(`${ns}.result.estimate`)}
      {checked !== null && (
        <>
          {" "}
          {rt(`${ns}.result.trust`, {
            checked: (
              <a href={checked.href}>
                {t(`${ns}.result.verified`, {
                  date: checked.date,
                  dateArticle: checked.dateArticle,
                })}
              </a>
            ),
            pending: pending > 0 ? "yes" : "no",
            count: pending,
          })}
        </>
      )}
    </NoteLine>
  );
}

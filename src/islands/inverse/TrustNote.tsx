import { useMemo } from "react";
import { NoteLine } from "@/components/result/Assumptions.tsx";
import {
  countUnverified,
  isComuniDatasetVerified,
  latestVerification,
  type RegionCode,
  type SupportedYear,
} from "@/data/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import { formatDate } from "@/i18n/numbers.ts";
import { useRichT, useT } from "@/i18n/react.tsx";
import { hrefFor } from "@/routePaths.ts";
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

function checkedOn(locale: Locale): { readonly date: string; readonly href: string } | null {
  const date = latestVerification();
  if (date === null) return null;
  return { date: formatDate(new Date(date), locale), href: hrefFor("sources", locale) };
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
  const checked = useMemo(() => checkedOn(locale), [locale]);
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
              <a href={checked.href}>{t(`${ns}.result.verified`, { date: checked.date })}</a>
            ),
            pending: pending > 0 ? "yes" : "no",
            count: pending,
          })}
        </>
      )}
    </NoteLine>
  );
}

import { formatMessage, type MessageValues } from "../format.ts";
import type { Locale } from "../locales.ts";

import { it as layoutIt } from "./layout/it.ts";
import { en as layoutEn } from "./layout/en.ts";
import { it as metaIt } from "./meta/it.ts";
import { en as metaEn } from "./meta/en.ts";
import { it as formIt } from "./form/it.ts";
import { en as formEn } from "./form/en.ts";
import { it as employeeIt } from "./employee/it.ts";
import { en as employeeEn } from "./employee/en.ts";
import { it as inverseIt } from "./inverse/it.ts";
import { en as inverseEn } from "./inverse/en.ts";
import { it as apprenticeshipIt } from "./apprenticeship/it.ts";
import { en as apprenticeshipEn } from "./apprenticeship/en.ts";
import { it as salaryHistoryIt } from "./salaryHistory/it.ts";
import { en as salaryHistoryEn } from "./salaryHistory/en.ts";
import { it as forfettarioIt } from "./forfettario/it.ts";
import { en as forfettarioEn } from "./forfettario/en.ts";
import { it as compoundInterestIt } from "./compoundInterest/it.ts";
import { en as compoundInterestEn } from "./compoundInterest/en.ts";
import { it as naspiIt } from "./naspi/it.ts";
import { en as naspiEn } from "./naspi/en.ts";
import { it as preavvisoIt } from "./preavviso/it.ts";
import { en as preavvisoEn } from "./preavviso/en.ts";
import { it as tredicesimaIt } from "./tredicesima/it.ts";
import { en as tredicesimaEn } from "./tredicesima/en.ts";
import { it as inflationIt } from "./inflation/it.ts";
import { en as inflationEn } from "./inflation/en.ts";
import { it as comparisonIt } from "./comparison/it.ts";
import { en as comparisonEn } from "./comparison/en.ts";
import { it as employerCostIt } from "./employerCost/it.ts";
import { en as employerCostEn } from "./employerCost/en.ts";
import { it as tfrIt } from "./tfr/it.ts";
import { en as tfrEn } from "./tfr/en.ts";
import { it as glossaryIt } from "./glossary/it.ts";
import { en as glossaryEn } from "./glossary/en.ts";
import { it as printPayslipIt } from "./printPayslip/it.ts";
import { en as printPayslipEn } from "./printPayslip/en.ts";
import { it as sourcesIt } from "./sources/it.ts";
import { en as sourcesEn } from "./sources/en.ts";
import { it as aboutIt } from "./about/it.ts";
import { en as aboutEn } from "./about/en.ts";
import { it as homeIt } from "./home/it.ts";
import { en as homeEn } from "./home/en.ts";

const CATALOGS = {
  layout: { it: layoutIt, en: layoutEn },
  meta: { it: metaIt, en: metaEn },
  form: { it: formIt, en: formEn },
  employee: { it: employeeIt, en: employeeEn },
  inverse: { it: inverseIt, en: inverseEn },
  apprenticeship: { it: apprenticeshipIt, en: apprenticeshipEn },
  salaryHistory: { it: salaryHistoryIt, en: salaryHistoryEn },
  forfettario: { it: forfettarioIt, en: forfettarioEn },
  compoundInterest: { it: compoundInterestIt, en: compoundInterestEn },
  naspi: { it: naspiIt, en: naspiEn },
  preavviso: { it: preavvisoIt, en: preavvisoEn },
  tredicesima: { it: tredicesimaIt, en: tredicesimaEn },
  inflation: { it: inflationIt, en: inflationEn },
  comparison: { it: comparisonIt, en: comparisonEn },
  employerCost: { it: employerCostIt, en: employerCostEn },
  tfr: { it: tfrIt, en: tfrEn },
  glossary: { it: glossaryIt, en: glossaryEn },
  printPayslip: { it: printPayslipIt, en: printPayslipEn },
  sources: { it: sourcesIt, en: sourcesEn },
  about: { it: aboutIt, en: aboutEn },
  home: { it: homeIt, en: homeEn },
} as const;

export type Namespace = keyof typeof CATALOGS;

export const NAMESPACES = Object.keys(CATALOGS) as Namespace[];

type CatalogOf<N extends Namespace> = (typeof CATALOGS)[N]["it"];
type KeyOf<N extends Namespace> = keyof CatalogOf<N> & string;

export function getMessages(
  locale: Locale,
  namespaces: readonly Namespace[],
): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const namespace of namespaces) {
    Object.assign(merged, CATALOGS[namespace][locale]);
  }
  return merged;
}

export function getT<N extends Namespace>(
  locale: Locale,
  namespace: N,
): (key: KeyOf<N>, values?: MessageValues) => string {
  const catalog: Record<string, string> = CATALOGS[namespace][locale];
  return (key, values) => {
    const source = catalog[key];
    if (source === undefined) {
      throw new Error(`Unknown message key "${key}" in namespace "${namespace}"`);
    }
    return formatMessage(source, locale, values);
  };
}

import { Topics } from "@/components/result/Topics.tsx";
import type { SupportedYear } from "@/data/index.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import { useT } from "@/i18n/react.tsx";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";
import { IDS } from "./viewIds.ts";

export interface OrdinarioTopicsProps {
  readonly year: SupportedYear;
  readonly f: ViewFormat;
}

export function OrdinarioTopics({ year, f }: OrdinarioTopicsProps) {
  const t = useT();
  const deduction = getTaxConfig(year).selfEmployedDeduction;
  const [first, second, last] = deduction.thresholds;
  const { above, upTo, amount } = deduction.midBracketBonus;
  return (
    <Topics
      headingId={IDS.topicsHeading}
      title={t("ordinario.topics.title")}
      topics={[
        {
          id: "saldo-acconti",
          summary: t("ordinario.topic.payments"),
          body: (
            <>
              <p>{t("ordinario.topic.payments.when")}</p>
              <p>{t("ordinario.topic.payments.advance")}</p>
              <p>{t("ordinario.topic.payments.withholding")}</p>
              <p>{t("ordinario.topic.payments.firstYear")}</p>
              <p>{t("ordinario.topic.payments.others")}</p>
            </>
          ),
        },
        {
          id: "detrazione",
          summary: t("ordinario.topic.deduction"),
          body: (
            <>
              <p>
                {t("ordinario.topic.deduction.amounts", {
                  base: f.whole(deduction.baseDeduction),
                  first: f.whole(first),
                  fixed: f.whole(deduction.midBracketFixed),
                  second: f.whole(second),
                  last: f.whole(last),
                  bonus: f.whole(amount),
                  above: f.whole(above),
                  upTo: f.whole(upTo),
                })}
              </p>
              <p>{t("ordinario.topic.deduction.limits")}</p>
            </>
          ),
        },
        {
          id: "fuori-dal-calcolo",
          summary: t("ordinario.topic.scope"),
          body: (
            <>
              <p>{t("ordinario.topic.scope.income")}</p>
              <p>{t("ordinario.topic.scope.missing")}</p>
            </>
          ),
        },
      ]}
    />
  );
}

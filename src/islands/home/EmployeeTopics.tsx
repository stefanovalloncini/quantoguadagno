import { Topics } from "@/components/result/Topics.tsx";
import { LATEST_SUPPORTED_YEAR, SUPPORTED_YEARS } from "@/data/index.ts";
import { useLocale, useT } from "@/i18n/react.tsx";
import { hrefFor } from "@/routePaths.ts";
import { IDS } from "./viewIds.ts";

// The "Per capire il calcolo" band of the home page. It needs nothing from the calculator, so
// the page renders it on the server, after the bands that do.
export function EmployeeTopics() {
  const t = useT();
  const locale = useLocale();
  return (
    <Topics
      headingId={IDS.topicsHeading}
      title={t("employee.topics.title")}
      topics={[
        {
          id: "passaggi",
          summary: t("employee.topic.steps"),
          body: (
            <>
              <p>{t("employee.topic.steps.body")}</p>
              <p>
                <a className="qg-topic__link" href={hrefFor("method", locale)}>
                  {t("employee.topic.steps.link")}
                </a>
              </p>
            </>
          ),
        },
        {
          id: "scaglioni",
          summary: t("employee.topic.brackets", {
            first: SUPPORTED_YEARS[0] ?? LATEST_SUPPORTED_YEAR,
            last: SUPPORTED_YEARS.at(-1) ?? LATEST_SUPPORTED_YEAR,
          }),
          body: <p>{t("employee.topic.brackets.body")}</p>,
        },
        {
          id: "cuneo",
          summary: t("employee.topic.wedge"),
          body: <p>{t("employee.topic.wedge.body")}</p>,
        },
        {
          id: "addizionali",
          summary: t("employee.topic.surcharges"),
          body: <p>{t("employee.topic.surcharges.body")}</p>,
        },
        {
          id: "busta-paga",
          summary: t("employee.topic.payslip"),
          body: <p>{t("employee.topic.payslip.body")}</p>,
        },
      ]}
    />
  );
}

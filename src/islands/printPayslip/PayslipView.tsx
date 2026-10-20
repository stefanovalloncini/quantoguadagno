import { verifiedLine } from "@/components/result/verifiedLine.ts";
import { dateArticle } from "@/i18n/articles.ts";
import { useMemo } from "react";
import { Icon } from "@/components/icons/Icon.tsx";
import { useRegionText } from "@/components/form/regionText.ts";
import { formatDate } from "@/i18n/numbers.ts";
import { useT } from "@/i18n/react.tsx";
import type { EmployeeErrors } from "@/islands/home/state.ts";
import { valuesToVerify } from "@/islands/home/trust.ts";
import { employeeToQuery } from "@/islands/home/url.ts";
import { useViewFormat } from "@/islands/home/viewFormat.tsx";
import { hrefFor, pathFor, SITE_ORIGIN } from "@/routePaths.ts";
import { PayslipSheet } from "./PayslipSheet.tsx";
import { usePrintPayslipController } from "./usePrintPayslipController.ts";

const SITE_HOST = new URL(SITE_ORIGIN).host;

function todayAsUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function printPage(): void {
  window.print();
}

function InvalidLink({
  errors,
  backHref,
}: {
  readonly errors: EmployeeErrors;
  readonly backHref: string;
}) {
  const t = useT();
  const entries = Object.entries(errors);
  return (
    <div className="qg-notice qg-notice--error" role="alert" aria-labelledby="stampa-errore">
      <div className="qg-notice__head">
        <Icon name="alert" size="lg" />
        <h2 className="qg-notice__title" id="stampa-errore">
          {t("print.invalid.title")}
        </h2>
      </div>
      <div className="qg-notice__body">
        <p>{t("print.invalid.body")}</p>
        <ul className="qg-payslip__problems" role="list">
          {entries.map(([field, error]) => (
            <li key={field}>
              {t("print.invalid.item", {
                field: t("print.field", { field }),
                message: t(error.key, { ...error.values }),
              })}
            </li>
          ))}
        </ul>
        <p>
          <a className="qg-notice__link" href={backHref}>
            {t("print.invalid.back")}
          </a>
        </p>
      </div>
    </div>
  );
}

export function PayslipView() {
  const t = useT();
  const f = useViewFormat();
  const regions = useRegionText();
  const { state, errors, result, derived, comune } = usePrintPayslipController();
  const query = employeeToQuery(state, f.locale);
  const backHref = hrefFor("home", f.locale, query);
  const loading = state.comune !== null && comune.status === "loading";
  const created = useMemo(() => {
    const today = todayAsUtc();
    return { date: formatDate(today, f.locale), dateArticle: dateArticle(today) };
  }, [f.locale]);
  const checked = useMemo(() => verifiedLine(f.locale), [f.locale]);
  const pending = useMemo(() => (result === null ? 0 : valuesToVerify(result.values)), [result]);
  const ready = !loading && result !== null && derived !== null;

  return (
    <div className="qg-payslip-view">
      <div className="qg-wrap">
        <div className="qg-toolbar">
          <div className="qg-toolbar__start">
            <a className="qg-back" href={backHref}>
              <Icon name="chevronBack" />
              {t("print.back")}
            </a>
            <h1 className="qg-title">{t("print.title")}</h1>
            <p className="qg-toolbar__note">{t("print.note")}</p>
          </div>
          {ready && (
            <button className="qg-button" type="button" onClick={printPage}>
              <Icon name="print" />
              {t("print.button")}
            </button>
          )}
        </div>
        {loading ? (
          <p className="qg-payslip__loading" role="status">
            {t("print.loading")}
          </p>
        ) : ready ? (
          <PayslipSheet
            result={result}
            summary={derived.summary}
            comune={comune}
            created={created}
            checked={checked === null ? null : { ...checked, pending }}
            site={SITE_HOST}
            sourcesText={`${SITE_HOST}${pathFor("sources", f.locale)}`}
            recalculate={{
              href: backHref,
              text: `${SITE_HOST}${backHref}`,
            }}
            regions={regions}
            f={f}
          />
        ) : (
          <InvalidLink errors={errors} backHref={backHref} />
        )}
      </div>
    </div>
  );
}

import { I18nProvider } from "@/i18n/react.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";
import { SalaryHistoryView } from "@/islands/salaryHistory/SalaryHistoryView.tsx";

export default function SalaryHistory({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <SalaryHistoryView />
    </I18nProvider>
  );
}

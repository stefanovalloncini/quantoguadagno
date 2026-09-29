import { I18nProvider } from "@/i18n/react.tsx";
import { EmployerCostView } from "@/islands/employerCost/EmployerCostView.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";

export default function EmployerCostCalculator({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <EmployerCostView />
    </I18nProvider>
  );
}

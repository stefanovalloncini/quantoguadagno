import { I18nProvider } from "@/i18n/react.tsx";
import { EmployeeView } from "@/islands/home/EmployeeView.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";

export default function EmployeeCalculator({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <EmployeeView />
    </I18nProvider>
  );
}

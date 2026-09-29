import { I18nProvider } from "@/i18n/react.tsx";
import { ApprenticeshipView } from "@/islands/apprenticeship/ApprenticeshipView.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";

export default function ApprenticeshipCalculator({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <ApprenticeshipView />
    </I18nProvider>
  );
}

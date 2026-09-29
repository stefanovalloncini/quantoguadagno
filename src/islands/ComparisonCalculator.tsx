import { I18nProvider } from "@/i18n/react.tsx";
import { ComparisonView } from "@/islands/comparison/ComparisonView.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";

export default function ComparisonCalculator({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <ComparisonView />
    </I18nProvider>
  );
}

import { I18nProvider } from "@/i18n/react.tsx";
import { InflationView } from "@/islands/inflation/InflationView.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";

export default function InflationCalculator({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <InflationView />
    </I18nProvider>
  );
}

import { I18nProvider } from "@/i18n/react.tsx";
import { NaspiView } from "@/islands/naspi/NaspiView.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";

export default function NaspiCalculator({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <NaspiView />
    </I18nProvider>
  );
}

import { I18nProvider } from "@/i18n/react.tsx";
import { InverseView } from "@/islands/inverse/InverseView.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";

export default function InverseCalculator({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <InverseView />
    </I18nProvider>
  );
}

import { I18nProvider } from "@/i18n/react.tsx";
import { OrdinarioView } from "@/islands/ordinario/OrdinarioView.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";

export default function OrdinarioCalculator({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <OrdinarioView />
    </I18nProvider>
  );
}

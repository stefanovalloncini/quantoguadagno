import { I18nProvider } from "@/i18n/react.tsx";
import { ForfettarioView } from "@/islands/forfettario/ForfettarioView.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";

export default function ForfettarioCalculator({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <ForfettarioView />
    </I18nProvider>
  );
}

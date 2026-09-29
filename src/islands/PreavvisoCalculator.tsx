import { I18nProvider } from "@/i18n/react.tsx";
import { PreavvisoView } from "@/islands/preavviso/PreavvisoView.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";

export default function PreavvisoCalculator({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <PreavvisoView />
    </I18nProvider>
  );
}

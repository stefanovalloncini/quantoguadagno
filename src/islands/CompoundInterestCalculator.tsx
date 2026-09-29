import { I18nProvider } from "@/i18n/react.tsx";
import { CompoundInterestView } from "@/islands/compoundInterest/CompoundInterestView.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";

export default function CompoundInterestCalculator({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <CompoundInterestView />
    </I18nProvider>
  );
}

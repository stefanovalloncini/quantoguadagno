import { I18nProvider } from "@/i18n/react.tsx";
import { PayslipView } from "@/islands/printPayslip/PayslipView.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";

export default function PrintPayslip({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <PayslipView />
    </I18nProvider>
  );
}

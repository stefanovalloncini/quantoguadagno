import type { Namespace } from "@/i18n/messages/index.ts";
import { I18nProvider } from "@/i18n/react.tsx";
import { EmployeeTopics } from "@/islands/home/EmployeeTopics.tsx";
import { CommonAmounts } from "@/islands/netTable/CommonAmounts.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";

export const HOME_BANDS_NAMESPACES: readonly Namespace[] = ["employee", "netTable"];

// The bands that follow the calculator on the home page. They render on the server, outside
// the hydrated island, so the page ships no JavaScript for them.
export default function HomeBands({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <div className="qg-wrap">
        <CommonAmounts headingId="ral-titolo" />
        <EmployeeTopics />
      </div>
    </I18nProvider>
  );
}

import type { ReactNode } from "react";
import { getMessages } from "@/i18n/messages/index.ts";
import { I18nProvider } from "@/i18n/react.tsx";
import type { Locale } from "@/i18n/locales.ts";

export function KitTestProvider({
  children,
  locale = "it",
}: {
  readonly children: ReactNode;
  readonly locale?: Locale;
}) {
  return (
    <I18nProvider locale={locale} messages={getMessages(locale, ["form", "employee"])}>
      {children}
    </I18nProvider>
  );
}

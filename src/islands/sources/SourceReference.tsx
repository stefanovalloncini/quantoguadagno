import type { Source } from "@/data/index.ts";
import { NO_SOURCE_CITED } from "@/data/sources.ts";
import { useLocale, useT } from "@/i18n/react.tsx";

interface SourceReferenceProps {
  readonly source: Source;
  readonly text?: string | undefined;
}

export function SourceReference({ source, text }: SourceReferenceProps) {
  const t = useT();
  const locale = useLocale();
  if (source.ref === NO_SOURCE_CITED.ref) return <>{t("sources.source.none")}</>;
  const lang = locale === "it" ? undefined : "it";
  const label = text ?? source.ref;
  if (source.url === undefined) return <span lang={lang}>{label}</span>;
  return (
    <a href={source.url} hrefLang="it" lang={lang} rel="noreferrer">
      {label}
    </a>
  );
}

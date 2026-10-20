import { LinkList } from "@/components/page/LinkList.tsx";
import { useLocale, useT } from "@/i18n/react.tsx";
import { hrefFor, routeById } from "@/routes.ts";

const TOPICS = ["method", "glossary"] as const;

export interface UnderstandBandProps {
  readonly headingId: string;
}

export function UnderstandBand({ headingId }: UnderstandBandProps) {
  const t = useT();
  const locale = useLocale();
  const links = TOPICS.map((id) => {
    const route = routeById(id);
    return {
      href: hrefFor(id, locale),
      label: t(route.label),
      description: route.navDescription === undefined ? undefined : t(route.navDescription),
    };
  });
  return (
    <section className="qg-section qg-band" aria-labelledby={headingId}>
      <h2 className="qg-heading" id={headingId}>
        {t("netTable.understand.title")}
      </h2>
      <LinkList links={links} />
    </section>
  );
}

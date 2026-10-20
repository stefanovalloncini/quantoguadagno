import { Icon } from "@/components/icons/Icon.tsx";

export interface PagerLink {
  readonly href: string;
  readonly label: string;
}

export interface PagerProps {
  readonly label: string;
  readonly previousTitle: string;
  readonly nextTitle: string;
  readonly previous: PagerLink | null;
  readonly next: PagerLink | null;
  /** A last link to the whole series, under the two neighbours. */
  readonly all?: PagerLink | undefined;
}

// The GOV.UK pagination in its block form: the neighbours of a page in a series, each with
// its title and the name of the page it leads to.
export function Pager({ label, previousTitle, nextTitle, previous, next, all }: PagerProps) {
  return (
    <nav className="qg-pager" aria-label={label}>
      {previous !== null && (
        <a className="qg-pager__link" href={previous.href} rel="prev">
          <span className="qg-pager__title">
            <Icon name="chevronBack" />
            {previousTitle}
          </span>
          <span className="qg-visually-hidden">: </span>
          <span className="qg-pager__label">{previous.label}</span>
        </a>
      )}
      {next !== null && (
        <a className="qg-pager__link" href={next.href} rel="next">
          <span className="qg-pager__title">
            <Icon name="chevronForward" />
            {nextTitle}
          </span>
          <span className="qg-visually-hidden">: </span>
          <span className="qg-pager__label">{next.label}</span>
        </a>
      )}
      {all !== undefined && (
        <p className="qg-pager__all">
          <a href={all.href}>{all.label}</a>
        </p>
      )}
    </nav>
  );
}

export interface ListedLink {
  readonly href: string;
  readonly label: string;
  readonly description?: string | undefined;
}

export interface LinkListProps {
  readonly links: readonly ListedLink[];
}

export function LinkList({ links }: LinkListProps) {
  return (
    <ul className="qg-links" role="list">
      {links.map((link) => (
        <li key={link.href}>
          <a className="qg-navlink" href={link.href}>
            <span className="qg-navlink__name">{link.label}</span>
            {link.description !== undefined && (
              <span className="qg-navlink__desc">{link.description}</span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}

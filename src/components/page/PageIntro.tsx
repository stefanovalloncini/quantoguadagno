import type { ReactNode } from "react";

interface PageIntroProps {
  readonly title: ReactNode;
  readonly lede?: ReactNode;
  readonly meta?: ReactNode;
}

export function PageIntro({ title, lede, meta }: PageIntroProps) {
  return (
    <div className="qg-intro">
      <h1 className="qg-title">{title}</h1>
      {lede !== undefined && <p className="qg-lede">{lede}</p>}
      {meta !== undefined && <p className="qg-meta">{meta}</p>}
    </div>
  );
}

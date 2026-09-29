import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon.tsx";

export interface Topic {
  readonly id: string;
  readonly summary: ReactNode;
  readonly body: ReactNode;
}

export interface TopicsProps {
  readonly headingId: string;
  readonly title: ReactNode;
  readonly topics: readonly Topic[];
}

export function Topics({ headingId, title, topics }: TopicsProps) {
  return (
    <section className="qg-topics qg-band" aria-labelledby={headingId}>
      <h2 className="qg-heading" id={headingId}>
        {title}
      </h2>
      <div className="qg-topics__list">
        {topics.map((topic) => (
          <details className="qg-topic" key={topic.id} id={topic.id}>
            <summary className="qg-topic__summary">
              {topic.summary}
              <Icon name="chevronDown" />
            </summary>
            <div className="qg-topic__body">{topic.body}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

import type { ComponentType } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/locales.ts";
import { getMessages } from "@/i18n/messages/index.ts";
import type { IslandProps } from "@/islands/runtime/props.ts";
import { ROUTES } from "@/routes.ts";

const modules = import.meta.glob<{ default: ComponentType<IslandProps> }>(
  ["./*.tsx", "!./*.test.tsx"],
  { eager: true },
);

describe.each(ROUTES.filter((route) => route.island !== undefined))("island of $id", (route) => {
  it.each(LOCALES)("renders from its own namespaces in %s", (locale) => {
    const Island = modules[`./${route.island ?? ""}.tsx`]?.default;
    if (!Island) throw new Error(`Missing island module for ${route.id}`);
    render(<Island locale={locale} messages={getMessages(locale, route.namespaces)} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).not.toBe("");
  });
});

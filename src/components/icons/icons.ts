export interface IconShape {
  readonly paths: readonly string[];
  readonly circles?: readonly { readonly cx: number; readonly cy: number; readonly r: number }[];
  readonly directional?: boolean;
}

export const ICONS = {
  chevronDown: { paths: ["M4 6l4 4 4-4"] },
  chevronBack: { paths: ["M10 4l-4 4 4 4"], directional: true },
  chevronForward: { paths: ["M6 4l4 4-4 4"], directional: true },
  close: { paths: ["M4 4l8 8M12 4l-8 8"] },
  menu: { paths: ["M2.5 4.5h11M2.5 8h11M2.5 11.5h11"] },
  search: { paths: ["M10.5 10.5L14 14"], circles: [{ cx: 7, cy: 7, r: 4.5 }] },
  alert: { paths: ["M8 4.75v4", "M8 11.25v.01"], circles: [{ cx: 8, cy: 8, r: 6.25 }] },
  clock: { paths: ["M8 4.75V8l2.25 1.5"], circles: [{ cx: 8, cy: 8, r: 6.25 }] },
  print: { paths: ["M4.5 6V2.5h7V6", "M4.5 12h-2V6.5h11V12h-2", "M4.5 9.5h7v4h-7z"] },
  link: {
    paths: [
      "M6.5 9.5l3-3",
      "M7 4.5l1.25-1.25a2.5 2.5 0 013.5 3.5L10.5 8",
      "M9 11.5l-1.25 1.25a2.5 2.5 0 01-3.5-3.5L5.5 8",
    ],
  },
  building: {
    paths: ["M2.5 13.5h11", "M3.5 13.5v-10h6v10", "M9.5 6.5h3v7", "M5.5 6h2M5.5 8.5h2M5.5 11h2"],
  },
} as const satisfies Record<string, IconShape>;

export type IconName = keyof typeof ICONS;

export type IconSize = "md" | "lg";

export function iconClassName(name: IconName, size: IconSize, extra?: string): string {
  const shape: IconShape = ICONS[name];
  return [
    "qg-icon",
    size === "lg" ? "qg-icon--lg" : undefined,
    shape.directional === true ? "qg-icon--directional" : undefined,
    extra,
  ]
    .filter((part) => part !== undefined && part !== "")
    .join(" ");
}

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  RESTORE_PENDING_ATTRIBUTE,
  RESTORE_TARGET_ATTRIBUTE,
} from "@/islands/runtime/restoreSignal.ts";
import {
  REQUIRES_SCRIPT_ATTRIBUTE,
  THEME_CHOICE_ATTRIBUTE,
  THEME_TOGGLE_ATTRIBUTE,
} from "./inlineScripts.ts";

const runtimeCss = readFileSync(new URL("../styles/runtime.css", import.meta.url), "utf8");

describe("runtime styles", () => {
  it("hide only the restore target while a shared link is pending", () => {
    expect(runtimeCss).toContain(
      `:root[${RESTORE_PENDING_ATTRIBUTE}] [${RESTORE_TARGET_ATTRIBUTE}] {\n  visibility: hidden;`,
    );
  });

  it("reveal the target after two seconds without any script", () => {
    expect(runtimeCss).toContain("animation: restore-reveal 0s linear 2s forwards;");
    expect(runtimeCss).toMatch(/@keyframes restore-reveal \{\s+to \{\s+visibility: visible;/);
  });

  it("hide the theme radios and script-only controls when the bootstrap did not run", () => {
    expect(runtimeCss).toContain(
      `:root:not([${THEME_CHOICE_ATTRIBUTE}]) [${THEME_TOGGLE_ATTRIBUTE}]`,
    );
    expect(runtimeCss).toContain(
      `:root:not([${THEME_CHOICE_ATTRIBUTE}]) [${REQUIRES_SCRIPT_ATTRIBUTE}]`,
    );
  });
});

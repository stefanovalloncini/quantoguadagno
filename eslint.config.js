import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import * as astro from "eslint-plugin-astro";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import i18next from "eslint-plugin-i18next";
import prettier from "eslint-config-prettier";

const EXPLICIT_ROLES_KEPT_FOR_STYLED_LISTS_AND_TABLES = {
  nav: ["navigation"],
  ul: ["list"],
  ol: ["list"],
  table: ["table"],
  thead: ["rowgroup"],
  tbody: ["rowgroup"],
  tfoot: ["rowgroup"],
  tr: ["row"],
  th: ["columnheader", "rowheader"],
  td: ["cell"],
};

const ROLES_ALLOWED_ON_TABLE_CELLS = {
  tr: ["none", "presentation"],
  canvas: ["img"],
  th: ["columnheader", "rowheader"],
  td: ["cell"],
};

const SERVER_RENDERED_SUSPENSE = {
  name: "react",
  importNames: ["Suspense", "lazy"],
  message:
    "Use ClientSuspense and preloadable from src/islands/runtime: a Suspense boundary rendered on the server needs React's inline reveal script, which the CSP blocks.",
};

const PROVENANCE_MODULES = {
  group: [
    "@/data/fonti.ts",
    "@/data/stored.ts",
    "@/data/sources.ts",
    "@/data/define.ts",
    "@/data/derivedRules.ts",
    "@/data/params/*",
  ],
  message:
    "Provenance is for the Fonti page only: calculator islands read values through @/data/index.ts and trust counts through countUnverified.",
};

const FOCUSABLE_SCROLL_REGIONS = { tags: [], roles: ["tabpanel", "region"] };

function accessibilityRuleOptions(prefix) {
  return {
    [`${prefix}no-redundant-roles`]: ["error", EXPLICIT_ROLES_KEPT_FOR_STYLED_LISTS_AND_TABLES],
    [`${prefix}no-interactive-element-to-noninteractive-role`]: [
      "error",
      ROLES_ALLOWED_ON_TABLE_CELLS,
    ],
    [`${prefix}no-noninteractive-tabindex`]: ["error", FOCUSABLE_SCROLL_REGIONS],
  };
}

export default defineConfig(
  {
    ignores: [
      "dist",
      "dist-*",
      ".astro",
      "node_modules",
      "scripts/data/.cache",
      "src/data/comuni/**/*.json",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["public/sw.js"],
    languageOptions: {
      globals: globals.serviceworker,
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.astro"],
    extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".astro"],
      },
    },
  },
  {
    files: ["**/*.tsx", "src/islands/**/*.ts"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs["recommended-latest"].rules,
    },
  },
  {
    files: ["src/islands/runtime/useUrlState.ts"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ...jsxA11y.flatConfigs.recommended,
    files: ["**/*.tsx"],
  },
  {
    files: ["**/*.tsx"],
    rules: accessibilityRuleOptions("jsx-a11y/"),
  },
  ...astro.configs.recommended,
  ...astro.configs["jsx-a11y-recommended"],
  {
    files: ["**/*.astro"],
    rules: accessibilityRuleOptions("astro/jsx-a11y/"),
  },
  {
    files: ["src/**/*.tsx", "src/**/*.astro"],
    plugins: {
      i18next,
    },
    rules: {
      "i18next/no-literal-string": [
        "error",
        { markupOnly: true, ignoreAttribute: ["data-testid", "aria-hidden"] },
      ],
    },
  },
  {
    files: ["src/domain/**/*.{ts,tsx}", "src/data/**/*.{ts,tsx}", "src/i18n/**/*.{ts,tsx}"],
    ignores: ["src/i18n/react.tsx"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react-dom",
                "react/*",
                "astro",
                "astro:*",
                "@/components/*",
                "@/islands/*",
                "@/layouts/*",
                "@/pages/*",
              ],
              message: "src/domain, src/data and src/i18n stay framework-free.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/**/*.{ts,tsx}", "src/islands/**/*.{ts,tsx}", "src/layouts/**/*.tsx"],
    ignores: ["src/islands/runtime/ClientSuspense.tsx", "src/islands/runtime/preloadable.tsx"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [SERVER_RENDERED_SUSPENSE],
          patterns: [PROVENANCE_MODULES],
        },
      ],
    },
  },
  {
    files: [
      "src/islands/{AboutPage,GlossaryPage,MethodPage,SourcesPage}.tsx",
      "src/islands/{glossary,method,prose,sources}/**/*.{ts,tsx}",
      "src/**/*.test.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-restricted-imports": ["error", { paths: [SERVER_RENDERED_SUSPENSE] }],
    },
  },
  {
    files: ["src/pages/style-guide.astro", "src/components/style-guide/**/*"],
    rules: {
      "i18next/no-literal-string": "off",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "scripts/**/*"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "i18next/no-literal-string": "off",
    },
  },
  prettier,
);

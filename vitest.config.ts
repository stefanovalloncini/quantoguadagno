/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

const vitestConfig = {
  test: {
    passWithNoTests: true,
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts", "tests/**/*.test.ts", "scripts/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
  },
};

export default getViteConfig(vitestConfig as Parameters<typeof getViteConfig>[0]);

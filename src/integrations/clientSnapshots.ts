import { isDeepStrictEqual } from "node:util";
import type { AstroIntegration } from "astro";

export type ModuleExports = Readonly<Record<string, unknown>>;

export function serializeExport(name: string, value: unknown): string {
  if (typeof value === "function") {
    throw new Error(`Client snapshot export "${name}" is a function, not data`);
  }
  const json = JSON.stringify(value);
  if (!isDeepStrictEqual(JSON.parse(json), value)) {
    throw new Error(`Client snapshot export "${name}" does not survive a JSON round trip`);
  }
  return `export const ${name} = ${json};`;
}

export function snapshotSource(exports: ModuleExports): string {
  return Object.entries(exports)
    .map(([name, value]) => serializeExport(name, value))
    .join("\n");
}

function withoutQuery(id: string): string {
  const queryStart = id.indexOf("?");
  return queryStart === -1 ? id : id.slice(0, queryStart);
}

export function clientSnapshots(modules: ReadonlyMap<string, ModuleExports>): AstroIntegration {
  return {
    name: "quantoguadagno:client-snapshots",
    hooks: {
      "astro:config:setup": ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [
              {
                name: "quantoguadagno:client-snapshots",
                apply: "build",
                enforce: "pre",
                applyToEnvironment: (environment) => environment.config.consumer === "client",
                load(id) {
                  const exports = modules.get(withoutQuery(id));
                  return exports === undefined ? null : snapshotSource(exports);
                },
              },
            ],
          },
        });
      },
    },
  };
}

import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import * as storedValues from "./src/data/storedValues.ts";
import * as verificationSnapshot from "./src/data/verificationSnapshot.ts";
import { clientSnapshots } from "./src/integrations/clientSnapshots.ts";
import { legacyRedirects } from "./src/integrations/redirects.ts";
import { SITE_ORIGIN } from "./src/routes.ts";

const snapshotPath = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  site: SITE_ORIGIN,
  output: "static",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  integrations: [
    react(),
    legacyRedirects(),
    clientSnapshots(
      new Map([
        [snapshotPath("./src/data/storedValues.ts"), storedValues],
        [snapshotPath("./src/data/verificationSnapshot.ts"), verificationSnapshot],
      ]),
    ),
  ],
  security: {
    csp: true,
  },
});

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, "..", "..");
const regionsDir = join(projectRoot, "src", "data", "comuni");
const NAMES_FILE = "names.json";
const outputFile = join(regionsDir, NAMES_FILE);

export function buildComuneNames(regionFiles) {
  const regions = {};
  for (const file of [...regionFiles].sort((a, b) => a.region.localeCompare(b.region))) {
    regions[file.region] = file.comuni.map((comune) => [comune.id, comune.province, comune.name]);
  }
  return { regions };
}

export function readRegionFiles(dir = regionsDir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json") && name !== "index.json" && name !== NAMES_FILE)
    .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const names = buildComuneNames(readRegionFiles());
  writeFileSync(outputFile, `${JSON.stringify(names)}\n`);
  const count = Object.values(names.regions).reduce((sum, list) => sum + list.length, 0);
  console.log(`${NAMES_FILE}: ${String(count)} comuni`);
}

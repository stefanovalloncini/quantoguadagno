import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildComuneNames } from "./build-comune-names.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, "..", "..");
const cacheDir = join(scriptDir, ".cache");
const outputDir = join(projectRoot, "src", "data", "comuni");

const YEARS = [2024, 2025, 2026];
const DOWNLOAD_BASE =
  "https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/nuova_addcomirpef/download/download.php";
const SOURCE_REF = "Dipartimento delle Finanze - Addizionale comunale all'IRPEF, elenchi generali";
const SOURCE_URL =
  "https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/nuova_addcomirpef/download/tabella.htm";

const EXPECTED_COMUNI_MIN = 7890;
const EXPECTED_COMUNI_MAX = 7910;
const MAX_ORDINARY_RATE = 0.9;
const NOTE_MAX_LENGTH = 300;
const NO_DELIBERA_RATE_MARKER = "0*";
const FILING_DEADLINE_MONTH = 11;
const FILING_DEADLINE_DAY = 20;

function isYearClosed(year, now = new Date()) {
  return now.getTime() >= Date.UTC(year, FILING_DEADLINE_MONTH, FILING_DEADLINE_DAY);
}

const PROVINCES_BY_REGION = {
  piemonte: ["AL", "AT", "BI", "CN", "NO", "TO", "VB", "VC"],
  "valle-daosta": ["AO"],
  lombardia: ["BG", "BS", "CO", "CR", "LC", "LO", "MN", "MI", "MB", "PV", "SO", "VA"],
  trento: ["TN"],
  bolzano: ["BZ"],
  veneto: ["BL", "PD", "RO", "TV", "VE", "VR", "VI"],
  "friuli-venezia-giulia": ["GO", "PN", "TS", "UD"],
  liguria: ["GE", "IM", "SP", "SV"],
  "emilia-romagna": ["BO", "FE", "FC", "MO", "PC", "PR", "RA", "RE", "RN"],
  toscana: ["AR", "FI", "GR", "LI", "LU", "MS", "PI", "PT", "PO", "SI"],
  umbria: ["PG", "TR"],
  marche: ["AN", "AP", "FM", "MC", "PU"],
  lazio: ["FR", "LT", "RI", "RM", "VT"],
  abruzzo: ["AQ", "CH", "PE", "TE"],
  molise: ["CB", "IS"],
  campania: ["AV", "BN", "CE", "NA", "SA"],
  puglia: ["BA", "BT", "BR", "FG", "LE", "TA"],
  basilicata: ["MT", "PZ"],
  calabria: ["CZ", "CS", "KR", "RC", "VV"],
  sicilia: ["AG", "CL", "CT", "EN", "ME", "PA", "RG", "SR", "TP"],
  sardegna: ["CA", "NU", "OR", "SS", "SU"],
};

const REGION_KEYS = Object.keys(PROVINCES_BY_REGION);

const PROVINCE_TO_REGION = new Map();
for (const [region, provinces] of Object.entries(PROVINCES_BY_REGION)) {
  for (const province of provinces) PROVINCE_TO_REGION.set(province, region);
}

const LITERAL_APOSTROPHE_WORDS = new Set(["de'", "ne'", "vo'"]);
const LOWERCASE_WORDS = new Set([
  "di",
  "d",
  "da",
  "de",
  "del",
  "dei",
  "degli",
  "della",
  "delle",
  "dello",
  "in",
  "nel",
  "nello",
  "nella",
  "negli",
  "nelle",
  "a",
  "al",
  "allo",
  "agli",
  "ai",
  "alla",
  "alle",
  "su",
  "sul",
  "sullo",
  "sugli",
  "sulla",
  "sulle",
  "con",
  "e",
  "ed",
  "o",
  "od",
  "per",
  "tra",
  "fra",
]);
const LOWERCASE_APOSTROPHE_PREFIXES = new Set([
  "d",
  "dell",
  "nell",
  "sull",
  "all",
  "dall",
  "coll",
  "pell",
]);
const GRAVE_ACCENTS = { a: "à", e: "è", i: "ì", o: "ò", u: "ù" };

const COMPLEX_EXEMPTION_KEYWORDS = [
  "pension",
  "dipendent",
  "assimilat",
  "autonom",
  "impresa",
  "isee",
  "handicap",
  "invalid",
  "famigli",
  "figli",
  "carico",
  "sessant",
  "ultra",
  "disoccup",
  "categor",
];

function capitalizeFirst(segment) {
  return segment.length === 0 ? segment : segment[0].toUpperCase() + segment.slice(1);
}

function accentTrailingApostrophe(word) {
  const stripped = word.slice(0, -1);
  const lastChar = stripped.slice(-1);
  const accented = GRAVE_ACCENTS[lastChar];
  return accented ? stripped.slice(0, -1) + accented : stripped;
}

function formatNameWord(word, isFirstWord) {
  if (LITERAL_APOSTROPHE_WORDS.has(word)) {
    return isFirstWord ? capitalizeFirst(word) : word;
  }
  const working = word.endsWith("'") ? accentTrailingApostrophe(word) : word;
  const apostropheIndex = working.indexOf("'");
  if (apostropheIndex === -1) {
    if (!isFirstWord && LOWERCASE_WORDS.has(working)) return working;
    return capitalizeFirst(working);
  }
  const prefix = working.slice(0, apostropheIndex);
  const rest = working.slice(apostropheIndex + 1);
  const keepPrefixLowercase = !isFirstWord && LOWERCASE_APOSTROPHE_PREFIXES.has(prefix);
  const head = keepPrefixLowercase ? prefix : capitalizeFirst(prefix);
  return `${head}'${capitalizeFirst(rest)}`;
}

function formatNameToken(token, isFirstWord) {
  return token
    .split("-")
    .map((part, index) => formatNameWord(part, isFirstWord && index === 0))
    .join("-");
}

function titleCaseComuneName(rawName) {
  return rawName
    .toLowerCase()
    .split(" ")
    .map((token, index) => formatNameToken(token, index === 0))
    .join(" ");
}

function parseAmountToken(token) {
  if (!token) return null;
  const normalized = token.replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function extractAllAmounts(text) {
  const matches = text.match(/\d[\d.,]*\d|\d/g) ?? [];
  return matches.map(parseAmountToken).filter((value) => value !== null);
}

function parseFirstAmount(text) {
  const amounts = extractAllAmounts(text);
  return amounts.length > 0 ? amounts[0] : null;
}

function isOpenEndedWording(lower) {
  return lower.includes("oltre") || lower.includes("superior") || lower.includes("da");
}

function determineBracketUpTo(fasciaText) {
  const lower = fasciaText.toLowerCase();
  const amounts = extractAllAmounts(fasciaText);
  if (amounts.length >= 2) return { upTo: amounts[amounts.length - 1] };
  if (amounts.length === 1) {
    if (lower.includes("fino")) return { upTo: amounts[0] };
    if (isOpenEndedWording(lower)) return { upTo: null };
    return { upTo: amounts[0] };
  }
  if (isOpenEndedWording(lower)) return { upTo: null };
  return { unparseable: true };
}

function isTerritorialSplitText(fasciaText) {
  const lower = fasciaText.toLowerCase();
  return (
    lower.includes("preesistente") ||
    lower.includes("ex comune") ||
    lower.includes("comune di fusione")
  );
}

function parseRateValue(raw) {
  if (!raw) return null;
  const value = Number(raw.replace("*", "").replace(",", "."));
  return Number.isFinite(value) ? Math.round(value * 1000) / 1000 : null;
}

function classifyFascia(fasciaText) {
  const lower = fasciaText.toLowerCase();
  if (lower.includes("esenzione")) return "exempt";
  if (lower.includes("aliquota unica")) return "flat";
  return "bracket";
}

function isComplexExemptionText(text) {
  const lower = text.toLowerCase();
  return COMPLEX_EXEMPTION_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function truncateNote(text) {
  if (text.length <= NOTE_MAX_LENGTH) return text;
  const truncated = text.slice(0, NOTE_MAX_LENGTH);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : NOTE_MAX_LENGTH)}…`;
}

function buildExemptionFields(exemptTexts, importoEsente) {
  if (exemptTexts.length === 0) return {};
  if (exemptTexts.length === 1) {
    const text = exemptTexts[0];
    if (importoEsente > 0) return { exemption: importoEsente };
    if (isComplexExemptionText(text)) return { note: truncateNote(text) };
    const parsed = parseFirstAmount(text);
    return parsed !== null ? { exemption: parsed } : { note: truncateNote(text) };
  }
  const note = truncateNote(exemptTexts.join("; "));
  return importoEsente > 0 ? { exemption: importoEsente, note } : { note };
}

function extractPairs(fields) {
  const pairs = [];
  for (let index = 0; index < 12; index++) {
    const rateField = 8 + index * 2;
    const fasciaField = rateField + 1;
    const rate = fields[rateField];
    const fascia = fields[fasciaField];
    if (!rate && !fascia) continue;
    pairs.push({ rate, fascia: fascia ?? "" });
  }
  return pairs;
}

function bracketSequenceProblem(brackets) {
  for (let index = 1; index < brackets.length; index++) {
    const previous = brackets[index - 1].upTo;
    const current = brackets[index].upTo;
    if (previous === null) return "open-ended bracket before the last one";
    if (current !== null && current <= previous) {
      return `brackets not ascending (${previous} -> ${current})`;
    }
  }
  if (brackets[brackets.length - 1].upTo !== null) return "last bracket is not open-ended";
  return null;
}

function buildRuleForRow(fields, context, warnings, yearClosed) {
  const numeroDelibera = fields[3];
  if (!numeroDelibera) {
    if (yearClosed && fields[8] === NO_DELIBERA_RATE_MARKER) return { rate: 0 };
    return null;
  }

  const importoEsente = parseAmountToken(fields[fields.length - 1]) ?? 0;
  const exemptTexts = [];
  const brackets = [];
  let flatRate = null;

  for (const { rate, fascia } of extractPairs(fields)) {
    if (!fascia) {
      warnings.push(`${context}: rate "${rate}" with no fascia label, skipped`);
      continue;
    }
    if (isTerritorialSplitText(fascia)) {
      warnings.push(
        `${context}: rule differs by former-comune territory, dropping year ("${fascia.trim()}")`,
      );
      return null;
    }
    const kind = classifyFascia(fascia);
    if (kind === "exempt") {
      exemptTexts.push(fascia.trim());
      continue;
    }
    const rateValue = parseRateValue(rate);
    if (rateValue === null) {
      warnings.push(`${context}: unparseable rate "${rate}"`);
      continue;
    }
    if (kind === "flat") {
      flatRate = rateValue;
    } else {
      const bound = determineBracketUpTo(fascia);
      if (bound.unparseable) {
        warnings.push(
          `${context}: bracket with no recognizable bound, dropping year ("${fascia.trim()}")`,
        );
        return null;
      }
      brackets.push({ upTo: bound.upTo, rate: rateValue });
    }
  }

  if (flatRate !== null && brackets.length > 0) {
    warnings.push(`${context}: both a flat rate and brackets were present, keeping brackets`);
  }

  const rule = {};
  if (brackets.length > 0) {
    brackets.sort((a, b) => (a.upTo ?? Infinity) - (b.upTo ?? Infinity));
    const problem = bracketSequenceProblem(brackets);
    if (problem) {
      warnings.push(`${context}: ${problem}, dropping year`);
      return null;
    }
    rule.brackets = brackets;
  } else if (flatRate !== null) {
    rule.rate = flatRate;
  } else {
    if (exemptTexts.length === 0)
      warnings.push(`${context}: delibera on file but no rate could be parsed`);
    return null;
  }

  Object.assign(rule, buildExemptionFields(exemptTexts, importoEsente));
  return rule;
}

async function readYearCsv(year) {
  const cachePath = join(cacheDir, `Add_comunale_irpef${year}.csv`);
  if (existsSync(cachePath)) return readFileSync(cachePath, "utf8");
  mkdirSync(cacheDir, { recursive: true });
  const response = await fetch(`${DOWNLOAD_BASE}?anno=${year}`, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`download failed for ${year}: HTTP ${response.status}`);
  const text = await response.text();
  writeFileSync(cachePath, text, "utf8");
  return text;
}

function parseYearRows(csvText) {
  return csvText
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .slice(1)
    .map((line) => line.split(";"));
}

async function buildComuneRegistry(warnings) {
  const registry = new Map();
  const rowCountByYear = {};

  for (const year of YEARS) {
    const rows = parseYearRows(await readYearCsv(year));
    rowCountByYear[year] = rows.length;
    const yearClosed = isYearClosed(year);

    for (const fields of rows) {
      const id = fields[0];
      const province = fields[2];
      const name = titleCaseComuneName(fields[1]);
      const context = `${name} (${province}) ${year}`;

      if (!registry.has(id)) registry.set(id, { id, name, province, years: {} });
      const entry = registry.get(id);
      entry.name = name;
      entry.province = province;

      const rule = buildRuleForRow(fields, context, warnings, yearClosed);
      if (rule) entry.years[year] = rule;
    }
  }

  return { registry, rowCountByYear };
}

function groupByRegion(registry, warnings) {
  const regions = new Map(REGION_KEYS.map((key) => [key, []]));
  for (const comune of registry.values()) {
    const regionKey = PROVINCE_TO_REGION.get(comune.province);
    if (!regionKey) {
      warnings.push(
        `${comune.name} (${comune.province}): no region mapping for this province, dropped`,
      );
      continue;
    }
    regions.get(regionKey).push(comune);
  }
  for (const comuni of regions.values()) {
    comuni.sort((a, b) => a.name.localeCompare(b.name, "it"));
  }
  return regions;
}

function validateRegistry(registry, rowCountByYear, warnings) {
  for (const year of YEARS) {
    const count = rowCountByYear[year];
    if (count < EXPECTED_COMUNI_MIN || count > EXPECTED_COMUNI_MAX) {
      warnings.push(
        `year ${year}: source row count ${count} outside expected ${EXPECTED_COMUNI_MIN}-${EXPECTED_COMUNI_MAX}`,
      );
    }
  }

  for (const comune of registry.values()) {
    for (const [year, rule] of Object.entries(comune.years)) {
      const rates = rule.brackets ? rule.brackets.map((bracket) => bracket.rate) : [rule.rate];
      for (const rate of rates) {
        if (rate > MAX_ORDINARY_RATE)
          warnings.push(
            `${comune.name} (${comune.province}) ${year}: rate ${rate} above ${MAX_ORDINARY_RATE}`,
          );
        if (rate < 0)
          warnings.push(`${comune.name} (${comune.province}) ${year}: negative rate ${rate}`);
      }
    }
  }
}

function writeRegionFiles(regions) {
  mkdirSync(outputDir, { recursive: true });
  const stats = {};
  for (const [regionKey, comuni] of regions.entries()) {
    const payload = JSON.stringify({ region: regionKey, comuni });
    writeFileSync(join(outputDir, `${regionKey}.json`), payload, "utf8");
    stats[regionKey] = { count: comuni.length, bytes: Buffer.byteLength(payload, "utf8") };
  }
  return stats;
}

function writeIndexFile(regions, stats) {
  const yearsCovered = YEARS.filter((year) =>
    [...regions.values()].some((comuni) => comuni.some((comune) => comune.years[year])),
  );
  const index = {
    source: {
      ref: SOURCE_REF,
      url: SOURCE_URL,
      published: null,
      retrieved: new Date().toISOString().slice(0, 10),
    },
    years: yearsCovered,
    regions: stats,
  };
  writeFileSync(join(outputDir, "index.json"), JSON.stringify(index), "utf8");
}

function writeNamesFile(regions) {
  const files = [...regions.entries()].map(([region, comuni]) => ({ region, comuni }));
  writeFileSync(
    join(outputDir, "names.json"),
    `${JSON.stringify(buildComuneNames(files))}\n`,
    "utf8",
  );
}

function printSummary(regions, rowCountByYear, warnings) {
  const columns = ["region", "comuni", ...YEARS.map(String)];
  console.log(columns.join("\t"));
  for (const regionKey of REGION_KEYS) {
    const comuni = regions.get(regionKey);
    const yearCounts = YEARS.map((year) => comuni.filter((comune) => comune.years[year]).length);
    console.log([regionKey, comuni.length, ...yearCounts].join("\t"));
  }
  console.log("");
  console.log(
    `source rows per year: ${YEARS.map((year) => `${year}=${rowCountByYear[year]}`).join(" ")}`,
  );
  console.log(`warnings: ${warnings.length}`);
  for (const warning of warnings) console.log(`  ${warning}`);
}

async function main() {
  const warnings = [];
  const { registry, rowCountByYear } = await buildComuneRegistry(warnings);
  validateRegistry(registry, rowCountByYear, warnings);
  const regions = groupByRegion(registry, warnings);
  const stats = writeRegionFiles(regions);
  writeIndexFile(regions, stats);
  writeNamesFile(regions);
  printSummary(regions, rowCountByYear, warnings);
}

await main();

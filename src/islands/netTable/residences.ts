import lombardia from "@/data/comuni/lombardia.json";
import {
  loadRegionComuni,
  REGION_CODES,
  type RegionComuni,
  type SupportedYear,
} from "@/data/index.ts";
import { REFERENCE_REGION, residenceIn, type Residence, type Residences } from "./model.ts";

// Read synchronously, so the hub and the home page can render the reference scenario
// without loading the other regions.
const REFERENCE_COMUNI = lombardia as unknown as RegionComuni;

export function referenceResidence(year: SupportedYear): Residence {
  if (REFERENCE_COMUNI.region !== REFERENCE_REGION) {
    throw new Error(`The reference comuni file is not the one of ${REFERENCE_REGION}`);
  }
  return residenceIn(REFERENCE_COMUNI, year);
}

const loaded = new Map<SupportedYear, Promise<Residences>>();

async function loadAll(year: SupportedYear): Promise<Residences> {
  const entries = await Promise.all(
    REGION_CODES.map(async (region) => {
      const residence = residenceIn(await loadRegionComuni(region), year);
      return [region, residence] as const;
    }),
  );
  return Object.fromEntries(entries) as Residences;
}

/** The capoluogo of every region with its rule for the year, loaded once per year. */
export function loadResidences(year: SupportedYear): Promise<Residences> {
  let pending = loaded.get(year);
  if (pending === undefined) {
    pending = loadAll(year);
    loaded.set(year, pending);
  }
  return pending;
}

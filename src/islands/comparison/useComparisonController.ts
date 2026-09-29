import { useCallback, useMemo, useState } from "react";
import {
  lookedUpComune,
  useComuni,
  type ComuneLookup,
  type ComuniList,
} from "@/islands/home/useComune.ts";
import { useLocale } from "@/i18n/react.tsx";
import type { FormControlValue } from "@/islands/runtime/formControls.ts";
import { computeOffer, type ComparedOffers, type OfferResult } from "./compute.ts";
import { comparisonRows, verdict, type ComparisonRow, type ComparisonVerdict } from "./derive.ts";
import {
  adoptField as adoptFieldState,
  checkComparison,
  comparisonDefaults,
  setCondition,
  setOffer,
  type ComparisonErrors,
  type ComparisonState,
  type ConditionUpdate,
  type OfferField,
  type OfferId,
  type OfferState,
  type Offers,
} from "./state.ts";

export interface ComparisonDerived {
  readonly verdict: ComparisonVerdict;
  readonly rows: readonly ComparisonRow[];
}

export type OfferUpdate = <K extends OfferField>(
  id: OfferId,
  field: K,
  value: OfferState[K],
) => void;

export interface ComparisonController {
  readonly state: ComparisonState;
  readonly errors: ComparisonErrors;
  readonly offers: Offers<OfferResult | null>;
  readonly staleOffers: Offers<boolean>;
  readonly result: ComparedOffers | null;
  readonly stale: boolean;
  readonly derived: ComparisonDerived | null;
  readonly comune: ComuneLookup;
  readonly comuni: ComuniList;
  readonly updateOffer: OfferUpdate;
  readonly updateCondition: ConditionUpdate;
  readonly loadComuni: () => void;
  readonly reset: () => void;
  readonly adoptField: (name: string, value: FormControlValue) => void;
}

const NOTHING_SHOWN: Offers<OfferResult | null> = { a: null, b: null };

export function useComparisonController(): ComparisonController {
  const locale = useLocale();
  const [state, setState] = useState<ComparisonState>(() => comparisonDefaults(locale));
  const [lastShown, setLastShown] = useState(NOTHING_SHOWN);
  const comuni = useComuni(state.conditions.region, state.conditions.comune);
  const comune = lookedUpComune(comuni.selected);

  const check = useMemo(() => checkComparison(state, locale), [state, locale]);
  const current = useMemo<Offers<OfferResult | null>>(
    () => ({ a: computeOffer(check.offers.a, comune), b: computeOffer(check.offers.b, comune) }),
    [check.offers, comune],
  );

  const change = useCallback(
    (next: (previous: ComparisonState) => ComparisonState) => {
      setLastShown((previous) => ({ a: current.a ?? previous.a, b: current.b ?? previous.b }));
      setState(next);
    },
    [current],
  );

  const shownA = current.a ?? lastShown.a;
  const shownB = current.b ?? lastShown.b;
  const offers = useMemo(() => ({ a: shownA, b: shownB }), [shownA, shownB]);
  const staleOffers = {
    a: current.a === null && shownA !== null,
    b: current.b === null && shownB !== null,
  };
  const result = useMemo<ComparedOffers | null>(
    () => (shownA === null || shownB === null ? null : { a: shownA, b: shownB }),
    [shownA, shownB],
  );
  const derived = useMemo<ComparisonDerived | null>(
    () => (result === null ? null : { verdict: verdict(result), rows: comparisonRows(result) }),
    [result],
  );

  const updateOffer = useCallback<OfferUpdate>(
    (id, field, value) => {
      change((previous) => setOffer(previous, id, field, value));
    },
    [change],
  );

  const updateCondition = useCallback<ConditionUpdate>(
    (field, value) => {
      change((previous) => setCondition(previous, field, value));
    },
    [change],
  );

  const reset = useCallback(() => {
    change(() => comparisonDefaults(locale));
  }, [change, locale]);

  const adoptField = useCallback(
    (name: string, value: FormControlValue) => {
      change((previous) => adoptFieldState(previous, name, value));
    },
    [change],
  );

  return {
    state,
    errors: check.errors,
    offers,
    staleOffers,
    result,
    stale: staleOffers.a || staleOffers.b,
    derived,
    comune: comuni.selected,
    comuni: comuni.list,
    updateOffer,
    updateCondition,
    loadComuni: comuni.load,
    reset,
    adoptField,
  };
}

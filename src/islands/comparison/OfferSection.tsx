import { amountAfter, type AmountAfter } from "@/components/form/amountAfter.ts";
import { Field } from "@/components/form/Field.tsx";
import { MoneyInput } from "@/components/form/MoneyInput.tsx";
import { RadioGroup } from "@/components/form/RadioGroup.tsx";
import type { PaymentFrequency } from "@/data/index.ts";
import { useT } from "@/i18n/react.tsx";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";
import type { OfferResult } from "./compute.ts";
import {
  frequencyName,
  GROSS_FIELDS,
  PAYMENT_FREQUENCIES,
  type OfferId,
  type OfferState,
} from "./state.ts";
import { FREQUENCY_IDS, GROSS_IDS, OFFER_HEADING_IDS } from "./viewIds.ts";

export type OfferResultState = "ready" | "stale" | "empty";

export interface OfferSectionProps {
  readonly id: OfferId;
  readonly offer: OfferState;
  readonly result: OfferResult | null;
  readonly resultState: OfferResultState;
  readonly staleText: string;
  readonly error: string | undefined;
  readonly editing: boolean;
  readonly f: ViewFormat;
  readonly onGrossChange: (value: string) => void;
  readonly onGrossFocus: () => void;
  readonly onGrossBlur: () => void;
  readonly onFrequencyChange: (value: PaymentFrequency) => void;
}

function useGrossAfter(
  offer: OfferState,
  error: string | undefined,
  editing: boolean,
  f: ViewFormat,
): AmountAfter | null {
  const t = useT();
  if (error !== undefined) return null;
  return amountAfter({
    raw: offer.gross,
    typing: { editing },
    count: offer.paymentFrequency,
    keyPrefix: "comparison.gross",
    t,
    f,
  });
}

export function OfferSection({
  id,
  offer,
  result,
  resultState,
  staleText,
  error,
  editing,
  f,
  onGrossChange,
  onGrossFocus,
  onGrossBlur,
  onFrequencyChange,
}: OfferSectionProps) {
  const t = useT();
  const after = useGrossAfter(offer, error, editing, f);
  const of = t("comparison.offer.of", { offer: id });
  const breakdown = resultState === "empty" ? null : (result?.breakdown ?? null);
  const resultClass =
    resultState === "stale" ? "qg-offer__result qg-offer__result--stale" : "qg-offer__result";

  return (
    <section className="qg-offer" aria-labelledby={OFFER_HEADING_IDS[id]}>
      <h2 className="qg-offer__title" id={OFFER_HEADING_IDS[id]}>
        {t("comparison.offer.title", { offer: id })}
      </h2>
      <Field
        id={GROSS_IDS[id]}
        label={t("comparison.gross.label")}
        labelSuffix={t("comparison.gross.unit", { of })}
        error={error}
        {...(after === null ? {} : { after: after.text, afterTone: after.tone })}
      >
        {(control) => (
          <MoneyInput
            {...control}
            name={GROSS_FIELDS[id]}
            value={offer.gross}
            onValueChange={onGrossChange}
            onFocus={onGrossFocus}
            onBlur={onGrossBlur}
          />
        )}
      </Field>
      <RadioGroup
        idPrefix={FREQUENCY_IDS[id]}
        name={frequencyName(id)}
        legend={
          <>
            {t("comparison.frequency.legend")} <span className="qg-visually-hidden">{of}</span>
          </>
        }
        layout="fill"
        value={String(offer.paymentFrequency)}
        options={PAYMENT_FREQUENCIES.map((count) => ({
          value: String(count),
          label: String(count),
        }))}
        onValueChange={(value) => {
          const count = PAYMENT_FREQUENCIES.find((option) => String(option) === value);
          if (count !== undefined) onFrequencyChange(count);
        }}
      />
      <div className={resultClass}>
        <p className="qg-offer__label">{t("comparison.offer.net")}</p>
        {breakdown === null ? (
          <p className="qg-offer__detail">{t("comparison.offer.empty")}</p>
        ) : (
          <>
            <p className="qg-offer__net">{f.money(breakdown.netAnnual)}</p>
            <p className="qg-offer__detail">
              {resultState === "stale"
                ? staleText
                : t("comparison.offer.detail", {
                    amount: f.money(breakdown.netMonthly),
                    count: result?.values.paymentFrequency ?? offer.paymentFrequency,
                  })}
            </p>
          </>
        )}
      </div>
    </section>
  );
}

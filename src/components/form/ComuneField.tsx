import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import {
  COMUNI_SOURCE,
  comunaleRuleFor,
  type Comune,
  type ComunaleRule,
  type RegionCode,
} from "@/data/index.ts";
import { percentArticle } from "@/i18n/articles.ts";
import { formatMoney, formatNumber, formatPercent, parseDecimal } from "@/i18n/numbers.ts";
import type { Locale } from "@/i18n/locales.ts";
import { useLocale, useT } from "@/i18n/react.tsx";
import { COMUNE_SEARCH_MIN_LENGTH, comuneSearchKey, searchComuni } from "./comuneSearch.ts";
import type { ComuneLookup, ComuniList } from "@/islands/home/useComune.ts";
import { Combobox } from "./Combobox.tsx";
import {
  comuneNamesState,
  findElsewhere,
  idleComuneNames,
  requestComuneNames,
  subscribeComuneNames,
  type ComuneElsewhere,
} from "./comuneNames.ts";
import { Field, FieldAlt, type AfterTone } from "./Field.tsx";
import { NumberInput } from "./NumberInput.tsx";
import { useRegionText } from "./regionText.ts";

export interface ComuneFieldProps {
  readonly id?: string;
  readonly rateId?: string;
  readonly region: RegionCode;
  readonly year: number;
  readonly list: ComuniList;
  readonly selection: ComuneLookup;
  readonly manual: boolean;
  readonly manualRate: string;
  readonly manualRateError?: ReactNode;
  readonly onLoad: () => void;
  readonly onSelect: (id: string | null) => void;
  readonly onSwitchRegion: (region: RegionCode, id: string) => void;
  readonly onManualChange: (manual: boolean) => void;
  readonly onManualRateChange: (text: string) => void;
  readonly onManualRateFocus?: () => void;
  readonly onManualRateBlur?: () => void;
  readonly defaultQuery?: string;
  readonly defaultListOpen?: boolean;
}

const MAX_OPTIONS = 40;
const ELSEWHERE_MIN_LENGTH = 3;
const RATE_EXAMPLE = 0.8;

interface AfterState {
  readonly text: ReactNode;
  readonly tone: AfterTone;
  readonly extra?: ReactNode;
  readonly announce?: string;
}

interface Draft {
  readonly region: RegionCode;
  readonly text: string;
}

export function comuneLabel(comune: Comune): string {
  return `${comune.name} (${comune.province})`;
}

function ratesOf(rule: ComunaleRule): readonly number[] {
  return rule.brackets === undefined ? [rule.rate] : rule.brackets.map((bracket) => bracket.rate);
}

function Highlighted({ name, query }: { readonly name: string; readonly query: string }) {
  const needle = query.trim().toLocaleLowerCase("it");
  const at = needle === "" ? -1 : name.toLocaleLowerCase("it").indexOf(needle);
  if (at === -1) return <>{name}</>;
  return (
    <>
      {name.slice(0, at)}
      <mark className="qg-combobox__match">{name.slice(at, at + needle.length)}</mark>
      {name.slice(at + needle.length)}
    </>
  );
}

function useComuneNames() {
  return useSyncExternalStore(subscribeComuneNames, comuneNamesState, idleComuneNames);
}

export function ComuneField({
  id = "comune",
  rateId = "aliquota-comunale",
  region,
  year,
  list,
  selection,
  manual,
  manualRate,
  manualRateError,
  onLoad,
  onSelect,
  onSwitchRegion,
  onManualChange,
  onManualRateChange,
  onManualRateFocus,
  onManualRateBlur,
  defaultQuery,
  defaultListOpen = false,
}: ComuneFieldProps) {
  const t = useT();
  const locale = useLocale();
  const regions = useRegionText();
  const inputRef = useRef<HTMLInputElement>(null);
  const rateRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<Draft | null>(
    defaultQuery === undefined ? null : { region, text: defaultQuery },
  );
  const [focused, setFocused] = useState(false);
  const names = useComuneNames();

  const percent = (value: number) => formatPercent(value / 100, locale, 2);
  const selected = selection.status === "ready" ? selection.comune : null;
  const draftText = draft?.region === region ? draft.text : null;
  const shownText = draftText ?? (selected === null ? "" : comuneLabel(selected));
  const comuni = list.status === "ready" ? list.comuni : null;
  const searching =
    draftText !== null && comuneSearchKey(draftText).length >= COMUNE_SEARCH_MIN_LENGTH;
  const matches = useMemo(
    () => (comuni === null || draftText === null ? [] : searchComuni(comuni, draftText)),
    [comuni, draftText],
  );
  const unmatched =
    searching &&
    comuni !== null &&
    matches.length === 0 &&
    comuneSearchKey(draftText).length >= ELSEWHERE_MIN_LENGTH
      ? draftText
      : null;
  const elsewhere =
    unmatched !== null && names.status === "ready"
      ? findElsewhere(names.names, unmatched, region)
      : null;

  useEffect(() => {
    if (unmatched !== null) requestComuneNames();
  }, [unmatched]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input === null || input.value === input.defaultValue) return;
    const typed = input.value;
    setDraft({ region, text: typed });
    onLoad();
  }, [region, onLoad]);

  const optionMeta = (comune: Comune): string => {
    const found = comunaleRuleFor(comune, year);
    if (found === null) return "";
    const rates = ratesOf(found.rule);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    if (max === 0) return t("comune.option.none");
    if (min === max) return percent(max);
    return t("comune.option.range", { min: formatNumber(min, locale, 2), max: percent(max) });
  };

  const pick = (comune: Comune) => {
    setDraft(null);
    onSelect(comune.id);
  };

  const switchTo = (candidate: ComuneElsewhere) => {
    flushSync(() => {
      setDraft(null);
      onSwitchRegion(candidate.region, candidate.id);
    });
    inputRef.current?.focus();
  };

  const openManual = () => {
    flushSync(() => {
      setDraft(null);
      onManualChange(true);
    });
    rateRef.current?.focus();
  };

  const closeManual = () => {
    flushSync(() => {
      onManualChange(false);
    });
    inputRef.current?.focus();
  };

  if (manual) {
    const parsed = parseDecimal(manualRate.trim().replace(/\s*%$/, ""), locale);
    return (
      <Field
        id={rateId}
        label={t("comune.rate.label")}
        labelSuffix={t("field.unit.percent")}
        hint={t("comune.rate.hint", { example: formatNumber(RATE_EXAMPLE, locale) })}
        error={manualRateError}
        {...(selected !== null
          ? { after: t("comune.rate.pending", { name: selected.name }), afterTone: "note" as const }
          : parsed === null || manualRateError
            ? {}
            : { after: t("comune.rate.readAs", { rate: percent(parsed) }) })}
        alt={
          <FieldAlt stacked>
            <a href={COMUNI_SOURCE.url} lang="it">
              {t("comune.rate.lookup")}
            </a>
            <button className="qg-link-button" type="button" onClick={closeManual}>
              {t("comune.rate.back")}
            </button>
          </FieldAlt>
        }
      >
        {(control) => (
          <NumberInput
            {...control}
            kind="percent"
            name="municipalRate"
            value={manualRate}
            onValueChange={onManualRateChange}
            inputRef={rateRef}
            {...(onManualRateFocus === undefined ? {} : { onFocus: onManualRateFocus })}
            {...(onManualRateBlur === undefined ? {} : { onBlur: onManualRateBlur })}
          />
        )}
      </Field>
    );
  }

  const after = afterLine();
  const statusText =
    after?.announce ??
    (searching && comuni !== null
      ? t("comune.status", { count: matches.length, regionIn: regions.within(region) })
      : "");

  function retry(): AfterState {
    return {
      tone: "note",
      text: t("comune.loadError"),
      extra: (
        <p className="qg-field__choices">
          <button className="qg-link-button" type="button" onClick={onLoad}>
            {t("comune.retry")}
          </button>
        </p>
      ),
    };
  }

  function afterLine(): AfterState | null {
    if (draftText !== null && list.status === "error") return retry();
    if (searching && comuni === null) {
      return { tone: "quiet", text: t("comune.loading", { regionOf: regions.of(region) }) };
    }
    if (unmatched !== null) return unmatchedLine(unmatched);
    if (searching && matches.length > 0 && !focused) {
      return { tone: "note", text: t("comune.after.pick") };
    }
    return selectionLine();
  }

  function unmatchedLine(query: string): AfterState {
    const currentIn = regions.within(region);
    if (names.status === "loading" || names.status === "idle") {
      const text = t("comune.after.searching", { query, currentIn });
      return { tone: "quiet", text, announce: text };
    }
    if (elsewhere === null || elsewhere.length === 0) {
      const text = t("comune.after.notFound", { query });
      return { tone: "note", text, announce: text };
    }
    const [first] = elsewhere;
    const intro =
      elsewhere.length === 1 && first !== undefined
        ? t("comune.after.elsewhere", {
            name: first.name,
            otherIn: regions.within(first.region),
            currentIn,
          })
        : t("comune.after.maybe", { currentIn });
    const choices = elsewhere.map((candidate) => ({
      candidate,
      label: t("comune.switch", {
        name: candidate.name,
        province: candidate.province,
        otherIn: regions.within(candidate.region),
      }),
    }));
    return {
      tone: "note",
      text: intro,
      announce: [intro, ...choices.map((choice) => choice.label)].join(" "),
      extra: (
        <ul className="qg-field__choices" role="list">
          {choices.map(({ candidate, label }) => (
            <li key={candidate.id}>
              <button
                className="qg-link-button"
                type="button"
                onClick={() => {
                  switchTo(candidate);
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      ),
    };
  }

  function selectionLine(): AfterState | null {
    switch (selection.status) {
      case "none": {
        const rate = parseDecimal(manualRate.trim(), locale) ?? RATE_EXAMPLE;
        return {
          tone: "note",
          text: t("comune.after.none", { article: percentArticle(rate), rate: percent(rate) }),
        };
      }
      case "loading":
        return { tone: "quiet", text: t("comune.after.loadingRule") };
      case "missing":
        return {
          tone: "note",
          text: t("comune.after.missing", { currentIn: regions.within(region) }),
        };
      case "error":
        return retry();
      case "ready": {
        const sentences = ruleSentences(selection.comune, year, t, locale);
        if (sentences === null) return null;
        return {
          tone: "quiet",
          text: sentences.text,
          ...(sentences.note === undefined
            ? {}
            : {
                extra: (
                  <details className="qg-field__more">
                    <summary className="qg-field__more-summary">{t("comune.note.summary")}</summary>
                    <p lang="it">{sentences.note}</p>
                  </details>
                ),
              }),
        };
      }
    }
  }

  const revertDraft = () => {
    if (draftText === null) return;
    setDraft(null);
    if (draftText.trim() === "") onSelect(null);
  };

  return (
    <div
      className="qg-field-frame"
      ref={frameRef}
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && frameRef.current?.contains(next)) return;
        revertDraft();
      }}
    >
      <Field
        id={id}
        label={t("comune.label")}
        hint={t("comune.hint", { regionOf: regions.of(region) })}
        {...(after === null ? {} : { after: after.text, afterTone: after.tone })}
        alt={
          <>
            {after?.extra}
            <p className="qg-visually-hidden" role="status">
              {statusText}
            </p>
            <FieldAlt>
              <span id={`${id}-manual-hint`}>{t("comune.manual.question")}</span>{" "}
              <button
                className="qg-link-button"
                type="button"
                aria-describedby={`${id}-manual-hint`}
                onClick={openManual}
              >
                {t("comune.manual.open")}
              </button>
            </FieldAlt>
          </>
        }
      >
        {(control) => (
          <Combobox
            {...control}
            value={shownText}
            onValueChange={(text) => {
              setDraft({ region, text });
              onLoad();
            }}
            options={matches.slice(0, MAX_OPTIONS)}
            optionKey={(comune) => comune.id}
            renderOption={(comune) => (
              <>
                <span className="qg-combobox__name">
                  <Highlighted name={comuneLabel(comune)} query={draftText ?? ""} />
                </span>
                <span className="qg-combobox__meta">{optionMeta(comune)}</span>
              </>
            )}
            onPick={pick}
            onDismiss={revertDraft}
            listLabel={t("comune.listLabel", { regionOf: regions.of(region) })}
            {...(matches.length > MAX_OPTIONS
              ? { footer: t("comune.more", { count: matches.length - MAX_OPTIONS }) }
              : {})}
            inputRef={inputRef}
            defaultOpen={defaultListOpen}
            defaultActive={defaultListOpen ? 0 : -1}
            onFocus={() => {
              setFocused(true);
              onLoad();
            }}
            onBlur={() => {
              setFocused(false);
            }}
          />
        )}
      </Field>
    </div>
  );
}

interface RuleSentences {
  readonly text: string;
  readonly note?: string;
}

export function ruleSentences(
  comune: Comune,
  year: number,
  t: (key: string, values?: Readonly<Record<string, string | number>>) => string,
  locale: Locale,
): RuleSentences | null {
  const found = comunaleRuleFor(comune, year);
  if (found === null) return null;
  const percent = (value: number) => formatPercent(value / 100, locale, 2);
  const rates = ratesOf(found.rule);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const exemption = found.rule.exemption ?? 0;
  const rule =
    min === max
      ? percent(max)
      : t("comune.range", {
          fromArticle: percentArticle(min),
          min: percent(min),
          toArticle: percentArticle(max),
          max: percent(max),
        });
  const main =
    max === 0
      ? t("comune.after.zero", { name: comune.name })
      : t("comune.after.rule", {
          name: comune.name,
          rule,
          exempt: exemption > 0 ? "yes" : "no",
          amount: formatMoney(exemption, locale, { integer: true }),
        });
  const source = t("comune.after.source", {
    ruleYear: found.year,
    year,
    carried: found.year < year ? "yes" : "no",
  });
  if (found.rule.note === undefined) return { text: `${main} ${source}` };
  return { text: `${main} ${source} ${t("comune.after.note")}`, note: found.rule.note };
}

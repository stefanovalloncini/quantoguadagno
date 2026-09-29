import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { Icon } from "@/components/icons/Icon.tsx";
import type { IconName } from "@/components/icons/icons.ts";
import type { ControlProps } from "./Field.tsx";

export interface ComboboxProps<T> extends ControlProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly options: readonly T[];
  readonly optionKey: (option: T) => string;
  readonly renderOption: (option: T) => ReactNode;
  readonly onPick: (option: T) => void;
  readonly onDismiss?: () => void;
  readonly listLabel: string;
  readonly footer?: ReactNode;
  readonly icon?: IconName;
  readonly inputRef?: Ref<HTMLInputElement>;
  readonly onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  readonly onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  readonly defaultOpen?: boolean;
  readonly defaultActive?: number;
}

const LIST_EDGE_GAP = 8;
const LIST_MIN_HEIGHT = 132;

function fitListToViewport(list: HTMLElement): void {
  const viewport = window.visualViewport;
  if (!viewport) return;
  const bottom = viewport.offsetTop + viewport.height - LIST_EDGE_GAP;
  const available = bottom - list.getBoundingClientRect().top;
  list.style.maxBlockSize = `${String(Math.max(LIST_MIN_HEIGHT, Math.floor(available)))}px`;
}

function useListFitsViewport(list: HTMLElement | null, expanded: boolean): void {
  useEffect(() => {
    if (list === null || !expanded) return undefined;
    const fit = () => {
      fitListToViewport(list);
    };
    fit();
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", fit);
    viewport?.addEventListener("scroll", fit);
    return () => {
      viewport?.removeEventListener("resize", fit);
      viewport?.removeEventListener("scroll", fit);
      list.style.removeProperty("max-block-size");
    };
  }, [list, expanded]);
}

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

export function Combobox<T>({
  id,
  describedBy,
  invalid,
  value,
  onValueChange,
  options,
  optionKey,
  renderOption,
  onPick,
  onDismiss,
  listLabel,
  footer,
  icon = "search",
  inputRef,
  onFocus,
  onBlur,
  defaultOpen = false,
  defaultActive = -1,
}: ComboboxProps<T>) {
  const [open, setOpen] = useState(defaultOpen);
  const [active, setActive] = useState(defaultActive);
  const listRef = useRef<HTMLUListElement>(null);
  const [listElement, setListElement] = useState<HTMLUListElement | null>(null);
  const listId = `${id}-list`;
  const expanded = open && options.length > 0;
  useListFitsViewport(listElement, expanded);
  const activeIndex = expanded && active < options.length ? active : -1;
  const activeOption = activeIndex === -1 ? undefined : options[activeIndex];
  const optionId = (option: T) => `${id}-option-${optionKey(option)}`;

  useEffect(() => {
    if (activeIndex === -1) return;
    const element = listRef.current?.children[activeIndex];
    if (element instanceof HTMLElement) element.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const pick = (option: T) => {
    setOpen(false);
    setActive(-1);
    onPick(option);
  };

  const move = (step: number) => {
    if (options.length === 0) return;
    setOpen(true);
    setActive((current) =>
      !expanded || current === -1
        ? step > 0
          ? 0
          : options.length - 1
        : wrapIndex(current + step, options.length),
    );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (event.altKey) setOpen(true);
        else move(1);
        return;
      case "ArrowUp":
        event.preventDefault();
        move(-1);
        return;
      case "Enter": {
        const chosen = activeOption ?? (expanded && options.length === 1 ? options[0] : undefined);
        if (chosen === undefined) return;
        event.preventDefault();
        pick(chosen);
        return;
      }
      case "Escape":
        if (!expanded) {
          onDismiss?.();
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        setActive(-1);
        return;
      default:
    }
  };

  return (
    <div className="qg-combobox">
      <div className="qg-input qg-input--icon">
        <Icon name={icon} className="qg-input__icon" />
        <input
          ref={inputRef}
          className="qg-input__control"
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-activedescendant={activeOption === undefined ? undefined : optionId(activeOption)}
          aria-describedby={describedBy}
          aria-invalid={invalid ? true : undefined}
          enterKeyHint="done"
          autoComplete="off"
          autoCapitalize="words"
          spellCheck={false}
          value={value}
          onChange={(event) => {
            setOpen(true);
            setActive(-1);
            onValueChange(event.target.value);
          }}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={(event) => {
            if (activeOption !== undefined) pick(activeOption);
            setOpen(false);
            setActive(-1);
            onBlur?.(event);
          }}
        />
      </div>
      <div className="qg-combobox__popup" hidden={!expanded}>
        <ul
          className="qg-combobox__list"
          id={listId}
          role="listbox"
          aria-label={listLabel}
          ref={(element) => {
            listRef.current = element;
            setListElement(element);
          }}
        >
          {options.map((option, index) => (
            <li
              key={optionKey(option)}
              className="qg-combobox__option"
              id={optionId(option)}
              role="option"
              aria-selected={index === activeIndex}
              tabIndex={-1}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={() => {
                pick(option);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                pick(option);
              }}
            >
              {renderOption(option)}
            </li>
          ))}
        </ul>
        {footer !== undefined && <p className="qg-combobox__more">{footer}</p>}
      </div>
    </div>
  );
}

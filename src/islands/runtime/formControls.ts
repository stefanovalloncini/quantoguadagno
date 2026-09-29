export type FormControlValue = string | boolean;

export interface TypedControl {
  readonly name: string;
  readonly value: FormControlValue;
}

type NamedControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isCheckable(input: HTMLInputElement): boolean {
  return input.type === "checkbox" || input.type === "radio";
}

function defaultSelectValue(select: HTMLSelectElement): string {
  const options = [...select.options];
  const marked = options.find((option) => option.defaultSelected);
  return (marked ?? options[0])?.value ?? "";
}

function typedValueOf(control: NamedControl): FormControlValue | null {
  if (control instanceof HTMLSelectElement) {
    const current = control.value;
    return current === defaultSelectValue(control) ? null : current;
  }
  if (control instanceof HTMLTextAreaElement) {
    return control.value === control.defaultValue ? null : control.value;
  }
  if (isCheckable(control)) {
    return control.checked === control.defaultChecked ? null : control.checked;
  }
  return control.value === control.defaultValue ? null : control.value;
}

function radioGroupValue(radios: readonly HTMLInputElement[]): string | null {
  const checkedValue = radios.find((radio) => radio.checked)?.value ?? "";
  const defaultValue = radios.find((radio) => radio.defaultChecked)?.value ?? "";
  return checkedValue === defaultValue ? null : checkedValue;
}

export function findTypedControls(container: Element): readonly TypedControl[] {
  const controls = [
    ...container.querySelectorAll<NamedControl>("input[name], textarea[name], select[name]"),
  ];
  const found: TypedControl[] = [];
  const radioGroups = new Map<string, HTMLInputElement[]>();
  for (const control of controls) {
    if (control.name === "") continue;
    if (control instanceof HTMLInputElement && control.type === "radio") {
      const group = radioGroups.get(control.name) ?? [];
      group.push(control);
      radioGroups.set(control.name, group);
      continue;
    }
    const value = typedValueOf(control);
    if (value !== null) found.push({ name: control.name, value });
  }
  for (const [name, group] of radioGroups) {
    const value = radioGroupValue(group);
    if (value !== null) found.push({ name, value });
  }
  return found;
}

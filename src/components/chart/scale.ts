const NICE_FRACTIONS = [1, 2, 2.5, 5, 10] as const;
const INTEGER_NICE_FRACTIONS = [1, 2, 5, 10] as const;

function stepFrom(raw: number, fractions: readonly number[]): number {
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / magnitude;
  const nice = fractions.find((candidate) => fraction <= candidate) ?? 10;
  return nice * magnitude;
}

export function niceStep(span: number, targetTicks: number): number {
  return stepFrom(span / Math.max(1, targetTicks), NICE_FRACTIONS);
}

export function niceIntegerStep(span: number, maxTicks: number): number {
  const raw = span / Math.max(1, maxTicks - 1);
  return Math.max(1, stepFrom(raw, INTEGER_NICE_FRACTIONS));
}

export interface ValueDomain {
  readonly low: number;
  readonly high: number;
  readonly ticks: readonly number[];
}

export interface DomainOptions {
  readonly zeroBased: boolean;
  readonly targetTicks: number;
  readonly headroom: number;
}

function roundToStep(value: number, step: number): number {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 2);
  return Number(value.toFixed(decimals));
}

export function valueDomain(values: readonly number[], options: DomainOptions): ValueDomain {
  const finite = values.filter((value) => Number.isFinite(value));
  const dataMin = finite.length === 0 ? 0 : Math.min(...finite);
  const dataMax = finite.length === 0 ? 1 : Math.max(...finite);
  const spread = dataMax - dataMin || Math.abs(dataMax) || 1;
  const lowest = options.zeroBased ? Math.min(0, dataMin) : dataMin - spread * options.headroom;
  const highest = options.zeroBased ? Math.max(0, dataMax) : dataMax;
  const span = highest - lowest || Math.abs(highest) || 1;
  const step = niceStep(span, options.targetTicks);
  const low = options.zeroBased && lowest === 0 ? 0 : Math.floor(lowest / step) * step;
  const top = Math.max(highest, low + step);
  const high = top + (top - low) * options.headroom;
  const ticks: number[] = [];
  for (let tick = low; tick <= top + step * 1e-9; tick += step) {
    ticks.push(roundToStep(tick, step));
  }
  return { low, high, ticks };
}

export function linearPosition(value: number, low: number, high: number): number {
  if (high === low) return 0.5;
  return (value - low) / (high - low);
}

export function integerTicks(low: number, high: number, maxTicks: number): readonly number[] {
  if (high <= low) return [low];
  const step = niceIntegerStep(high - low, maxTicks);
  const first = Number.isInteger(low) ? low : Math.ceil(low);
  const ticks: number[] = [];
  for (let tick = first; tick <= high; tick += step) ticks.push(tick);
  return ticks;
}

export function strideFor(count: number, maxLabels: number): number {
  return Math.max(1, Math.ceil(count / Math.max(1, maxLabels)));
}

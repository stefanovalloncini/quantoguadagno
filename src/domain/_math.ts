const FLOAT_NOISE = 1e-6;

export function round(n: number, decimals = 2): number {
  const factor = 10 ** decimals;
  const scaled = n * factor;
  return Math.round(scaled + Math.sign(scaled) * FLOAT_NOISE) / factor;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function linearPhaseOut(value: number, start: number, end: number): number {
  if (value <= start) return 1;
  if (value >= end || end === start) return 0;
  return (end - value) / (end - start);
}

export function sumOfCents(amounts: readonly number[]): number {
  const cents = amounts.reduce((sum, amount) => sum + Math.round(round(amount) * 100), 0);
  return cents / 100;
}

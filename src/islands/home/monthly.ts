function toCents(value: number): number {
  return Math.round(value * 100);
}

export function monthlyShares(
  annualAmounts: readonly number[],
  divisor: number,
  targetTotal: number,
): readonly number[] {
  const exact = annualAmounts.map((amount) => (amount * 100) / divisor);
  const rounded = exact.map((value) => Math.round(value));
  let difference = toCents(targetTotal) - rounded.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, drift: value - (rounded[index] ?? 0) }))
    .sort((a, b) => (difference > 0 ? b.drift - a.drift : a.drift - b.drift));
  for (const { index } of order) {
    if (difference === 0) break;
    const step = difference > 0 ? 1 : -1;
    rounded[index] = (rounded[index] ?? 0) + step;
    difference -= step;
  }
  return rounded.map((cents) => cents / 100);
}

export const extractCurrencyValue = (value: unknown): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);

    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (
    value &&
    typeof value === 'object' &&
    'amountMicros' in value &&
    typeof (value as { amountMicros?: unknown }).amountMicros === 'number'
  ) {
    return ((value as { amountMicros: number }).amountMicros ?? 0) / 1_000_000;
  }

  return 0;
};

export function isValidDecimal(value: string): boolean {
  return /^\d*([.,]\d*)?$/.test(value);
}

export function parseDecimal(value: string): number | null {
  const parsed = Number(value.replace(",", "."));

  return Number.isNaN(parsed) ? null : parsed;
}
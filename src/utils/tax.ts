export const EXEMPT_CATEGORIES = new Set(['Servicios', 'Educación', 'Salud']);

export function getDefaultIsTaxable(category: string): boolean {
  return !EXEMPT_CATEGORIES.has(category);
}

export function getDefaultTaxRate(category: string, defaultRate: number = 0.16): number {
  return getDefaultIsTaxable(category) ? defaultRate : 0;
}

export function computeNetAmount(total: number, taxRate: number): number {
  return total / (1 + taxRate);
}

export function computeTaxAmount(total: number, netAmount: number): number {
  return total - netAmount;
}

export interface TaxBreakdown {
  netAmount: number;
  taxAmount: number;
  effectiveRate: number;
}

export function computeTaxBreakdown(total: number, isTaxable: boolean, taxRate: number): TaxBreakdown {
  if (!isTaxable || taxRate <= 0) {
    return { netAmount: total, taxAmount: 0, effectiveRate: 0 };
  }
  const netAmount = computeNetAmount(total, taxRate);
  const taxAmount = computeTaxAmount(total, netAmount);
  return { netAmount, taxAmount, effectiveRate: taxRate };
}

/**
 * Currency constants for PulseCoffee application
 * All prices are handled in Kazakhstani Tenge (KZT)
 */

export const CURRENCY = {
  CODE: 'KZT',
  SYMBOL: '₸',
  NAME: 'Kazakhstani Tenge',
  DECIMAL_PLACES: 2,
} as const;

/**
 * Format price in KZT currency
 * @param amount - Price amount in KZT
 * @returns Formatted price string with KZT symbol
 */
export function formatPrice(amount: number): string {
  return `${amount.toFixed(CURRENCY.DECIMAL_PLACES)} ${CURRENCY.SYMBOL}`;
}

/**
 * Validate price amount (must be positive)
 * @param amount - Price amount to validate
 * @returns Boolean indicating if price is valid
 */
export function isValidPrice(amount: number): boolean {
  return amount >= 0 && Number.isFinite(amount);
}

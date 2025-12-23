/**
 * Currency Utilities
 * 
 * Functions for handling currency formatting and calculations.
 * All amounts are stored in cents (integer) to avoid floating-point precision issues.
 */

/**
 * Format cents to USD currency string
 * 
 * @param cents - Amount in cents
 * @returns Formatted currency string (e.g., "$100.00")
 */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}

/**
 * Parse currency string to cents
 * 
 * @param value - Currency string (e.g., "$100.00" or "100.00")
 * @returns Amount in cents
 * @throws Error if format is invalid
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and whitespace
  const cleaned = value.replace(/[$,\s]/g, '');
  
  // Validate format
  if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new Error('Invalid currency format');
  }
  
  // Convert to cents
  const dollars = parseFloat(cleaned);
  return Math.round(dollars * 100);
}

/**
 * Calculate tax amount
 * 
 * @param amountCents - Amount in cents
 * @param taxRate - Tax rate as percentage (e.g., 8.5 for 8.5%)
 * @returns Tax amount in cents
 */
export function calculateTax(amountCents: number, taxRate: number): number {
  return Math.round((amountCents * taxRate) / 100);
}

/**
 * Calculate line item total
 * 
 * @param quantity - Quantity
 * @param unitPriceCents - Unit price in cents
 * @returns Line total in cents
 */
export function calculateLineTotal(quantity: number, unitPriceCents: number): number {
  return quantity * unitPriceCents;
}

/**
 * Calculate document totals from line items
 * 
 * @param lineItems - Array of line items
 * @returns Object with subtotal, tax, and total in cents
 */
export function calculateDocumentTotals(
  lineItems: Array<{
    quantity: number;
    unit_price_cents: number;
    tax_rate_snapshot: number | null;
  }>
): {
  subtotal_cents: number;
  tax_total_cents: number;
  total_cents: number;
} {
  let subtotal_cents = 0;
  let tax_total_cents = 0;

  for (const item of lineItems) {
    const lineTotal = calculateLineTotal(item.quantity, item.unit_price_cents);
    subtotal_cents += lineTotal;

    if (item.tax_rate_snapshot) {
      tax_total_cents += calculateTax(lineTotal, item.tax_rate_snapshot);
    }
  }

  return {
    subtotal_cents,
    tax_total_cents,
    total_cents: subtotal_cents + tax_total_cents,
  };
}

/**
 * Validate amount is positive
 * 
 * @param cents - Amount in cents
 * @returns True if positive
 */
export function isPositiveAmount(cents: number): boolean {
  return cents > 0;
}

/**
 * Validate amount is non-negative
 * 
 * @param cents - Amount in cents
 * @returns True if non-negative
 */
export function isNonNegativeAmount(cents: number): boolean {
  return cents >= 0;
}
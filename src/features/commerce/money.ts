/** Money helpers — server stores integer cents; UI formats dollars. */

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function formatCents(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(centsToDollars(cents));
}

export function formatDollars(dollars: number): string {
  return formatCents(dollarsToCents(dollars));
}

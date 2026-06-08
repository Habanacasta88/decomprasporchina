import { paisBySlug } from '../data/paises';

const ZERO_DECIMAL = new Set(['CLP', 'COP', 'JPY', 'KRW', 'VND', 'IDR']);

export function localeFor(paisSlug: string): string {
  return paisBySlug(paisSlug)?.hreflang ?? 'es-ES';
}

export function formatCurrency(amount: number, currency: string, locale: string): string {
  const fractionDigits = ZERO_DECIMAL.has(currency) ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

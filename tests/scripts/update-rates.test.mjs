import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchRates, validateRates, MONEDAS_OBJETIVO } from '../../scripts/update-rates.mjs';

describe('update-rates', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('validateRates pasa si todas las 8 monedas objetivo están y son > 0', () => {
    const rates = Object.fromEntries(MONEDAS_OBJETIVO.map((m) => [m, 1.5]));
    expect(() => validateRates(rates)).not.toThrow();
  });

  it('validateRates falla si falta alguna moneda objetivo', () => {
    const rates = { USD: 1, EUR: 0.86 };
    expect(() => validateRates(rates)).toThrow(/falta/i);
  });

  it('validateRates falla si alguna tasa es <= 0', () => {
    const rates = Object.fromEntries(MONEDAS_OBJETIVO.map((m) => [m, 1.5]));
    rates.CLP = 0;
    expect(() => validateRates(rates)).toThrow(/<= 0/);
  });

  it('fetchRates devuelve estructura normalizada cuando la API responde 200', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        result: 'success',
        base_code: 'USD',
        time_last_update_utc: 'Sun, 07 Jun 2026 00:02:31 +0000',
        time_next_update_utc: 'Mon, 08 Jun 2026 00:22:31 +0000',
        rates: Object.fromEntries(MONEDAS_OBJETIVO.map((m) => [m, 1.5])),
      }),
    });
    const r = await fetchRates();
    expect(r.source).toBe('exchangerate-api');
    expect(r.rates.CLP).toBe(1.5);
    expect(r.base).toBe('USD');
  });

  it('fetchRates lanza si la API responde con result != success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: 'error', 'error-type': 'unsupported-code' }),
    });
    await expect(fetchRates()).rejects.toThrow(/unsupported-code|error/);
  });
});

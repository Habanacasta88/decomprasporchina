import { describe, it, expect } from 'vitest';
import { monedas, monedaBySlug } from '../../src/data/monedas';

describe('monedas catalog', () => {
  it('tiene una entrada por país objetivo', () => {
    const slugs = monedas.map((m) => m.slug);
    expect(slugs).toEqual(
      expect.arrayContaining([
        'peso-chileno', 'peso-mexicano', 'sol-peruano',
        'peso-colombiano', 'peso-argentino', 'euro',
      ]),
    );
  });

  it('cada moneda mapea a un país existente', () => {
    for (const m of monedas) {
      expect(m.paisSlug).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(m.iso).toMatch(/^[A-Z]{3}$/);
    }
  });

  it('monedaBySlug funciona', () => {
    expect(monedaBySlug('sol-peruano')?.iso).toBe('PEN');
    expect(monedaBySlug('inexistente')).toBeUndefined();
  });
});

import { describe, it, expect } from 'vitest';
import { localeFor, formatCurrency } from '../../src/lib/i18n';

describe('i18n.localeFor', () => {
  it('mapea slug de país a hreflang', () => {
    expect(localeFor('chile')).toBe('es-CL');
    expect(localeFor('mexico')).toBe('es-MX');
    expect(localeFor('espana')).toBe('es-ES');
  });

  it('cae a es-ES si el slug es desconocido', () => {
    expect(localeFor('atlantida')).toBe('es-ES');
  });
});

describe('i18n.formatCurrency', () => {
  it('formatea CLP sin decimales', () => {
    expect(formatCurrency(123456.78, 'CLP', 'es-CL')).toMatch(/\$\s?123[\.  ]?457/);
  });

  it('formatea PEN con dos decimales y prefijo S/', () => {
    expect(formatCurrency(45.5, 'PEN', 'es-PE')).toMatch(/S\/?\s?\s?45[.,]50/);
  });

  it('formatea EUR con dos decimales y sufijo €', () => {
    const r = formatCurrency(12.3, 'EUR', 'es-ES');
    expect(r).toMatch(/12[.,]30/);
    expect(r).toContain('€');
  });

  it('redondea correctamente importes con muchos decimales', () => {
    const r = formatCurrency(99.999, 'EUR', 'es-ES');
    expect(r).toMatch(/100[.,]00/);
  });
});

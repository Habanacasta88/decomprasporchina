import { describe, it, expect } from 'vitest';
import { paises, paisBySlug, paisByMoneda } from '../../src/data/paises';

describe('paises catalog', () => {
  it('incluye los 6 países objetivo primarios', () => {
    const slugs = paises.map((p) => p.slug);
    expect(slugs).toEqual(
      expect.arrayContaining(['chile', 'mexico', 'peru', 'colombia', 'argentina', 'espana']),
    );
  });

  it('ordenados por prioridad ascendente (Chile primero)', () => {
    const top3 = [...paises].sort((a, b) => a.prioridad - b.prioridad).slice(0, 3);
    expect(top3.map((p) => p.slug)).toEqual(['chile', 'mexico', 'peru']);
  });

  it('cada país tiene hreflang BCP-47 válido', () => {
    for (const p of paises) {
      expect(p.hreflang).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
    }
  });

  it('paisBySlug devuelve la entrada correcta', () => {
    expect(paisBySlug('chile')?.moneda).toBe('CLP');
    expect(paisBySlug('inexistente')).toBeUndefined();
  });

  it('paisByMoneda funciona para ISO conocidos', () => {
    expect(paisByMoneda('PEN')?.slug).toBe('peru');
  });

  it('paisByMoneda devuelve algún país para USD (USD oficial en EC/PA/SV)', () => {
    const p = paisByMoneda('USD');
    expect(p).toBeDefined();
    expect(['ecuador', 'panama', 'el-salvador']).toContain(p?.slug);
  });

  it('cada slug es kebab-case sin acentos', () => {
    for (const p of paises) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

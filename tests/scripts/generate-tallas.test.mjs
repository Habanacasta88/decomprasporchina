import { describe, it, expect } from 'vitest';
import { buildTallasEntry } from '../../scripts/generate-tallas-cluster.mjs';
import { TALLAS_POR_PAIS } from '../../scripts/data/tallas-cluster-data.mjs';

describe('generate-tallas-cluster', () => {
  it('genera entry con campos requeridos para Ecuador', () => {
    const pais = TALLAS_POR_PAIS.find(p => p.paisSlug === 'ecuador');
    const entry = buildTallasEntry(pais);
    expect(entry.slug).toBe('tallas-chinas-a-ecuatorianas');
    expect(entry.type).toBe('post');
    expect(entry.title).toContain('Ecuatorianas');
    expect(entry.seoTitle.length).toBeLessThanOrEqual(60);
    expect(entry.seoDescription.length).toBeLessThanOrEqual(155);
    expect(entry.categories).toEqual(['Ropa']);
    expect(entry.body).toContain('<table>');
    expect(entry.body).toContain('/precio-aliexpress/dolar/');
    expect(entry.body).toContain('/aduana/china-a-ecuador/');
  });

  it('genera 9 entries totales', () => {
    const entries = TALLAS_POR_PAIS.map(buildTallasEntry);
    expect(entries).toHaveLength(9);
    const slugs = entries.map(e => e.slug);
    expect(new Set(slugs).size).toBe(9); // todos únicos
  });

  it('body usa sistema EU para Uruguay (no letras)', () => {
    const uy = TALLAS_POR_PAIS.find(p => p.paisSlug === 'uruguay');
    const entry = buildTallasEntry(uy);
    expect(entry.body).toContain('36');
    expect(entry.body).toContain('38');
    expect(entry.body).not.toContain('Talla China</th><th>Talla local'); // no usa 'local' literal
  });

  it('body usa sistema US para R. Dominicana en calzado', () => {
    const rd = TALLAS_POR_PAIS.find(p => p.paisSlug === 'republica-dominicana');
    const entry = buildTallasEntry(rd);
    expect(entry.body).toContain('Talla US');
    expect(entry.body).toContain('22.5'); // cm primera fila
  });
});

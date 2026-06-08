import { describe, it, expect } from 'vitest';
import { convertirTallaZapato } from '../../src/lib/convertir-talla-zapato';

describe('convertirTallaZapato', () => {
  it('CN 38 → EU 38', () => {
    expect(convertirTallaZapato('38', 'CN', 'EU')).toBe('38');
  });
  it('CN 38 → US mujer 8', () => {
    expect(convertirTallaZapato('38', 'CN', 'US-mujer')).toBe('8');
  });
  it('CN 38 → US hombre 7', () => {
    expect(convertirTallaZapato('38', 'CN', 'US-hombre')).toBe('7');
  });
  it('CN 38 → UK 5.5', () => {
    expect(convertirTallaZapato('38', 'CN', 'UK')).toBe('5.5');
  });
  it('CN 38 → JP 24', () => {
    expect(convertirTallaZapato('38', 'CN', 'JP')).toBe('24');
  });
  it('CN 99 (inválido) lanza error', () => {
    expect(() => convertirTallaZapato('99', 'CN', 'EU')).toThrow(/no encontrada/);
  });
  it('EU 40 → CN 40 (bidireccional)', () => {
    expect(convertirTallaZapato('40', 'EU', 'CN')).toBe('40');
  });
});

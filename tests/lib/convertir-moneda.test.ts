import { describe, it, expect } from 'vitest';
import { convertir } from '../../src/lib/convertir-moneda';

const rates = {
  USD: 1,
  EUR: 0.864683,
  CNY: 6.791621,
  CLP: 895.111588,
  MXN: 17.397793,
  PEN: 3.430966,
  COP: 3568.422762,
  ARS: 1442.4148,
};

describe('convertir', () => {
  it('USD → CLP convierte multiplicando directamente', () => {
    expect(convertir(10, 'USD', 'CLP', rates)).toBeCloseTo(8951.12, 0);
  });

  it('USD → EUR usa rate directo', () => {
    expect(convertir(100, 'USD', 'EUR', rates)).toBeCloseTo(86.47, 2);
  });

  it('CNY → MXN deriva vía USD', () => {
    // 100 CNY = 100/6.791621 USD = 14.7239 USD = 14.7239 * 17.397793 MXN = 256.18 MXN
    expect(convertir(100, 'CNY', 'MXN', rates)).toBeCloseTo(256.18, 1);
  });

  it('CNY → USD divide por rate de CNY', () => {
    expect(convertir(100, 'CNY', 'USD', rates)).toBeCloseTo(14.72, 2);
  });

  it('cualquier moneda → misma moneda devuelve el mismo importe', () => {
    expect(convertir(50, 'EUR', 'EUR', rates)).toBe(50);
  });

  it('lanza si la moneda no está en rates', () => {
    expect(() => convertir(10, 'XYZ' as any, 'CLP', rates)).toThrow(/XYZ/);
  });

  it('importe 0 devuelve 0', () => {
    expect(convertir(0, 'CNY', 'CLP', rates)).toBe(0);
  });
});

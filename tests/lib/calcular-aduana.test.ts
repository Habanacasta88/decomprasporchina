import { describe, it, expect } from 'vitest';
import { calcular } from '../../src/lib/calcular-aduana';
import { reglaByPais } from '../../src/data/aduana';

describe('calcular-aduana — Chile', () => {
  const r = reglaByPais('chile')!;
  it('US$100 paga solo IVA 19%', () => {
    const d = calcular({ valor: 100, envio: 0, regla: r });
    expect(d.arancel).toBeCloseTo(0);
    expect(d.iva).toBeCloseTo(19);
    expect(d.totalImpuestosUSD).toBeCloseTo(19);
  });
  it('US$600 paga arancel 6% sobre CIF + IVA 19% sobre (CIF+arancel)', () => {
    const d = calcular({ valor: 600, envio: 0, regla: r });
    expect(d.arancel).toBeCloseTo(36, 2);
    expect(d.iva).toBeCloseTo(120.84, 2);
    expect(d.totalImpuestosUSD).toBeCloseTo(156.84, 2);
  });
});

describe('calcular-aduana — México (tasa global)', () => {
  const r = reglaByPais('mexico')!;
  it('US$100 paga 33.5% como tasa global única', () => {
    const d = calcular({ valor: 100, envio: 0, regla: r });
    expect(d.arancel).toBeCloseTo(33.5, 2);
    expect(d.iva).toBeCloseTo(0);
    expect(d.totalImpuestosUSD).toBeCloseTo(33.5, 2);
    expect(d.notaTasaGlobal).toBeTruthy();
  });
  it('US$3000 supera el límite simplificado courier', () => {
    const d = calcular({ valor: 3000, envio: 0, regla: r });
    expect(d.requiereDespachoFormal).toBe(true);
  });
});

describe('calcular-aduana — Perú', () => {
  const r = reglaByPais('peru')!;
  it('US$150 FOB exento (bajo US$200)', () => {
    const d = calcular({ valor: 150, envio: 0, regla: r });
    expect(d.totalImpuestosUSD).toBeCloseTo(0);
    expect(d.exentoPorMinimis).toBe(true);
  });
  it('US$300 FOB con envío US$30: arancel 4% sobre CIF + IGV 18% sobre (CIF+arancel)', () => {
    const d = calcular({ valor: 300, envio: 30, regla: r });
    const cif = 330;
    const arancel = cif * 0.04;
    const igv = (cif + arancel) * 0.18;
    expect(d.arancel).toBeCloseTo(arancel, 2);
    expect(d.iva).toBeCloseTo(igv, 2);
    expect(d.totalImpuestosUSD).toBeCloseTo(arancel + igv, 2);
  });
});

describe('calcular-aduana — Colombia', () => {
  const r = reglaByPais('colombia')!;
  it('US$100 FOB: arancel exento, pero IVA 19% sí aplica (China sin TLC)', () => {
    const d = calcular({ valor: 100, envio: 0, regla: r });
    expect(d.arancel).toBeCloseTo(0);
    expect(d.iva).toBeCloseTo(19, 2);
  });
  it('US$300 FOB: arancel 10% + IVA 19% sobre (FOB+arancel)', () => {
    const d = calcular({ valor: 300, envio: 0, regla: r });
    const arancel = 30;
    const iva = (300 + arancel) * 0.19;
    expect(d.arancel).toBeCloseTo(arancel, 2);
    expect(d.iva).toBeCloseTo(iva, 2);
  });
});

describe('calcular-aduana — Argentina (franquicia courier)', () => {
  const r = reglaByPais('argentina')!;
  it('US$300 FOB: bajo franquicia US$400, solo IVA 21%', () => {
    const d = calcular({ valor: 300, envio: 0, regla: r });
    expect(d.arancel).toBeCloseTo(0);
    expect(d.iva).toBeCloseTo(63, 2);
  });
  it('US$600 FOB: arancel 50% sobre excedente (200) + IVA 21% sobre 600', () => {
    const d = calcular({ valor: 600, envio: 0, regla: r });
    const excedente = 200;
    const arancel = excedente * 0.5;
    const iva = 600 * 0.21;
    expect(d.arancel).toBeCloseTo(arancel, 2);
    expect(d.iva).toBeCloseTo(iva, 2);
  });
});

describe('calcular-aduana — España', () => {
  const r = reglaByPais('espana')!;
  it('100 EUR antes del 2026-07-01: IVA 21% sin arancel ni tasa adicional', () => {
    const d = calcular({ valor: 100, envio: 0, regla: r, now: new Date('2026-06-30') });
    expect(d.arancel).toBeCloseTo(0);
    expect(d.iva).toBeCloseTo(21, 2);
    expect(d.tasaAdicional).toBeCloseTo(0);
  });
  it('100 EUR desde el 2026-07-01: añade 3€ fijos (Reglamento UE 2026/382)', () => {
    const d = calcular({ valor: 100, envio: 0, regla: r, now: new Date('2026-07-01') });
    expect(d.arancel).toBeCloseTo(0);
    expect(d.iva).toBeCloseTo(21, 2);
    expect(d.tasaAdicional).toBeCloseTo(3, 2);
    expect(d.totalImpuestosUSD).toBeCloseTo(24, 2);
  });
  it('200 EUR desde el 2026-07-01: SIN tasa fija (supera 150€)', () => {
    const d = calcular({ valor: 200, envio: 0, regla: r, now: new Date('2026-07-01') });
    expect(d.tasaAdicional).toBeCloseTo(0);
    expect(d.iva).toBeCloseTo(42, 2);
  });
});

describe('calcular-aduana — Ecuador (régimen 4x4)', () => {
  const r = reglaByPais('ecuador')!;
  it('US$50 paga US$20 fijos + FODINFA 0.5%', () => {
    const d = calcular({ valor: 50, envio: 0, regla: r });
    expect(d.arancel).toBeCloseTo(20, 2);
    expect(d.iva).toBeCloseTo(0);
    expect(d.tasaAdicional).toBeCloseTo(0.25, 2);
    expect(d.totalImpuestosUSD).toBeCloseTo(20.25, 2);
    expect(d.notaTasaGlobal).toBeTruthy();
  });
  it('US$400 paga US$20 fijos + US$2 FODINFA', () => {
    const d = calcular({ valor: 400, envio: 0, regla: r });
    expect(d.totalImpuestosUSD).toBeCloseTo(22.00, 2);
  });
  it('US$600 supera tope 4x4 — Categoría C con arancel variable + IVA 15%', () => {
    const d = calcular({ valor: 600, envio: 0, regla: r });
    // Cat C: arancel 20% (proxy) + IVA 15% sobre (CIF+arancel) + FODINFA 0.5%
    expect(d.arancel).toBeCloseTo(120, 1); // 600 * 0.20
    expect(d.iva).toBeCloseTo(108, 1); // (600+120)*0.15
    expect(d.tasaAdicional).toBeCloseTo(3, 2); // FODINFA
    expect(d.totalImpuestosUSD).toBeCloseTo(231, 1);
  });
});

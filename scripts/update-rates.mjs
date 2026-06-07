#!/usr/bin/env node
/**
 * Refresca src/data/rates.json desde ExchangeRate-API Open Access.
 *
 * Estrategia:
 *  1. Fetch principal: https://open.er-api.com/v6/latest/USD
 *  2. Fallback 1:     https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json
 *  3. Fallback 2:     mantener rates.json anterior (no sobreescribir)
 *  4. Fallback 3:     hardcoded de emergencia si no existe rates.json
 *
 * NUNCA hace process.exit(1) por fallo de fetch — solo por error de escritura.
 * Pensado para correr en CI antes de build (o manualmente: `node scripts/update-rates.mjs`).
 */
import { readFile, writeFile, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RATES_PATH = resolve(__dirname, '..', 'src', 'data', 'rates.json');

export const MONEDAS_OBJETIVO = [
  'USD', 'EUR', 'CNY',
  'CLP', 'MXN', 'PEN', 'COP', 'ARS', // 6 primarios
  'VES', 'GTQ', 'CRC', 'UYU', 'BOB', 'DOP', // 6 secundarios (USD ya está para EC/PA/SV)
];

const EMERGENCY_RATES = {
  base: 'USD', source: 'hardcoded-emergency', fetchedAt: '2026-01-01T00:00:00Z',
  stale: true,
  rates: {
    USD: 1, EUR: 0.92, CNY: 7.2,
    CLP: 920, MXN: 17.5, PEN: 3.7, COP: 4100, ARS: 1000,
    VES: 40, GTQ: 7.7, CRC: 510, UYU: 39, BOB: 6.9, DOP: 60,
  },
};

export function validateRates(rates) {
  for (const m of MONEDAS_OBJETIVO) {
    if (!(m in rates)) throw new Error(`Validación rates: falta moneda objetivo ${m}`);
    if (typeof rates[m] !== 'number' || rates[m] <= 0) {
      throw new Error(`Validación rates: ${m} <= 0 o no es número (${rates[m]})`);
    }
  }
  return true;
}

function pick(rates) {
  const out = {};
  for (const m of MONEDAS_OBJETIVO) out[m] = rates[m];
  return out;
}

export async function fetchRates() {
  const r = await fetch('https://open.er-api.com/v6/latest/USD', {
    headers: { 'User-Agent': 'decomprasporchina-build/1.0' },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} desde open.er-api.com`);
  const j = await r.json();
  if (j.result !== 'success') throw new Error(`API error: ${j['error-type'] ?? 'unknown'}`);
  const rates = pick(j.rates);
  validateRates(rates);
  const toIso = (unix) => {
    const n = Number(unix);
    if (!Number.isFinite(n) || n <= 0) return new Date().toISOString();
    return new Date(n * 1000).toISOString();
  };
  return {
    base: j.base_code,
    source: 'exchangerate-api',
    fetchedAt: toIso(j.time_last_update_unix),
    providerNextUpdate: toIso(j.time_next_update_unix),
    rates,
  };
}

export async function fetchRatesFallback() {
  const r = await fetch(
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
  );
  if (!r.ok) throw new Error(`HTTP ${r.status} desde fawazahmed0`);
  const j = await r.json();
  const raw = j.usd ?? j.USD ?? {};
  const upper = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toUpperCase(), v]));
  const rates = pick(upper);
  validateRates(rates);
  return {
    base: 'USD',
    source: 'fawazahmed0-fallback',
    fetchedAt: new Date().toISOString(),
    rates,
  };
}

async function writeAtomic(data) {
  const tmp = RATES_PATH + '.tmp';
  await writeFile(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  await rename(tmp, RATES_PATH);
}

async function main() {
  try {
    const fresh = await fetchRates();
    await writeAtomic(fresh);
    console.log(`[update-rates] ✓ exchangerate-api ${fresh.fetchedAt}`);
    return;
  } catch (e) {
    console.warn(`[update-rates] proveedor principal falló: ${e.message}`);
  }
  try {
    const fresh = await fetchRatesFallback();
    await writeAtomic(fresh);
    console.warn(`[update-rates] ✓ fawazahmed0 (fallback) ${fresh.fetchedAt}`);
    return;
  } catch (e) {
    console.warn(`[update-rates] fallback fawazahmed0 falló: ${e.message}`);
  }
  if (existsSync(RATES_PATH)) {
    const current = JSON.parse(await readFile(RATES_PATH, 'utf8'));
    const ageMs = Date.now() - new Date(current.fetchedAt).getTime();
    const ageDays = Math.round(ageMs / 86400000);
    console.warn(`[update-rates] ⚠ usando snapshot antiguo de ${ageDays} días`);
    return;
  }
  await writeAtomic(EMERGENCY_RATES);
  console.warn('[update-rates] ⚠ usado snapshot de emergencia hardcoded');
}

if (import.meta.url === `file://${process.argv[1]}`) main();

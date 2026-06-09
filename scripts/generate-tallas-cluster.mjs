#!/usr/bin/env node
/**
 * Genera 9 entries `tallas-chinas-a-{gentilicio}` en posts.json.
 * Idempotente: si un slug ya existe, lo saltea (con warning).
 *
 * Uso:
 *   node scripts/generate-tallas-cluster.mjs           # genera todos
 *   node scripts/generate-tallas-cluster.mjs --dry-run # solo imprime
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  TALLAS_POR_PAIS,
  ROPA_MUJER_LETRA, ROPA_MUJER_EU,
  ROPA_HOMBRE_LETRA, ROPA_HOMBRE_EU,
  CALZADO_EU, CALZADO_US,
} from './data/tallas-cluster-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_PATH = resolve(__dirname, '..', 'src', 'data', 'posts.json');

function ropaMujerTable(pais) {
  const filas = pais.sistemaRopa === 'EU' ? ROPA_MUJER_EU : ROPA_MUJER_LETRA;
  const colLocal = pais.sistemaRopa === 'EU' ? `Talla ${pais.paisNombre}` : 'Talla local';
  const rows = filas.map(r => `<tr><td>${r.china}</td><td>${r.local}</td><td>${r.pecho}</td><td>${r.cintura}</td></tr>`).join('');
  return `<table><thead><tr><th>Talla china</th><th>${colLocal}</th><th>Pecho (cm)</th><th>Cintura (cm)</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function ropaHombreTable(pais) {
  const filas = pais.sistemaRopa === 'EU' ? ROPA_HOMBRE_EU : ROPA_HOMBRE_LETRA;
  const colLocal = pais.sistemaRopa === 'EU' ? `Talla ${pais.paisNombre}` : 'Talla local';
  const rows = filas.map(r => `<tr><td>${r.china}</td><td>${r.local}</td><td>${r.pecho}</td></tr>`).join('');
  return `<table><thead><tr><th>Talla china</th><th>${colLocal}</th><th>Pecho (cm)</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function calzadoTable(pais) {
  if (pais.sistemaCalzado === 'US') {
    const rows = CALZADO_US.map(r => `<tr><td>${r.china}</td><td>${r.localMujer}</td><td>${r.localHombre}</td><td>${r.cm}</td></tr>`).join('');
    return `<table><thead><tr><th>Talla china (EU)</th><th>Talla US mujer</th><th>Talla US hombre</th><th>Longitud pie (cm)</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  const rows = CALZADO_EU.map(r => `<tr><td>${r.china}</td><td>${r.local}</td><td>${r.cm}</td></tr>`).join('');
  return `<table><thead><tr><th>Talla china (EU)</th><th>Talla ${pais.paisNombre}</th><th>Longitud pie (cm)</th></tr></thead><tbody>${rows}</tbody></table>`;
}

export function buildTallasEntry(pais) {
  const Gent = pais.gentilicio.charAt(0).toUpperCase() + pais.gentilicio.slice(1);
  const body = `<p>Comprar ropa china desde ${pais.paisNombre} en AliExpress, Shein o Temu puede salir muy bien de precio, pero el sistema de tallas chino sigue convenciones distintas. Esta guia te ayuda a elegir tu talla correcta convirtiendola al sistema ${pais.gentilicio}.</p>

<h2>Tabla de tallas de mujer: China a ${pais.paisNombre}</h2>
<p>${pais.notaCompra}</p>
${ropaMujerTable(pais)}

<h2>Tabla de tallas de hombre: China a ${pais.paisNombre}</h2>
<p>Para hombre, las tallas chinas tienden a ser mas justas que las ${pais.gentilicio}. Si tienes dudas, pide una talla por encima de la habitual.</p>
${ropaHombreTable(pais)}

<h2>Tallas de calzado: China a ${pais.paisNombre}</h2>
<p>El calzado chino usa principalmente el sistema europeo (EU). Mide la longitud de tu pie en centimetros y usa esta tabla:</p>
${calzadoTable(pais)}

<h2>Consejos para acertar con tu talla</h2>
<p>1. <strong>Mide siempre antes de comprar</strong>: las tallas chinas tienden a ser mas pequenas. Es habitual pedir una talla por encima de la habitual.</p>
<p>2. <strong>Consulta la tabla del vendedor</strong>: aunque AliExpress y Shein muestran tablas globales, cada vendedor puede tener su interpretacion. La tabla especifica del producto prevalece.</p>
<p>3. <strong>Lee resenas con fotos</strong>: cuando otros compradores publican fotos, comprueba si el ajuste se ve como esperabas.</p>
<p>4. <strong>Otras herramientas para comprar desde ${pais.paisNombre}</strong>: <a href="/precio-aliexpress/${pais.monedaSlug}/">convierte el precio</a> y revisa la <a href="/aduana/china-a-${pais.paisSlug}/">aduana e impuestos</a>.</p>

<p>Con estas tablas y consejos podras comprar ropa y zapatos chinos desde ${pais.paisNombre} con mucha mas confianza.</p>`;

  const today = new Date().toISOString().replace('T',' ').slice(0,19);
  return {
    slug: pais.slug,
    title: `Tallas Chinas a ${Gent} 2026: Tabla de Equivalencias`,
    seoTitle: `Tallas Chinas a ${Gent} 2026: Tabla Ropa + Calzado`,
    seoDescription: `Equivalencias de tallas chinas a ${pais.gentilicio} para ropa de mujer, hombre y calzado. Tablas claras para AliExpress, Shein y Temu.`.slice(0, 155),
    body,
    type: 'post',
    categories: ['Ropa'],
    date: today,
    modified: today,
    featuredImage: '/images/conversor-tallas-chinas.webp',
  };
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const posts = JSON.parse(await readFile(POSTS_PATH, 'utf8'));
  const existing = new Set(posts.map(p => p.slug));
  let added = 0, skipped = 0;
  for (const pais of TALLAS_POR_PAIS) {
    if (existing.has(pais.slug)) {
      console.warn(`[skip] ${pais.slug} ya existe`);
      skipped++;
      continue;
    }
    const entry = buildTallasEntry(pais);
    if (!isDryRun) posts.push(entry);
    console.log(`[add] ${pais.slug} (${entry.body.length} chars)`);
    added++;
  }
  if (!isDryRun && added > 0) {
    await writeFile(POSTS_PATH, JSON.stringify(posts, null, 2));
  }
  console.log(`Generador tallas: ${added} añadidos, ${skipped} saltados. Total posts: ${posts.length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();

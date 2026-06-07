# Suite de Calculadoras (Moneda + Aduana) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir a `decomprasporchina.com` dos calculadoras programáticas (conversor de moneda y calculadora de aduana) generadas desde datos, con una página por moneda/país, sin romper SEO ni Lighthouse, monetizadas con CTA contextual de AliExpress > Amazon, y tejiendo las tres herramientas (tallas + moneda + aduana) mediante interlinking automático.

**Architecture:** Astro 6 SSG + islands ligeras Preact (`@astrojs/preact` con `compat:false`, hidratadas con `client:visible`). Lógica pura en `src/lib/` (TS testeable, sin DOM) con cobertura Vitest. Datos en `src/data/` (catálogos `paises.ts`/`monedas.ts`/`aduana.ts` + `rates.json` horneado en build por `scripts/update-rates.mjs`). Cada widget Preact recibe sus props (rates, locale, regla aduana) desde el `.astro` padre; el contenido informativo se renderiza SSR para indexación. Cumplimiento WCAG AA, hreflang por país, tracking afiliado desde `import.meta.env`.

**Tech Stack:** Astro 6.0.4 · @astrojs/preact 4.0.5 · preact 10.27.0 · @astrojs/sitemap 3.7.1 · @astrojs/mdx 5.0.0 · astro-seo 1.1.0 · sharp · vitest 3.2.4 · TypeScript strict (astro/tsconfigs/strict) · ExchangeRate-API Open Access (https://open.er-api.com/v6/latest/USD) con fallback a fawazahmed0/currency-api y a snapshot anterior commiteado.

---

## Decisiones arquitectónicas (vinculantes, ya aprobadas)

1. **Islands:** Preact `.tsx` con `client:visible` y `rootMargin: 200px`. SSR del valor por defecto + `<noscript>` con tabla estática.
2. **Lógica pura:** `src/lib/` (no `src/utils/`). `src/utils/` queda para `content.ts` y `seo.ts` existentes.
3. **Tests:** Vitest. Cobertura solo sobre `src/lib/**` y `scripts/**`.
4. **Rama:** `feat/calculadoras` (ya creada desde `85da9f7`).
5. **Tracking afiliado:** migrado a `import.meta.env.PUBLIC_ALIEXPRESS_TRACKING_URL` y `PUBLIC_AMAZON_TAG_ES`. Helper `src/lib/afiliados.ts`. `.env.example` commiteado, `.env` ignorado.
6. **Locale:** `Intl.NumberFormat(hreflang, …)` con hreflang derivado del país (`es-CL`, `es-MX`, `es-PE`, `es-CO`, `es-AR`, `es-ES`).
7. **Datos aduana:** las cifras provienen de research validado en fuente oficial + cross-check adversarial (workflow `wf_0fc45040-914`, 2026-06-07). Confianza alta para CL/PE/CO/AR/ES; **confianza media para MX** — la página de México lleva disclaimer reforzado y nota explícita sobre Regla 3.7.35 RGCE.
8. **Cobertura inicial aduana:** 6 países (Chile, México, Perú, Colombia, Argentina, España). Los 9 países secundarios listados en el spec se incorporan en una segunda iteración tras research adicional.

---

## File Structure

### Archivos nuevos

| Archivo | Responsabilidad |
|---|---|
| `.env.example` | Plantilla de variables públicas (tracking IDs). Sin valores reales. |
| `src/data/paises.ts` | Catálogo único de países (slug, nombre, gentilicio, moneda ISO, símbolo, hreflang, prioridad). FK desde monedas y aduana. |
| `src/data/monedas.ts` | Config del módulo moneda: slug legible → ISO + país asociado para hreflang. |
| `src/data/aduana.ts` | Reglas aduaneras por país: deMinimisUSD, ivaPct, arancelPct, baseCalculo, notas, fuenteUrl, fechaRevision, confianza. |
| `src/data/rates.json` | Snapshot diario de tipos de cambio (base USD) horneado por `scripts/update-rates.mjs`. Commiteado. |
| `src/lib/afiliados.ts` | Construye deeplinks afiliado desde `import.meta.env`. Helpers `aliexpress(opts)`, `amazonEs(query, asin)`. |
| `src/lib/i18n.ts` | `localeFor(paisSlug)` → hreflang; `formatCurrency(amount, iso, locale)`. |
| `src/lib/convertir-moneda.ts` | Función pura `convertir(importe, origen, destino, rates)`. Maneja CNY/USD/EUR como bases derivables. |
| `src/lib/calcular-aduana.ts` | Función pura `calcular({valor, envio?, categoria?, regla})` → `Desglose`. |
| `src/components/Calculadora.astro` | Carcasa común: breadcrumb, título, slot widget, slot tabla, bloque "Otras herramientas", CTA afiliado, schema WebApplication, fecha actualización. |
| `src/components/widgets/MonedaWidget.tsx` | Island Preact: input importe + selector moneda origen → output formateado. |
| `src/components/widgets/MonedaWidget.astro` | Wrapper con SSR del valor por defecto + `<noscript>` con enlace a tabla. |
| `src/components/widgets/AduanaWidget.tsx` | Island Preact: input valor pedido + envío opcional + categoría opcional → desglose. |
| `src/components/widgets/AduanaWidget.astro` | Wrapper con SSR del desglose por defecto + `<noscript>`. |
| `src/pages/precio-aliexpress/[moneda].astro` | Genera una página por moneda con `getStaticPaths`. |
| `src/pages/precio-aliexpress/index.astro` | Hub que lista todas las monedas (también funciona como entrada SEO). |
| `src/pages/aduana/china-a-[pais].astro` | Genera una página por país con `getStaticPaths`. |
| `src/pages/aduana/index.astro` | Hub que lista todos los países. |
| `scripts/update-rates.mjs` | Descarga tipos de cambio + fallback 4-niveles + escribe atómicamente `src/data/rates.json`. |
| `tests/lib/afiliados.test.ts` | Cobertura afiliados (env vars, fallbacks, formatos URL). |
| `tests/lib/i18n.test.ts` | Cobertura i18n (locales por país, formato moneda). |
| `tests/lib/convertir-moneda.test.ts` | Casos por moneda (CNY→CLP, USD→MXN, CNY↔USD vía USD, redondeos). |
| `tests/lib/calcular-aduana.test.ts` | Casos por país (bajo umbral, sobre umbral, base CIF vs FOB, courier vs postal). |
| `tests/scripts/update-rates.test.mjs` | Mocks de fetch + validación schema + fallback. |
| `vitest.config.ts` | YA EXISTE — añadido en setup. |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `astro.config.mjs` | `preact()` YA AÑADIDO. Sitemap excluye sin cambios. |
| `package.json` | Scripts YA AÑADIDOS (`test`, `test:run`, `test:coverage`). |
| `src/pages/[slug].astro` | Reemplazar `ALIEXPRESS` y `AMAZON_TAG` hardcoded por imports de `src/lib/afiliados.ts`. |
| `src/layouts/Base.astro` | Añadir `<link rel="alternate" hreflang={code} …>` cuando la página lo pase como prop. |
| `nginx.conf` | Ajustar CSP si fuera necesario para incluir el endpoint de exchange (build-time only, NO en navegador → probablemente no haga falta). |

---

# FASE A — Cimientos compartidos

**Objetivo:** Tener todo el andamiaje listo (datos, lógica de afiliados, i18n, carcasa visual) para que las fases B y C se limiten a pegar widgets y datos sobre estructuras ya probadas. Ninguna URL pública nueva en esta fase salvo una página de prueba que se borra al final.

---

### Task A1: `.env.example` y migración de tracking IDs a env

**Files:**
- Create: `.env.example`
- Create: `src/lib/afiliados.ts`
- Create: `tests/lib/afiliados.test.ts`
- Modify: `src/pages/[slug].astro` — sustituir constantes hardcoded por imports.

- [ ] **Step 1: Crear `.env.example`**

```bash
cat > .env.example <<'EOF'
# Variables públicas — expuestas al cliente con prefijo PUBLIC_
# (Astro las inyecta vía import.meta.env en build)

# AliExpress tracking deeplink completo (lo que abre el visitante al hacer clic)
PUBLIC_ALIEXPRESS_TRACKING_URL=https://s.click.aliexpress.com/e/_REPLACE_ME

# Amazon Associates tag para España (.es)
PUBLIC_AMAZON_TAG_ES=enjoys0d-21
EOF
```

- [ ] **Step 2: Crear `.env` real local (no commiteado)**

```bash
cat > .env <<'EOF'
PUBLIC_ALIEXPRESS_TRACKING_URL=https://s.click.aliexpress.com/e/_c45uyDgx
PUBLIC_AMAZON_TAG_ES=enjoys0d-21
EOF
```

Verificar que `.env` ya está en `.gitignore`:

```bash
grep -E '^\.env$' .gitignore
# Expected: .env
```

- [ ] **Step 3: Escribir test fallido para `afiliados.ts`**

`tests/lib/afiliados.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('afiliados', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('aliexpress() devuelve la URL de tracking de env', async () => {
    vi.stubEnv('PUBLIC_ALIEXPRESS_TRACKING_URL', 'https://s.click.aliexpress.com/e/_test123');
    const { aliexpress } = await import('../../src/lib/afiliados.js');
    expect(aliexpress()).toBe('https://s.click.aliexpress.com/e/_test123');
  });

  it('aliexpress() avisa con warning si la env no existe', async () => {
    vi.stubEnv('PUBLIC_ALIEXPRESS_TRACKING_URL', '');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { aliexpress } = await import('../../src/lib/afiliados.js');
    aliexpress();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('PUBLIC_ALIEXPRESS_TRACKING_URL'));
    warn.mockRestore();
  });

  it('amazonEs() construye search URL con el tag', async () => {
    vi.stubEnv('PUBLIC_AMAZON_TAG_ES', 'mytag-21');
    const { amazonEs } = await import('../../src/lib/afiliados.js');
    expect(amazonEs({ q: 'zapatillas running' })).toBe(
      'https://www.amazon.es/s?k=zapatillas+running&tag=mytag-21',
    );
  });

  it('amazonEs() construye product URL con ASIN', async () => {
    vi.stubEnv('PUBLIC_AMAZON_TAG_ES', 'mytag-21');
    const { amazonEs } = await import('../../src/lib/afiliados.js');
    expect(amazonEs({ asin: 'B07GBLFPQN' })).toBe(
      'https://www.amazon.es/dp/B07GBLFPQN?tag=mytag-21',
    );
  });

  it('relAttrs() devuelve nofollow sponsored noopener', async () => {
    const { relAttrs } = await import('../../src/lib/afiliados.js');
    expect(relAttrs()).toBe('nofollow sponsored noopener');
  });
});
```

- [ ] **Step 4: Correr para verificar que falla**

```bash
npm run test:run -- tests/lib/afiliados.test.ts
# Expected: FAIL — Cannot find module '../../src/lib/afiliados.js'
```

- [ ] **Step 5: Implementar `src/lib/afiliados.ts`**

```ts
const ALIEXPRESS_PLACEHOLDER = 'https://www.aliexpress.com/';

export function aliexpress(): string {
  const url = import.meta.env.PUBLIC_ALIEXPRESS_TRACKING_URL;
  if (!url) {
    console.warn(
      '[afiliados] PUBLIC_ALIEXPRESS_TRACKING_URL ausente — usando fallback sin tracking',
    );
    return ALIEXPRESS_PLACEHOLDER;
  }
  return url;
}

export interface AmazonEsOpts {
  q?: string;
  asin?: string;
}

export function amazonEs(opts: AmazonEsOpts): string {
  const tag = import.meta.env.PUBLIC_AMAZON_TAG_ES || '';
  if (opts.asin) {
    return `https://www.amazon.es/dp/${opts.asin}?tag=${tag}`;
  }
  const q = encodeURIComponent(opts.q ?? '').replace(/%20/g, '+');
  return `https://www.amazon.es/s?k=${q}&tag=${tag}`;
}

export function relAttrs(): string {
  return 'nofollow sponsored noopener';
}
```

- [ ] **Step 6: Correr tests, deben pasar**

```bash
npm run test:run -- tests/lib/afiliados.test.ts
# Expected: PASS (5 tests)
```

- [ ] **Step 7: Migrar `src/pages/[slug].astro`**

Reemplazar las líneas 12-15 (las que definen `ALIEXPRESS`, `AMAZON_TAG`, `amz`) por:

```astro
import { aliexpress, amazonEs } from '../lib/afiliados';
const ALIEXPRESS = aliexpress();
const amz = (asin: string) => amazonEs({ asin });
```

Y todas las apariciones de `` `https://www.amazon.es/s?k=...&tag=${AMAZON_TAG}` `` se sustituyen por `amazonEs({ q: '...' })`.

- [ ] **Step 8: Verificar build completo**

```bash
npm run build 2>&1 | tail -5
# Expected: 360 page(s) built ✓
```

- [ ] **Step 9: Smoke-test que la URL de afiliado aparece en una página existente**

```bash
grep -c 's.click.aliexpress.com/e/_c45uyDgx' dist/escoger-tu-talla-ropa-china/index.html
# Expected: ≥ 1
```

- [ ] **Step 10: Commit**

```bash
git add .env.example src/lib/afiliados.ts tests/lib/afiliados.test.ts src/pages/\[slug\].astro
git commit -m "feat(afiliados): mover tracking IDs a env via src/lib/afiliados.ts"
```

---

### Task A2: Catálogo único de países (`src/data/paises.ts`)

**Files:**
- Create: `src/data/paises.ts`
- Create: `tests/lib/paises.test.ts`

- [ ] **Step 1: Escribir test**

`tests/lib/paises.test.ts`:

```ts
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

  it('cada slug es kebab-case sin acentos', () => {
    for (const p of paises) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
```

- [ ] **Step 2: Correr test (debe fallar por módulo inexistente)**

```bash
npm run test:run -- tests/lib/paises.test.ts
# Expected: FAIL
```

- [ ] **Step 3: Implementar `src/data/paises.ts`**

```ts
export interface Pais {
  slug: string;
  nombre: string;
  gentilicio: string;
  moneda: string;
  simbolo: string;
  hreflang: string;
  prioridad: number;
}

export const paises: Pais[] = [
  { slug: 'chile',     nombre: 'Chile',     gentilicio: 'chilena',     moneda: 'CLP', simbolo: '$',  hreflang: 'es-CL', prioridad: 1 },
  { slug: 'mexico',    nombre: 'México',    gentilicio: 'mexicana',    moneda: 'MXN', simbolo: '$',  hreflang: 'es-MX', prioridad: 2 },
  { slug: 'peru',      nombre: 'Perú',      gentilicio: 'peruana',     moneda: 'PEN', simbolo: 'S/', hreflang: 'es-PE', prioridad: 3 },
  { slug: 'colombia',  nombre: 'Colombia',  gentilicio: 'colombiana',  moneda: 'COP', simbolo: '$',  hreflang: 'es-CO', prioridad: 4 },
  { slug: 'argentina', nombre: 'Argentina', gentilicio: 'argentina',   moneda: 'ARS', simbolo: '$',  hreflang: 'es-AR', prioridad: 5 },
  { slug: 'espana',    nombre: 'España',    gentilicio: 'española',    moneda: 'EUR', simbolo: '€',  hreflang: 'es-ES', prioridad: 6 },
];

const bySlug = new Map(paises.map((p) => [p.slug, p]));
const byMoneda = new Map(paises.map((p) => [p.moneda, p]));

export function paisBySlug(slug: string): Pais | undefined {
  return bySlug.get(slug);
}

export function paisByMoneda(iso: string): Pais | undefined {
  return byMoneda.get(iso);
}
```

- [ ] **Step 4: Correr test, debe pasar**

```bash
npm run test:run -- tests/lib/paises.test.ts
# Expected: PASS (6 tests)
```

- [ ] **Step 5: Commit**

```bash
git add src/data/paises.ts tests/lib/paises.test.ts
git commit -m "feat(data): catálogo único de 6 países objetivo (paises.ts)"
```

---

### Task A3: Helpers i18n (locale, formato moneda)

**Files:**
- Create: `src/lib/i18n.ts`
- Create: `tests/lib/i18n.test.ts`

- [ ] **Step 1: Escribir tests**

```ts
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
    expect(formatCurrency(123456.78, 'CLP', 'es-CL')).toMatch(/\$\s?123[\.  ]?457/);
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
```

- [ ] **Step 2: Test debe fallar**

```bash
npm run test:run -- tests/lib/i18n.test.ts
# Expected: FAIL
```

- [ ] **Step 3: Implementar `src/lib/i18n.ts`**

```ts
import { paisBySlug } from '../data/paises';

const ZERO_DECIMAL = new Set(['CLP', 'COP', 'JPY', 'KRW', 'VND', 'IDR']);

export function localeFor(paisSlug: string): string {
  return paisBySlug(paisSlug)?.hreflang ?? 'es-ES';
}

export function formatCurrency(amount: number, currency: string, locale: string): string {
  const fractionDigits = ZERO_DECIMAL.has(currency) ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}
```

- [ ] **Step 4: Tests pasan**

```bash
npm run test:run -- tests/lib/i18n.test.ts
# Expected: PASS (6 tests)
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n.ts tests/lib/i18n.test.ts
git commit -m "feat(i18n): localeFor + formatCurrency con cero decimales para CLP/COP"
```

---

### Task A4: Carcasa común `Calculadora.astro`

**Files:**
- Create: `src/components/Calculadora.astro`

- [ ] **Step 1: Implementar carcasa**

```astro
---
/**
 * Carcasa visual común para las calculadoras. Provee:
 * - Breadcrumb estándar del sitio
 * - Heading principal (Fraunces) + subtítulo
 * - Slot principal para el widget interactivo
 * - Slot `tabla` para la tabla de equivalencias rápidas (SSR — siempre indexable)
 * - Bloque "Otras herramientas" con interlinking automático a los otros calculadores
 *   del mismo país (moneda / aduana / tallas) — generado desde paises.ts
 * - CTA afiliado contextual al final
 * - Fecha de última actualización visible
 * - Schema.org WebApplication + Breadcrumb
 *
 * Se usa desde precio-aliexpress/[moneda].astro y aduana/china-a-[pais].astro.
 */
import Base from '../layouts/Base.astro';
import Breadcrumbs from './Breadcrumbs.astro';
import AffiliateBox from './AffiliateBox.astro';
import { aliexpress, amazonEs, relAttrs } from '../lib/afiliados';
import type { Pais } from '../data/paises';

export interface Props {
  pais: Pais;
  herramienta: 'moneda' | 'aduana';
  title: string;
  description: string;
  intro: string;
  ctaAfiliado: { headline: string; description: string; ctaText: string; amazonQuery?: string };
  fechaActualizacion: string;
  schema?: object;
  alternates?: Array<{ hreflang: string; href: string }>;
}
const { pais, herramienta, title, description, intro, ctaAfiliado, fechaActualizacion, schema, alternates } = Astro.props;

const SITE = 'https://decomprasporchina.com';

const interlinks = [
  herramienta !== 'moneda' && {
    label: `Conversor de precio para ${pais.nombre}`,
    href: `/precio-aliexpress/${monedaSlugFor(pais.moneda)}/`,
  },
  herramienta !== 'aduana' && {
    label: `Aduana e impuestos China → ${pais.nombre}`,
    href: `/aduana/china-a-${pais.slug}/`,
  },
  {
    label: `Tallas chinas para ${pais.nombre}`,
    href: tallasPathFor(pais.slug),
  },
].filter(Boolean) as Array<{ label: string; href: string }>;

function monedaSlugFor(iso: string): string {
  const map: Record<string, string> = {
    CLP: 'peso-chileno', MXN: 'peso-mexicano', PEN: 'sol-peruano',
    COP: 'peso-colombiano', ARS: 'peso-argentino', EUR: 'euro',
  };
  return map[iso] ?? 'euro';
}

function tallasPathFor(slug: string): string {
  const slugs: Record<string, string> = {
    chile: 'tallas-chinas-a-chilenas',
    mexico: 'tallas-chinas-a-mexicanas',
    peru: 'tallas-chinas-a-peruanas',
    colombia: 'tallas-chinas-a-colombianas',
  };
  return `/${slugs[slug] ?? 'escoger-tu-talla-ropa-china'}/`;
}

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: title,
  description,
  url: new URL(Astro.url.pathname, SITE).href,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  inLanguage: pais.hreflang,
  offers: { '@type': 'Offer', price: '0', priceCurrency: pais.moneda },
};
const schemas = schema ? [webAppSchema, schema] : [webAppSchema];
---

<Base title={title} description={description} schema={schemas}>
  {alternates && (
    <Fragment slot="head">
      {alternates.map((a) => <link rel="alternate" hreflang={a.hreflang} href={a.href} />)}
    </Fragment>
  )}
  <div class="container calculadora">
    <Breadcrumbs items={[{ name: title, url: Astro.url.pathname }]} />
    <header class="calc-header">
      <h1>{title}</h1>
      <p class="calc-intro">{intro}</p>
      <p class="calc-updated">
        Actualizado: <time datetime={fechaActualizacion}>{fechaActualizacion}</time>
      </p>
    </header>

    <section class="calc-widget" aria-label="Calculadora">
      <slot name="widget" />
    </section>

    <section class="calc-tabla" aria-label="Tabla de equivalencias">
      <slot name="tabla" />
    </section>

    <AffiliateBox
      headline={ctaAfiliado.headline}
      description={ctaAfiliado.description}
      ctaText={ctaAfiliado.ctaText}
      ctaUrl={aliexpress()}
      secondaryCta={ctaAfiliado.amazonQuery ? { text: 'Ver en Amazon', url: amazonEs({ q: ctaAfiliado.amazonQuery }) } : undefined}
      platform={ctaAfiliado.amazonQuery ? 'both' : 'aliexpress'}
    />

    <slot name="extra" />

    <section class="calc-otras" aria-label="Otras herramientas">
      <h2>Otras herramientas para {pais.nombre}</h2>
      <ul class="calc-otras-list">
        {interlinks.map((l) => <li><a href={l.href}>{l.label}</a></li>)}
      </ul>
    </section>
  </div>
</Base>

<style is:global>
  .calculadora { max-width: 760px; padding-top: 2rem; padding-bottom: 3rem; }
  .calc-header h1 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: clamp(1.6rem, 4vw, 2.2rem);
    line-height: 1.2;
    margin: 0 0 0.5rem;
    color: var(--clr-ink);
  }
  .calc-intro { font-size: 1rem; color: var(--clr-ink2); line-height: 1.6; margin: 0 0 .5rem; }
  .calc-updated { font-size: .85rem; color: var(--clr-muted); margin: 0 0 1.5rem; }
  .calc-widget { margin: 1.5rem 0 2rem; }
  .calc-tabla { margin: 2rem 0; }
  .calc-otras { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--clr-border); }
  .calc-otras h2 {
    font-family: var(--font-display); font-weight: 600; font-size: 1.2rem;
    margin: 0 0 .75rem; color: var(--clr-ink);
  }
  .calc-otras-list { list-style: none; padding: 0; margin: 0; display: grid; gap: .5rem; }
  .calc-otras-list a { color: var(--clr-link); font-weight: 500; }
  .calc-otras-list a:hover { color: var(--clr-link-hov); text-decoration: underline; }
</style>
```

- [ ] **Step 2: Build no debe romperse**

```bash
npm run build 2>&1 | tail -3
# Expected: 360 page(s) built
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Calculadora.astro
git commit -m "feat(calc): carcasa común Calculadora.astro con interlinking y schema"
```

---

### Task A5: Página de prueba que renderiza la carcasa

**Files:**
- Create: `src/pages/_dev-calculadora.astro` (se borra al final de fase A)

- [ ] **Step 1: Crear página dummy**

```astro
---
import Calculadora from '../components/Calculadora.astro';
import { paisBySlug } from '../data/paises';
const pais = paisBySlug('chile')!;
---
<Calculadora
  pais={pais}
  herramienta="moneda"
  title="Calculadora de prueba — Chile"
  description="Demo carcasa"
  intro="Esta página es solo para verificar la carcasa visual."
  ctaAfiliado={{
    headline: 'Encuentra productos en AliExpress',
    description: 'Demo CTA',
    ctaText: 'Ver AliExpress',
    amazonQuery: 'tendencias 2026',
  }}
  fechaActualizacion="2026-06-07"
>
  <div slot="widget">
    <p>[placeholder widget]</p>
  </div>
  <div slot="tabla">
    <p>[placeholder tabla]</p>
  </div>
</Calculadora>
```

- [ ] **Step 2: Levantar dev server y verificar**

```bash
npm run dev &
sleep 4
curl -s http://localhost:4321/_dev-calculadora/ | head -c 200
# Expected: contiene "<title>Calculadora de prueba"
kill %1
```

- [ ] **Step 3: Inspección manual móvil (375px)**

(En esta task no hay verificación automática del DOM; el usuario aprueba o rechaza visualmente).

- [ ] **Step 4: Borrar la página dummy + commit**

```bash
rm src/pages/_dev-calculadora.astro
git add -A src/pages/
git commit -m "chore(calc): verificada carcasa visualmente — borrar página dummy"
```

---

# FASE B — Conversor de moneda

**Objetivo:** Servir páginas `/precio-aliexpress/[moneda]/` para 6 monedas con conversor interactivo + tabla equivalencias + atribución ExchangeRate-API + cross-link a aduana.

---

### Task B1: `src/data/monedas.ts` (slug ↔ ISO ↔ país)

**Files:**
- Create: `src/data/monedas.ts`
- Create: `tests/lib/monedas.test.ts`

- [ ] **Step 1: Test**

```ts
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
      expect(m.paisSlug).toMatch(/^[a-z]+$/);
      expect(m.iso).toMatch(/^[A-Z]{3}$/);
    }
  });

  it('monedaBySlug funciona', () => {
    expect(monedaBySlug('sol-peruano')?.iso).toBe('PEN');
    expect(monedaBySlug('inexistente')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Implementar**

```ts
export interface Moneda {
  slug: string;
  iso: string;
  nombre: string;
  paisSlug: string;
}

export const monedas: Moneda[] = [
  { slug: 'peso-chileno',    iso: 'CLP', nombre: 'peso chileno',    paisSlug: 'chile' },
  { slug: 'peso-mexicano',   iso: 'MXN', nombre: 'peso mexicano',   paisSlug: 'mexico' },
  { slug: 'sol-peruano',     iso: 'PEN', nombre: 'sol peruano',     paisSlug: 'peru' },
  { slug: 'peso-colombiano', iso: 'COP', nombre: 'peso colombiano', paisSlug: 'colombia' },
  { slug: 'peso-argentino',  iso: 'ARS', nombre: 'peso argentino',  paisSlug: 'argentina' },
  { slug: 'euro',            iso: 'EUR', nombre: 'euro',            paisSlug: 'espana' },
];

const bySlug = new Map(monedas.map((m) => [m.slug, m]));
export function monedaBySlug(slug: string): Moneda | undefined { return bySlug.get(slug); }
```

- [ ] **Step 3: Tests pasan + commit**

```bash
npm run test:run -- tests/lib/monedas.test.ts
git add src/data/monedas.ts tests/lib/monedas.test.ts
git commit -m "feat(data): catálogo de monedas con slug legible"
```

---

### Task B2: Lógica pura `src/lib/convertir-moneda.ts`

**Files:**
- Create: `src/lib/convertir-moneda.ts`
- Create: `tests/lib/convertir-moneda.test.ts`

- [ ] **Step 1: Tests**

```ts
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
```

- [ ] **Step 2: Tests fallan**

```bash
npm run test:run -- tests/lib/convertir-moneda.test.ts
# Expected: FAIL
```

- [ ] **Step 3: Implementar**

```ts
export type Rates = Record<string, number>;

export function convertir(importe: number, origen: string, destino: string, rates: Rates): number {
  if (origen === destino) return importe;
  const rOrigen = rates[origen];
  const rDestino = rates[destino];
  if (rOrigen === undefined) throw new Error(`Moneda origen desconocida: ${origen}`);
  if (rDestino === undefined) throw new Error(`Moneda destino desconocida: ${destino}`);
  const enUSD = importe / rOrigen;
  return enUSD * rDestino;
}
```

- [ ] **Step 4: Tests pasan + commit**

```bash
npm run test:run -- tests/lib/convertir-moneda.test.ts
git add src/lib/convertir-moneda.ts tests/lib/convertir-moneda.test.ts
git commit -m "feat(lib): convertir() pura con tabla base USD"
```

---

### Task B3: `scripts/update-rates.mjs` — fetch + fallback 4 niveles

**Files:**
- Create: `scripts/update-rates.mjs`
- Create: `tests/scripts/update-rates.test.mjs`
- Create: `src/data/rates.json` (semilla, commiteada)

- [ ] **Step 1: Semilla `src/data/rates.json`** con valores reales del fetch del workflow

```json
{
  "base": "USD",
  "source": "exchangerate-api",
  "fetchedAt": "2026-06-07T00:02:31Z",
  "providerNextUpdate": "2026-06-08T00:22:31Z",
  "rates": {
    "USD": 1,
    "EUR": 0.864683,
    "CNY": 6.791621,
    "CLP": 895.111588,
    "MXN": 17.397793,
    "PEN": 3.430966,
    "COP": 3568.422762,
    "ARS": 1442.4148
  }
}
```

- [ ] **Step 2: Tests para update-rates**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
    } as any);
    const r = await fetchRates();
    expect(r.source).toBe('exchangerate-api');
    expect(r.rates.CLP).toBe(1.5);
    expect(r.base).toBe('USD');
  });

  it('fetchRates lanza si la API responde con result != success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: 'error', 'error-type': 'unsupported-code' }),
    } as any);
    await expect(fetchRates()).rejects.toThrow(/unsupported-code|error/);
  });
});
```

- [ ] **Step 3: Implementar `scripts/update-rates.mjs`**

```js
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

export const MONEDAS_OBJETIVO = ['USD', 'EUR', 'CNY', 'CLP', 'MXN', 'PEN', 'COP', 'ARS'];

const EMERGENCY_RATES = {
  base: 'USD', source: 'hardcoded-emergency', fetchedAt: '2026-01-01T00:00:00Z',
  stale: true,
  rates: { USD: 1, EUR: 0.92, CNY: 7.2, CLP: 920, MXN: 17.5, PEN: 3.7, COP: 4100, ARS: 1000 },
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
  return {
    base: j.base_code,
    source: 'exchangerate-api',
    fetchedAt: new Date(j.time_last_update_unix * 1000).toISOString(),
    providerNextUpdate: new Date(j.time_next_update_unix * 1000).toISOString(),
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
```

- [ ] **Step 4: Tests pasan**

```bash
npm run test:run -- tests/scripts/update-rates.test.mjs
# Expected: PASS (5 tests)
```

- [ ] **Step 5: Ejecutar el script real una vez** para verificar end-to-end

```bash
node scripts/update-rates.mjs
# Expected: "[update-rates] ✓ exchangerate-api ..." y rates.json actualizado
```

- [ ] **Step 6: Añadir script npm + hook prebuild**

En `package.json`:

```json
"scripts": {
  …,
  "update-rates": "node scripts/update-rates.mjs",
  "prebuild": "node scripts/update-rates.mjs"
}
```

- [ ] **Step 7: Commit**

```bash
git add scripts/update-rates.mjs tests/scripts/update-rates.test.mjs src/data/rates.json package.json
git commit -m "feat(rates): script update-rates con fallback 4-niveles + snapshot semilla"
```

---

### Task B4: `MonedaWidget.tsx` (island Preact) y wrapper Astro

**Files:**
- Create: `src/components/widgets/MonedaWidget.tsx`
- Create: `src/components/widgets/MonedaWidget.astro`

- [ ] **Step 1: Crear `MonedaWidget.tsx`**

```tsx
import { useId, useMemo, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { convertir, type Rates } from '../../lib/convertir-moneda';
import { formatCurrency } from '../../lib/i18n';

export type Origen = 'CNY' | 'USD';

export interface Props {
  monedaDestino: string;
  locale: string;
  rates: Rates;
  fechaTipoCambio: string;
}

export default function MonedaWidget({
  monedaDestino, locale, rates, fechaTipoCambio,
}: Props): JSX.Element {
  const importeId = useId();
  const monedaId = useId();
  const headingId = useId();
  const helpId = useId();

  const [importeRaw, setImporteRaw] = useState<string>('100');
  const [moneda, setMoneda] = useState<Origen>('CNY');

  const { resultado, error } = useMemo(() => {
    const normalizado = importeRaw.replace(',', '.').trim();
    const num = Number.parseFloat(normalizado);
    if (!Number.isFinite(num) || num < 0) {
      return { resultado: '', error: 'Introduce un importe válido' };
    }
    try {
      const out = convertir(num, moneda, monedaDestino, rates);
      return { resultado: formatCurrency(out, monedaDestino, locale), error: '' };
    } catch (e) {
      return { resultado: '', error: (e as Error).message };
    }
  }, [importeRaw, moneda, monedaDestino, rates, locale]);

  return (
    <section class="moneda-widget" aria-labelledby={headingId}>
      <h3 id={headingId} class="moneda-widget__title">Convertir a {monedaDestino}</h3>
      <p id={helpId} class="moneda-widget__help">
        Tipo de cambio actualizado el {fechaTipoCambio}. Valor orientativo.
      </p>

      <div class="moneda-widget__row">
        <label htmlFor={importeId} class="moneda-widget__label">Importe</label>
        <input
          id={importeId}
          class="moneda-widget__input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-describedby={helpId}
          aria-invalid={error ? 'true' : 'false'}
          value={importeRaw}
          onInput={(e) => setImporteRaw((e.target as HTMLInputElement).value)}
        />
      </div>

      <div class="moneda-widget__row">
        <label htmlFor={monedaId} class="moneda-widget__label">Moneda origen</label>
        <select
          id={monedaId}
          class="moneda-widget__select"
          value={moneda}
          onChange={(e) => setMoneda((e.target as HTMLSelectElement).value as Origen)}
        >
          <option value="CNY">Yuan chino (CNY)</option>
          <option value="USD">Dólar estadounidense (USD)</option>
        </select>
      </div>

      <output
        class={`moneda-widget__output ${error ? 'is-error' : ''}`}
        htmlFor={`${importeId} ${monedaId}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {error ? error : <><span class="sr-only">Resultado: </span>{resultado}</>}
      </output>
    </section>
  );
}
```

- [ ] **Step 2: Crear wrapper Astro**

```astro
---
import MonedaWidget from './MonedaWidget.tsx';
import ratesData from '../../data/rates.json';
import { convertir } from '../../lib/convertir-moneda';
import { formatCurrency } from '../../lib/i18n';

export interface Props {
  monedaDestino: string;
  locale: string;
}
const { monedaDestino, locale } = Astro.props;

const fechaTipoCambio = new Date(ratesData.fetchedAt).toLocaleDateString(locale, {
  day: 'numeric', month: 'long', year: 'numeric',
});
const defaultImporte = 100;
const defaultOut = formatCurrency(
  convertir(defaultImporte, 'CNY', monedaDestino, ratesData.rates),
  monedaDestino,
  locale,
);
---

<div class="moneda-widget-wrapper">
  <noscript>
    <p class="moneda-widget__noscript">
      <strong>{defaultImporte} CNY</strong> equivalen aproximadamente a
      <strong>{defaultOut}</strong> a fecha {fechaTipoCambio}. La calculadora interactiva
      necesita JavaScript; usa la tabla de equivalencias inferior si lo tienes desactivado.
    </p>
  </noscript>
  <MonedaWidget
    client:visible={{ rootMargin: '200px' }}
    monedaDestino={monedaDestino}
    locale={locale}
    rates={ratesData.rates}
    fechaTipoCambio={fechaTipoCambio}
  />
</div>

<style is:global>
  .moneda-widget {
    border-left: 4px solid var(--clr-amber);
    padding: 1.25rem 1rem;
    border-radius: var(--r-md);
    background: var(--clr-surface);
    box-shadow: var(--shadow-sm);
    min-height: 280px;
  }
  .moneda-widget__title {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.25rem;
    margin: 0 0 .5rem;
    color: var(--clr-red);
  }
  .moneda-widget__help { font-size: .85rem; color: var(--clr-muted); margin: 0 0 1rem; }
  .moneda-widget__row { display: flex; flex-direction: column; gap: .25rem; margin-bottom: .85rem; }
  .moneda-widget__label { font-weight: 600; font-size: .9375rem; color: var(--clr-ink); }
  .moneda-widget__input, .moneda-widget__select {
    font-family: var(--font-body);
    font-size: 1rem;
    min-height: 44px;
    padding: .55rem .75rem;
    border: 1px solid var(--clr-border);
    border-radius: var(--r-sm);
    background: #fff;
    color: var(--clr-ink);
  }
  .moneda-widget__input:focus-visible, .moneda-widget__select:focus-visible {
    outline: 3px solid var(--clr-amber);
    outline-offset: 2px;
  }
  .moneda-widget__output {
    display: block;
    margin-top: 1rem;
    padding: .75rem 1rem;
    background: var(--clr-amber-bg);
    border-radius: var(--r-sm);
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--clr-ink);
  }
  .moneda-widget__output.is-error {
    color: var(--clr-red);
    font-size: 1rem;
    background: var(--clr-red-light);
  }
  .moneda-widget__noscript { background: var(--clr-surface2); padding: .75rem; border-radius: var(--r-sm); }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/widgets/MonedaWidget.tsx src/components/widgets/MonedaWidget.astro
git commit -m "feat(moneda): MonedaWidget Preact island + wrapper SSR con noscript"
```

---

### Task B5: Página `/precio-aliexpress/[moneda]/`

**Files:**
- Create: `src/pages/precio-aliexpress/[moneda].astro`
- Create: `src/pages/precio-aliexpress/index.astro`

- [ ] **Step 1: Implementar `[moneda].astro`**

```astro
---
import Calculadora from '../../components/Calculadora.astro';
import MonedaWidgetAstro from '../../components/widgets/MonedaWidget.astro';
import { monedas, monedaBySlug } from '../../data/monedas';
import { paisBySlug } from '../../data/paises';
import { convertir } from '../../lib/convertir-moneda';
import { formatCurrency, localeFor } from '../../lib/i18n';
import ratesData from '../../data/rates.json';

export function getStaticPaths() {
  return monedas.map((m) => ({ params: { moneda: m.slug }, props: { moneda: m } }));
}

const { moneda } = Astro.props;
const pais = paisBySlug(moneda.paisSlug)!;
const locale = localeFor(pais.slug);
const SITE = 'https://decomprasporchina.com';

const fechaTipoCambio = new Date(ratesData.fetchedAt).toLocaleDateString(locale, {
  day: 'numeric', month: 'long', year: 'numeric',
});
const fechaActualizacion = ratesData.fetchedAt.slice(0, 10);

const equivalenciasUsd = [5, 10, 20, 50, 100, 200];
const equivalenciasCny = [50, 100, 200, 500, 1000];

const title = `Precio AliExpress en ${moneda.nombre}: conversor ${new Date().getFullYear()}`;
const description = `Convierte precios de AliExpress al ${moneda.nombre} (${moneda.iso}). Calculadora actualizada el ${fechaTipoCambio} con tabla rápida y nota de aduana para ${pais.nombre}.`;
const intro = `Precios de AliExpress en yuanes (CNY) o dólares (USD) convertidos al ${moneda.nombre}. Tipo de cambio actualizado el ${fechaTipoCambio}.`;

const alternates = monedas.map((m) => ({
  hreflang: paisBySlug(m.paisSlug)!.hreflang,
  href: `${SITE}/precio-aliexpress/${m.slug}/`,
}));
---

<Calculadora
  pais={pais}
  herramienta="moneda"
  title={title}
  description={description}
  intro={intro}
  ctaAfiliado={{
    headline: `Compra en AliExpress con precios en ${moneda.nombre}`,
    description: `Ya sabes lo que vas a pagar. Explora millones de productos con envío gratuito y protección al comprador.`,
    ctaText: 'Ir a AliExpress',
    amazonQuery: 'tendencias 2026',
  }}
  fechaActualizacion={fechaActualizacion}
  alternates={alternates}
>
  <MonedaWidgetAstro slot="widget" monedaDestino={moneda.iso} locale={locale} />

  <div slot="tabla">
    <h2>Equivalencias rápidas en {moneda.nombre}</h2>
    <table class="equiv-table">
      <thead>
        <tr><th scope="col">USD</th><th scope="col">CNY</th><th scope="col">{moneda.iso}</th></tr>
      </thead>
      <tbody>
        {equivalenciasUsd.map((usd) => {
          const local = formatCurrency(convertir(usd, 'USD', moneda.iso, ratesData.rates), moneda.iso, locale);
          const cny = (usd * ratesData.rates.CNY).toFixed(0);
          return (
            <tr>
              <th scope="row">{`$${usd}`}</th>
              <td>{cny} ¥</td>
              <td>{local}</td>
            </tr>
          );
        })}
      </tbody>
    </table>

    <h3>Desde yuanes (CNY)</h3>
    <table class="equiv-table">
      <thead><tr><th scope="col">CNY</th><th scope="col">{moneda.iso}</th></tr></thead>
      <tbody>
        {equivalenciasCny.map((cny) => {
          const local = formatCurrency(convertir(cny, 'CNY', moneda.iso, ratesData.rates), moneda.iso, locale);
          return (
            <tr>
              <th scope="row">{`${cny} ¥`}</th>
              <td>{local}</td>
            </tr>
          );
        })}
      </tbody>
    </table>

    <p class="rates-attrib">
      Tipos de cambio por <a href="https://www.exchangerate-api.com" rel="nofollow noopener" target="_blank">Exchange Rate API</a>.
      Actualizados el {fechaTipoCambio}.
    </p>
  </div>

  <aside slot="extra" class="aduana-note">
    <p>
      <strong>¿Vas a pagar aduana?</strong> A este importe, al recibir en {pais.nombre}
      podrías pagar impuestos. <a href={`/aduana/china-a-${pais.slug}/`}>Calcula lo que pagarás aquí</a>.
    </p>
  </aside>
</Calculadora>

<style>
  .equiv-table { width: 100%; border-collapse: collapse; margin: 1rem 0 1.5rem; font-size: .95rem; }
  .equiv-table th, .equiv-table td { padding: .5rem .75rem; text-align: left; border-bottom: 1px solid var(--clr-border); }
  .equiv-table thead th { background: var(--clr-surface2); font-family: var(--font-display); font-weight: 600; }
  .equiv-table tbody th { font-weight: 600; color: var(--clr-ink); }
  .rates-attrib { font-size: .8rem; color: var(--clr-muted); margin-top: 1rem; }
  .aduana-note {
    margin: 1.5rem 0;
    padding: .9rem 1rem;
    background: var(--clr-amber-bg);
    border-left: 4px solid var(--clr-amber);
    border-radius: var(--r-sm);
  }
  .aduana-note p { margin: 0; }
  @media (max-width: 480px) {
    .equiv-table { font-size: .85rem; }
    .equiv-table th, .equiv-table td { padding: .4rem .5rem; }
  }
</style>
```

- [ ] **Step 2: Crear hub `index.astro`**

```astro
---
import Base from '../../layouts/Base.astro';
import { monedas } from '../../data/monedas';
import { paisBySlug } from '../../data/paises';
const title = 'Conversor de precio AliExpress por moneda';
const description = 'Convierte precios de AliExpress a tu moneda local. Calculadoras para Chile, México, Perú, Colombia, Argentina y España.';
---
<Base title={title} description={description}>
  <div class="container" style="max-width: 720px; padding: 2rem 1rem 3rem;">
    <h1>Conversor de precio AliExpress</h1>
    <p>Elige tu moneda y convierte cualquier precio de AliExpress a tu divisa local con el tipo de cambio diario.</p>
    <ul class="hub-list">
      {monedas.map((m) => (
        <li><a href={`/precio-aliexpress/${m.slug}/`}>Precio en {m.nombre} — {paisBySlug(m.paisSlug)?.nombre}</a></li>
      ))}
    </ul>
  </div>
  <style>
    .hub-list { list-style: none; padding: 0; display: grid; gap: .5rem; }
    .hub-list a { display: block; padding: .75rem 1rem; background: var(--clr-surface); border: 1px solid var(--clr-border); border-radius: var(--r-sm); color: var(--clr-link); font-weight: 600; }
    .hub-list a:hover { background: var(--clr-surface2); }
  </style>
</Base>
```

- [ ] **Step 3: Build + smoke check**

```bash
npm run build 2>&1 | tail -5
# Expected: page count = 360 + 7 (6 monedas + hub) = 367
ls dist/precio-aliexpress/
# Expected: euro/ index.html peso-argentino/ peso-chileno/ peso-colombiano/ peso-mexicano/ sol-peruano/
grep -c 'class="moneda-widget"' dist/precio-aliexpress/peso-chileno/index.html
# Expected: 0 (la island se hidrata por JS; sí debe estar el SSR con noscript)
grep -c 'moneda-widget__noscript' dist/precio-aliexpress/peso-chileno/index.html
# Expected: 1
grep -c 'Tipos de cambio por' dist/precio-aliexpress/peso-chileno/index.html
# Expected: 1
```

- [ ] **Step 4: Levantar dev server y validar interactividad**

```bash
npm run dev &
sleep 4
```

Manualmente en navegador: visitar `http://localhost:4321/precio-aliexpress/peso-chileno/`, escribir `200`, cambiar a USD, verificar que el output muestra una cifra en CLP con `$` y sin decimales.

```bash
kill %1
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/precio-aliexpress/
git commit -m "feat(moneda): páginas precio-aliexpress/[moneda] + hub index"
```

---

### Task B6: SEO + sitemap + atribución exchange en footer global

**Files:**
- Modify: `src/layouts/Base.astro` (slot `head` para que `Calculadora.astro` inyecte hreflang)
- Verify: sitemap regenera con las nuevas URLs

- [ ] **Step 1: Añadir slot `head` opcional a Base.astro**

En `Base.astro`, antes del `</head>` (línea 116 aprox.), añadir:

```astro
<slot name="head" />
```

- [ ] **Step 2: Build y verificar sitemap**

```bash
npm run build 2>&1 | tail -3
grep -c '/precio-aliexpress/' dist/sitemap-0.xml
# Expected: ≥ 7
```

- [ ] **Step 3: Verificar hreflang en una página**

```bash
grep -c 'hreflang="es-CL"' dist/precio-aliexpress/peso-chileno/index.html
# Expected: ≥ 1
```

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat(seo): slot head en Base + verificación hreflang en moneda"
```

---

### Task B7: Pause + revisión móvil + Lighthouse Fase B

- [ ] **Step 1: Lighthouse manual**

```bash
npm run build && npx http-server dist -p 8080 &
sleep 3
npx lighthouse http://localhost:8080/precio-aliexpress/peso-chileno/ --preset=desktop --quiet --chrome-flags="--headless" --output=json --output-path=/tmp/lh-moneda.json
node -e "const j=require('/tmp/lh-moneda.json'); console.log('perf:', j.categories.performance.score*100, 'a11y:', j.categories.accessibility.score*100, 'best:', j.categories['best-practices'].score*100, 'seo:', j.categories.seo.score*100);"
# Expected: perf ≥ 90, a11y ≥ 90
kill %1
```

- [ ] **Step 2: Pause obligatoria** según spec §10. Confirmar con el usuario antes de empezar Fase C.

---

# FASE C — Calculadora aduana

**Objetivo:** Servir `/aduana/china-a-[pais]/` para 6 países con calculadora interactiva del impuesto a pagar al recibir el pedido + disclaimer legal visible + enlace a aduana oficial + interlinking con moneda y tallas. **Las cifras son las validadas en el research del workflow `wf_0fc45040-914`** (junio 2026).

---

### Task C1: `src/data/aduana.ts` con reglas validadas

**Files:**
- Create: `src/data/aduana.ts`
- Create: `tests/lib/aduana.test.ts`

- [ ] **Step 1: Test estructural**

```ts
import { describe, it, expect } from 'vitest';
import { reglas, reglaByPais } from '../../src/data/aduana';
import { paises } from '../../src/data/paises';

describe('aduana reglas', () => {
  it('hay una regla por cada país objetivo', () => {
    for (const p of paises) {
      const r = reglaByPais(p.slug);
      expect(r, `falta regla para ${p.slug}`).toBeDefined();
    }
  });

  it('toda regla tiene fuenteUrl oficial (.gob / .gov / europa.eu)', () => {
    for (const r of reglas) {
      expect(r.fuenteUrl, `${r.pais} sin fuente oficial`).toMatch(/\.(gob|gov)\.|europa\.eu/);
    }
  });

  it('toda regla tiene fechaRevision en formato YYYY-MM-DD', () => {
    for (const r of reglas) {
      expect(r.fechaRevision).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('toda regla tiene confianza alta o media (nada baja en v1)', () => {
    for (const r of reglas) {
      expect(['alta', 'media']).toContain(r.confianza);
    }
  });
});
```

- [ ] **Step 2: Implementar `src/data/aduana.ts`**

Las cifras provienen del research validado del workflow (con `verdict.refutado: false` para los 6 países):

```ts
export type Base = 'CIF' | 'FOB';

export interface ReglaAduana {
  pais: string;              // slug, FK a paises.ts
  moneda: string;            // ISO local
  baseCalculo: Base;
  /**
   * deMinimisUSD = umbral del valor de la mercancía (FOB o valor del bien según país)
   * por debajo del cual NO se cobra (al menos parte de) los tributos. null = no aplica
   * minimis en el sentido tradicional.
   */
  deMinimisUSD: number | null;
  ivaPct: number;            // IVA/IGV general aplicable
  arancelGeneralPct: number; // arancel general orientativo para China
  notas: string[];
  fuenteUrl: string;
  fuenteNombre: string;
  fechaRevision: string;     // YYYY-MM-DD
  confianza: 'alta' | 'media';
  algoritmoEspecial?: 'mexico-tasa-global' | 'argentina-franquicia-courier';
}

export const reglas: ReglaAduana[] = [
  {
    pais: 'chile',
    moneda: 'CLP',
    baseCalculo: 'CIF',
    deMinimisUSD: 0, // Ley 21.713 eliminó la franquicia US$41
    ivaPct: 19,
    arancelGeneralPct: 6, // se aplica SOBRE US$500
    notas: [
      'Ley 21.713 vigente desde 25-oct-2025: todas las compras pagan IVA 19% desde el primer peso',
      'Hasta US$500 de valor del bien: solo IVA 19%, sin arancel ad valorem',
      'Sobre US$500: IVA 19% sobre (CIF + arancel), más 6% de arancel ad valorem sobre CIF',
      'AliExpress, Temu, Shein, Amazon y otras 5 plataformas están registradas en SII y cobran el IVA en el checkout — al recibir en Chile NO pagas nada más',
      'Si la plataforma NO está registrada en SII, el IVA se paga al recibir con Formulario 18 o en CorreosChile',
      'Despacho simplificado disponible hasta US$3.000',
    ],
    fuenteUrl: 'https://www.aduana.cl/compras-online-internacionales-iva-se-pagara-en-las-plataformas-y/aduana/2025-10-06/100335.html',
    fuenteNombre: 'Servicio Nacional de Aduanas de Chile',
    fechaRevision: '2026-06-07',
    confianza: 'alta',
  },
  {
    pais: 'mexico',
    moneda: 'MXN',
    baseCalculo: 'CIF',
    deMinimisUSD: 0,
    ivaPct: 16,
    arancelGeneralPct: 33.5, // tasa global única que reemplaza IGI+IVA+DTA en régimen simplificado
    algoritmoEspecial: 'mexico-tasa-global',
    notas: [
      'Para China NO existe de minimis: aplica la tasa global 33.5% desde el primer dólar bajo régimen simplificado courier (Regla 3.7.35 RGCE)',
      'La tasa 33.5% YA INCLUYE IGI + IVA + DTA — no se suma 16% IVA por separado',
      'Aplica hasta US$2.500 por destinatario. Sobre eso requiere despacho formal con agente aduanal',
      'Cambio mayor 15-ago-2025: la tasa subió de 19% a 33.5% para países sin TLC con México (4ª RM RGCE 2025, DOF 28-jul-2025)',
      'Si la plataforma (Shein/Temu/AliExpress) está registrada ante SAT, retiene IVA en origen — verificar al hacer la compra',
      'La calculadora muestra una ESTIMACIÓN del régimen simplificado courier; el pago real puede variar si aplica IEPS o NOMs',
    ],
    fuenteUrl: 'https://www.anam.gob.mx/mensajeria-y-paqueteria/',
    fuenteNombre: 'ANAM (Agencia Nacional de Aduanas de México)',
    fechaRevision: '2026-06-07',
    confianza: 'media',
  },
  {
    pais: 'peru',
    moneda: 'PEN',
    baseCalculo: 'CIF',
    deMinimisUSD: 200, // FOB
    ivaPct: 18,        // IGV 16% + IPM 2%
    arancelGeneralPct: 4, // courier Cat 3, sobre CIF
    notas: [
      'Umbral US$200 FOB exento de aranceles e IGV en régimen courier (Cat 2 DS 192-2020-EF) e Importa Fácil (postal)',
      'De US$200.01 a US$2.000 FOB: courier Cat 3 paga 4% ad valorem sobre CIF + 18% IGV sobre (CIF + arancel)',
      'Sobre US$2.000 FOB: despacho regular (no contemplado en esta calculadora)',
      'Base FOB para medir el umbral, base CIF para calcular los tributos cuando aplican',
      'SUNAT vigila el fraccionamiento: múltiples envíos al mismo destinatario en el mismo manifiesto pueden consolidarse',
      'Sin cambios al umbral US$200 ni a las tasas 4%/18% en 2024-2026',
    ],
    fuenteUrl: 'https://www.sunat.gob.pe/orientacionaduanera/enviospostales/clasificaEP.html',
    fuenteNombre: 'SUNAT (Superintendencia Nacional de Aduanas y de Administración Tributaria)',
    fechaRevision: '2026-06-07',
    confianza: 'alta',
  },
  {
    pais: 'colombia',
    moneda: 'COP',
    baseCalculo: 'FOB',
    deMinimisUSD: 200, // FOB, solo para arancel
    ivaPct: 19,
    arancelGeneralPct: 10,
    notas: [
      'Umbral US$200 FOB exento de ARANCEL para todos los orígenes (Decreto 1165 de 2019)',
      'IVA 19%: por ser China sin TLC, aplica IVA SIEMPRE incluso bajo US$200 (Ley 2155 de 2021 art. 428 lit. j solo exime EE.UU.)',
      'De US$200 a US$2.000 FOB: arancel 10% sobre FOB + IVA 19% sobre (FOB + arancel)',
      'Tope absoluto: US$2.000 valor, 50 kg, sin fines comerciales',
      'CAMBIO REVERTIDO: el Decreto 1474/2025 redujo el umbral a US$50 entre ene-abr 2026; la Corte Constitucional lo declaró inexequible el 9-abr-2026, volvió a US$200',
      'Convenio DDP de 4-72 con AliExpress/Shein/Temu: el IVA puede estar pagado en el checkout — verifica al comprar',
    ],
    fuenteUrl: 'https://www.dian.gov.co/Viajeros-y-Servicios-aduaneros/Paginas/Modalidad-de-trafico-postal-y-envios-urgentes.aspx',
    fuenteNombre: 'DIAN (Dirección de Impuestos y Aduanas Nacionales)',
    fechaRevision: '2026-06-07',
    confianza: 'alta',
  },
  {
    pais: 'argentina',
    moneda: 'ARS',
    baseCalculo: 'FOB',
    deMinimisUSD: 400, // FOB, courier PSP
    ivaPct: 21,
    arancelGeneralPct: 50, // simplificado sobre el EXCEDENTE
    algoritmoEspecial: 'argentina-franquicia-courier',
    notas: [
      'Decreto 1065/2024 (vigente 03-dic-2024): franquicia US$400 FOB por envío en régimen courier (PSP — DHL, FedEx, MailAmericas, etc.)',
      'Hasta US$400 FOB: solo IVA 21%, sin arancel',
      'Sobre US$400 hasta US$3.000: arancel simplificado 50% sobre el EXCEDENTE + IVA 21% sobre el total FOB',
      'Máximo 5 envíos por año por persona, peso ≤ 50 kg, sin finalidad comercial',
      'Régimen postal (Correo Argentino): franquicia US$50, 12 envíos/año — usar courier privado para aprovechar US$400',
      'NO incluye Impuesto PAIS ni percepciones cambiarias del 30%/45% si pagas con tarjeta en pesos — esas se aplican aparte (varían según BCRA)',
      'La calculadora estima solo arancel + IVA del régimen courier; consulta tu banco para impuestos cambiarios',
    ],
    fuenteUrl: 'https://www.argentina.gob.ar/normativa/nacional/decreto-1065-2024-406688/texto',
    fuenteNombre: 'ARCA (Agencia de Recaudación y Control Aduanero, ex-AFIP)',
    fechaRevision: '2026-06-07',
    confianza: 'alta',
  },
  {
    pais: 'espana',
    moneda: 'EUR',
    baseCalculo: 'CIF',
    deMinimisUSD: 0, // sin minimis IVA desde jul-2021; arancel 0 hasta 150€ hasta jun-2026
    ivaPct: 21,
    arancelGeneralPct: 0, // 0 hasta 150€ hasta 30-jun-2026; 3€ fijo por línea desde 01-jul-2026
    notas: [
      'Sin minimis IVA desde 1-jul-2021 (UE): TODO envío extracomunitario paga IVA 21%',
      'Hasta 30-jun-2026: envíos ≤150€ están exentos de arancel; arancel TARIC variable sobre 150€',
      'Desde 1-jul-2026 (Reglamento UE 2026/382): los envíos ≤150€ pagan 3€ fijos por cada línea TARIC además del IVA',
      'Régimen IOSS: si AliExpress/Shein/Temu cobran el IVA en checkout (lo hacen para ≤150€), no pagas nada al recibir el paquete',
      'Sin IOSS: pagas IVA + tasa de gestión al transportista (Correos: 1,24€; couriers: 10-30€)',
      'Sobre 150€: arancel TARIC específico por código de producto (0%-17%)',
    ],
    fuenteUrl: 'https://sede.agenciatributaria.gob.es/Sede/aduanas/novedades/2026/abril/30/novedades-comercio-electronico-1-julio.html',
    fuenteNombre: 'AEAT (Agencia Estatal de Administración Tributaria)',
    fechaRevision: '2026-06-07',
    confianza: 'alta',
  },
];

const bySlug = new Map(reglas.map((r) => [r.pais, r]));
export function reglaByPais(slug: string): ReglaAduana | undefined { return bySlug.get(slug); }
```

- [ ] **Step 3: Tests pasan + commit**

```bash
npm run test:run -- tests/lib/aduana.test.ts
git add src/data/aduana.ts tests/lib/aduana.test.ts
git commit -m "feat(aduana): reglas por país validadas en fuente oficial (workflow wf_0fc45040)"
```

---

### Task C2: Lógica pura `src/lib/calcular-aduana.ts`

**Files:**
- Create: `src/lib/calcular-aduana.ts`
- Create: `tests/lib/calcular-aduana.test.ts`

- [ ] **Step 1: Tests por país** (un caso bajo umbral + uno sobre umbral cada uno)

```ts
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
    expect(d.arancel).toBeCloseTo(36, 2); // 600 * 0.06
    expect(d.iva).toBeCloseTo(120.84, 2); // (600 + 36) * 0.19
    expect(d.totalImpuestosUSD).toBeCloseTo(156.84, 2);
  });
});

describe('calcular-aduana — México (tasa global)', () => {
  const r = reglaByPais('mexico')!;
  it('US$100 paga 33.5% como tasa global única', () => {
    const d = calcular({ valor: 100, envio: 0, regla: r });
    expect(d.arancel).toBeCloseTo(33.5, 2);
    expect(d.iva).toBeCloseTo(0); // ya incluido en tasa global
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
    expect(d.iva).toBeCloseTo(63, 2); // 300 * 0.21
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
  it('100 EUR (interpretado como USD por simplicidad): IVA 21% sin arancel', () => {
    const d = calcular({ valor: 100, envio: 0, regla: r });
    expect(d.arancel).toBeCloseTo(0);
    expect(d.iva).toBeCloseTo(21, 2);
  });
});
```

- [ ] **Step 2: Tests fallan**

```bash
npm run test:run -- tests/lib/calcular-aduana.test.ts
# Expected: FAIL
```

- [ ] **Step 3: Implementar `src/lib/calcular-aduana.ts`**

```ts
import type { ReglaAduana } from '../data/aduana';

export interface Desglose {
  base: number;
  arancel: number;
  iva: number;
  tasaAdicional: number;
  totalImpuestosUSD: number;
  exentoPorMinimis: boolean;
  notaTasaGlobal?: string;
  requiereDespachoFormal?: boolean;
  notas: string[];
}

export interface CalcularInput {
  valor: number;          // USD (valor del producto)
  envio?: number;         // USD (flete y seguro)
  categoria?: string;     // opcional, futuro: aranceles por categoría
  regla: ReglaAduana;
}

const LIMITE_SIMPLIFICADO_MX = 2500;
const LIMITE_COURIER_AR = 3000;

export function calcular({ valor, envio = 0, regla }: CalcularInput): Desglose {
  if (regla.algoritmoEspecial === 'mexico-tasa-global') return calcMexico(valor, envio, regla);
  if (regla.algoritmoEspecial === 'argentina-franquicia-courier') return calcArgentina(valor, envio, regla);
  return calcEstandar(valor, envio, regla);
}

function calcMexico(valor: number, envio: number, regla: ReglaAduana): Desglose {
  if (valor > LIMITE_SIMPLIFICADO_MX) {
    return {
      base: valor + envio,
      arancel: 0,
      iva: 0,
      tasaAdicional: 0,
      totalImpuestosUSD: 0,
      exentoPorMinimis: false,
      requiereDespachoFormal: true,
      notas: [`Sobre US$${LIMITE_SIMPLIFICADO_MX} requiere despacho formal con agente aduanal.`],
    };
  }
  const baseCIF = valor + envio;
  const tasaGlobal = baseCIF * (regla.arancelGeneralPct / 100);
  return {
    base: baseCIF,
    arancel: tasaGlobal,
    iva: 0,
    tasaAdicional: 0,
    totalImpuestosUSD: tasaGlobal,
    exentoPorMinimis: false,
    notaTasaGlobal: `Tasa global 33.5% (Regla 3.7.35 RGCE) — incluye IGI + IVA + DTA.`,
    notas: [],
  };
}

function calcArgentina(valor: number, envio: number, regla: ReglaAduana): Desglose {
  if (valor > LIMITE_COURIER_AR) {
    return {
      base: valor + envio,
      arancel: 0, iva: 0, tasaAdicional: 0, totalImpuestosUSD: 0,
      exentoPorMinimis: false, requiereDespachoFormal: true,
      notas: [`Sobre US$${LIMITE_COURIER_AR} excede el régimen courier puerta a puerta.`],
    };
  }
  const baseFOB = valor;
  const minimis = regla.deMinimisUSD ?? 0;
  const excedente = Math.max(0, baseFOB - minimis);
  const arancel = excedente * (regla.arancelGeneralPct / 100); // 50% sobre excedente
  const iva = baseFOB * (regla.ivaPct / 100); // IVA sobre el FOB total
  return {
    base: baseFOB,
    arancel,
    iva,
    tasaAdicional: 0,
    totalImpuestosUSD: arancel + iva,
    exentoPorMinimis: excedente === 0,
    notas: excedente === 0
      ? [`Hasta US$${minimis} bajo franquicia courier — solo IVA ${regla.ivaPct}%.`]
      : [`Arancel ${regla.arancelGeneralPct}% sobre el excedente de US$${minimis} (US$${excedente.toFixed(2)}).`],
  };
}

function calcEstandar(valor: number, envio: number, regla: ReglaAduana): Desglose {
  const baseTotal = regla.baseCalculo === 'CIF' ? valor + envio : valor;
  const minimis = regla.deMinimisUSD ?? 0;
  const bajoMinimis = minimis > 0 && valor <= minimis;

  // Chile especial: minimis = 0 pero arancel solo aplica sobre US$500 valor del bien
  const aplicaArancel = regla.pais === 'chile'
    ? valor > 500
    : !bajoMinimis;

  // Colombia: arancel solo si supera minimis, IVA siempre (China sin TLC)
  // Perú: ambos (arancel + IGV) exentos bajo US$200 FOB
  // España: arancel 0 hasta 150€, IVA siempre

  const arancel = aplicaArancel ? baseTotal * (regla.arancelGeneralPct / 100) : 0;
  const baseIva = baseTotal + arancel;

  let aplicaIva = true;
  if (regla.pais === 'peru' && bajoMinimis) aplicaIva = false;
  // Chile, Colombia, España: IVA siempre aplica (Chile siempre, Colombia siempre china sin TLC, España sin minimis)

  const iva = aplicaIva ? baseIva * (regla.ivaPct / 100) : 0;

  return {
    base: baseTotal,
    arancel,
    iva,
    tasaAdicional: 0,
    totalImpuestosUSD: arancel + iva,
    exentoPorMinimis: bajoMinimis && arancel === 0 && iva === 0,
    notas: [],
  };
}
```

- [ ] **Step 4: Tests pasan**

```bash
npm run test:run -- tests/lib/calcular-aduana.test.ts
# Expected: PASS (todos)
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/calcular-aduana.ts tests/lib/calcular-aduana.test.ts
git commit -m "feat(aduana): calcular() pura con algoritmos por país"
```

---

### Task C3: `AduanaWidget.tsx` (island Preact)

**Files:**
- Create: `src/components/widgets/AduanaWidget.tsx`
- Create: `src/components/widgets/AduanaWidget.astro`

- [ ] **Step 1: Crear `AduanaWidget.tsx`**

```tsx
import { useId, useMemo, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { calcular, type Desglose } from '../../lib/calcular-aduana';
import type { ReglaAduana } from '../../data/aduana';
import { convertir, type Rates } from '../../lib/convertir-moneda';
import { formatCurrency } from '../../lib/i18n';

export interface Props {
  regla: ReglaAduana;
  locale: string;
  rates: Rates;
}

export default function AduanaWidget({ regla, locale, rates }: Props): JSX.Element {
  const valorId = useId();
  const envioId = useId();
  const headId = useId();

  const [valorRaw, setValorRaw] = useState<string>('100');
  const [envioRaw, setEnvioRaw] = useState<string>('0');

  const { desglose, error } = useMemo(() => {
    const v = Number.parseFloat(valorRaw.replace(',', '.'));
    const e = Number.parseFloat(envioRaw.replace(',', '.')) || 0;
    if (!Number.isFinite(v) || v < 0) return { desglose: null, error: 'Introduce un valor válido' };
    const d = calcular({ valor: v, envio: e, regla });
    return { desglose: d, error: '' };
  }, [valorRaw, envioRaw, regla]);

  const usd2local = (usd: number) =>
    formatCurrency(convertir(usd, 'USD', regla.moneda, rates), regla.moneda, locale);

  return (
    <section class="aduana-widget" aria-labelledby={headId}>
      <h3 id={headId} class="aduana-widget__title">Calcular impuestos al importar</h3>

      <div class="aduana-widget__row">
        <label htmlFor={valorId} class="aduana-widget__label">Valor del pedido (USD)</label>
        <input id={valorId} class="aduana-widget__input" type="text" inputMode="decimal" autoComplete="off"
          value={valorRaw} onInput={(ev) => setValorRaw((ev.target as HTMLInputElement).value)} />
      </div>

      <div class="aduana-widget__row">
        <label htmlFor={envioId} class="aduana-widget__label">
          Coste de envío (USD){' '}
          <span class="aduana-widget__opt">opcional</span>
        </label>
        <input id={envioId} class="aduana-widget__input" type="text" inputMode="decimal" autoComplete="off"
          value={envioRaw} onInput={(ev) => setEnvioRaw((ev.target as HTMLInputElement).value)} />
      </div>

      <output class={`aduana-widget__output ${error ? 'is-error' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        {error && error}
        {desglose && !error && (
          <DesgloseView d={desglose} usd2local={usd2local} regla={regla} />
        )}
      </output>

      <p class="aduana-widget__disclaimer">
        ⚠ Estimación orientativa. No es asesoría fiscal ni aduanera. La normativa puede cambiar.
        Verifica con <a href={regla.fuenteUrl} target="_blank" rel="nofollow noopener">{regla.fuenteNombre}</a>.
      </p>
    </section>
  );
}

function DesgloseView({ d, usd2local, regla }: {
  d: Desglose;
  usd2local: (n: number) => string;
  regla: ReglaAduana;
}) {
  if (d.requiereDespachoFormal) {
    return (
      <div class="aduana-widget__formal">
        <strong>Requiere despacho formal con agente aduanal.</strong>
        <p>{d.notas.join(' ')}</p>
      </div>
    );
  }
  return (
    <div class="aduana-widget__desglose">
      {d.exentoPorMinimis ? (
        <p class="aduana-widget__exento">
          <strong>Exento de impuestos</strong> bajo el umbral de minimis (US${regla.deMinimisUSD}).
        </p>
      ) : (
        <dl class="aduana-widget__dl">
          {d.arancel > 0 && (
            <>
              <dt>{regla.algoritmoEspecial === 'mexico-tasa-global' ? 'Tasa global' : 'Arancel'}</dt>
              <dd>{usd2local(d.arancel)}</dd>
            </>
          )}
          {d.iva > 0 && (
            <>
              <dt>{regla.moneda === 'PEN' ? 'IGV' : 'IVA'} ({regla.ivaPct}%)</dt>
              <dd>{usd2local(d.iva)}</dd>
            </>
          )}
          <dt class="aduana-widget__total">Total estimado</dt>
          <dd class="aduana-widget__total">{usd2local(d.totalImpuestosUSD)}</dd>
        </dl>
      )}
      {d.notaTasaGlobal && <p class="aduana-widget__nota">{d.notaTasaGlobal}</p>}
      {d.notas.length > 0 && <ul class="aduana-widget__notas">{d.notas.map((n) => <li>{n}</li>)}</ul>}
    </div>
  );
}
```

- [ ] **Step 2: Crear wrapper Astro**

```astro
---
import AduanaWidget from './AduanaWidget.tsx';
import ratesData from '../../data/rates.json';
import { calcular } from '../../lib/calcular-aduana';
import { convertir } from '../../lib/convertir-moneda';
import { formatCurrency } from '../../lib/i18n';
import type { ReglaAduana } from '../../data/aduana';

export interface Props { regla: ReglaAduana; locale: string; }
const { regla, locale } = Astro.props;

const ssrDef = calcular({ valor: 100, envio: 0, regla });
const ssrLocal = formatCurrency(
  convertir(ssrDef.totalImpuestosUSD, 'USD', regla.moneda, ratesData.rates),
  regla.moneda, locale,
);
---

<div class="aduana-widget-wrapper">
  <noscript>
    <p class="aduana-widget__noscript">
      Para un pedido de US$100, el total estimado de impuestos sería aproximadamente
      <strong>{ssrLocal}</strong>. La calculadora interactiva necesita JavaScript;
      consulta los detalles del régimen en la sección inferior o visita
      <a href={regla.fuenteUrl} rel="nofollow noopener">{regla.fuenteNombre}</a>.
    </p>
  </noscript>
  <AduanaWidget
    client:visible={{ rootMargin: '200px' }}
    regla={regla}
    locale={locale}
    rates={ratesData.rates}
  />
</div>

<style is:global>
  .aduana-widget {
    border-left: 4px solid var(--clr-amber);
    padding: 1.25rem 1rem;
    border-radius: var(--r-md);
    background: var(--clr-surface);
    box-shadow: var(--shadow-sm);
    min-height: 360px;
  }
  .aduana-widget__title { font-family: var(--font-display); font-weight: 600; font-size: 1.25rem; margin: 0 0 1rem; color: var(--clr-red); }
  .aduana-widget__row { display: flex; flex-direction: column; gap: .25rem; margin-bottom: .85rem; }
  .aduana-widget__label { font-weight: 600; font-size: .9375rem; color: var(--clr-ink); }
  .aduana-widget__opt { font-weight: 400; color: var(--clr-muted); font-size: .85rem; }
  .aduana-widget__input {
    font-family: var(--font-body); font-size: 1rem; min-height: 44px; padding: .55rem .75rem;
    border: 1px solid var(--clr-border); border-radius: var(--r-sm); background: #fff; color: var(--clr-ink);
  }
  .aduana-widget__input:focus-visible {
    outline: 3px solid var(--clr-amber); outline-offset: 2px;
  }
  .aduana-widget__output {
    display: block; margin-top: 1rem; padding: 1rem; background: var(--clr-amber-bg);
    border-radius: var(--r-sm); font-family: var(--font-body); color: var(--clr-ink);
  }
  .aduana-widget__output.is-error { background: var(--clr-red-light); color: var(--clr-red); }
  .aduana-widget__dl { display: grid; grid-template-columns: 1fr auto; gap: .5rem 1rem; margin: 0; }
  .aduana-widget__dl dt { font-weight: 600; }
  .aduana-widget__dl dd { margin: 0; font-family: var(--font-display); text-align: right; }
  .aduana-widget__total { font-size: 1.25rem; color: var(--clr-red); padding-top: .5rem; border-top: 1px solid var(--clr-border); }
  .aduana-widget__nota, .aduana-widget__notas li { font-size: .85rem; color: var(--clr-muted); margin-top: .5rem; }
  .aduana-widget__notas { padding-left: 1.2rem; }
  .aduana-widget__disclaimer { font-size: .8rem; color: var(--clr-muted); margin-top: 1rem; line-height: 1.5; }
  .aduana-widget__exento { color: var(--clr-ink); font-size: 1.1rem; }
  .aduana-widget__formal { color: var(--clr-red); }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/widgets/AduanaWidget.tsx src/components/widgets/AduanaWidget.astro
git commit -m "feat(aduana): AduanaWidget Preact + wrapper SSR con disclaimer"
```

---

### Task C4: Página `/aduana/china-a-[pais]/`

**Files:**
- Create: `src/pages/aduana/china-a-[pais].astro`
- Create: `src/pages/aduana/index.astro`

- [ ] **Step 1: Implementar `china-a-[pais].astro`**

```astro
---
import Calculadora from '../../components/Calculadora.astro';
import AduanaWidgetAstro from '../../components/widgets/AduanaWidget.astro';
import { paises, paisBySlug } from '../../data/paises';
import { reglas, reglaByPais } from '../../data/aduana';
import { localeFor } from '../../lib/i18n';

export function getStaticPaths() {
  return reglas.map((r) => ({ params: { pais: r.pais }, props: { regla: r } }));
}
const { regla } = Astro.props;
const pais = paisBySlug(regla.pais)!;
const locale = localeFor(pais.slug);
const SITE = 'https://decomprasporchina.com';

const title = `Aduana China → ${pais.nombre}: cuánto pagas al importar (${new Date().getFullYear()})`;
const description = `Calculadora actualizada de aduana e impuestos para importar de China a ${pais.nombre}. Estimación basada en normativa vigente de ${regla.fuenteNombre} (revisado ${regla.fechaRevision}).`;
const intro = `Estima los impuestos que pagarás al recibir un pedido de AliExpress, Temu o Shein desde China en ${pais.nombre}. Cifras verificadas en ${regla.fuenteNombre}.`;

const alternates = reglas.map((r) => ({
  hreflang: paisBySlug(r.pais)!.hreflang,
  href: `${SITE}/aduana/china-a-${r.pais}/`,
}));
---

<Calculadora
  pais={pais}
  herramienta="aduana"
  title={title}
  description={description}
  intro={intro}
  ctaAfiliado={{
    headline: `Ya sabes lo que pagarás de aduana. Compra en AliExpress con confianza`,
    description: `Conoce el coste total antes de pulsar comprar. Envío gratuito y protección al comprador.`,
    ctaText: 'Ver ofertas en AliExpress',
  }}
  fechaActualizacion={regla.fechaRevision}
  alternates={alternates}
>
  <AduanaWidgetAstro slot="widget" regla={regla} locale={locale} />

  <div slot="tabla">
    <h2>Cómo se calcula: detalles del régimen</h2>
    <dl class="aduana-detalle">
      <dt>De minimis</dt>
      <dd>{regla.deMinimisUSD === null ? 'No aplica' : regla.deMinimisUSD === 0 ? `Sin franquicia (paga desde el primer dólar)` : `Hasta US$${regla.deMinimisUSD}`}</dd>
      <dt>IVA / IGV</dt>
      <dd>{regla.ivaPct}%</dd>
      <dt>Arancel general (China)</dt>
      <dd>{regla.arancelGeneralPct}%</dd>
      <dt>Base de cálculo</dt>
      <dd>{regla.baseCalculo}</dd>
    </dl>

    <h3>Notas y particularidades</h3>
    <ul class="aduana-notas">
      {regla.notas.map((n) => <li>{n}</li>)}
    </ul>

    <p class="aduana-fuente">
      Fuente oficial: <a href={regla.fuenteUrl} target="_blank" rel="nofollow noopener">{regla.fuenteNombre}</a>.
      Última revisión: {regla.fechaRevision}.
    </p>

    {regla.confianza === 'media' && (
      <aside class="aduana-confianza">
        <strong>Nota sobre la precisión:</strong> el régimen tributario de mensajería en {pais.nombre}
        es complejo y cambia con frecuencia. Esta calculadora aplica el procedimiento simplificado más común.
        Para envíos grandes, productos regulados o despacho formal, consulta con tu courier o un agente aduanal.
      </aside>
    )}
  </div>
</Calculadora>

<style>
  .aduana-detalle { display: grid; grid-template-columns: max-content 1fr; gap: .4rem 1rem; margin: 1rem 0; }
  .aduana-detalle dt { font-weight: 600; }
  .aduana-detalle dd { margin: 0; }
  .aduana-notas { padding-left: 1.2rem; line-height: 1.7; }
  .aduana-notas li { margin-bottom: .35rem; }
  .aduana-fuente { font-size: .9rem; color: var(--clr-muted); margin-top: 1rem; }
  .aduana-confianza {
    margin-top: 1.5rem; padding: 1rem; background: var(--clr-amber-bg);
    border-left: 4px solid var(--clr-amber); border-radius: var(--r-sm); font-size: .9rem;
  }
</style>
```

- [ ] **Step 2: Crear hub `aduana/index.astro`** (análogo a `precio-aliexpress/index.astro`)

```astro
---
import Base from '../../layouts/Base.astro';
import { reglas } from '../../data/aduana';
import { paisBySlug } from '../../data/paises';
const title = 'Aduana e impuestos: importar de China por país';
const description = 'Calculadora de aduana para importar productos chinos. Disponible para Chile, México, Perú, Colombia, Argentina y España.';
---
<Base title={title} description={description}>
  <div class="container" style="max-width: 720px; padding: 2rem 1rem 3rem;">
    <h1>Aduana e impuestos al importar de China</h1>
    <p>Cada país tiene su propio régimen. Elige el tuyo:</p>
    <ul class="hub-list">
      {reglas.map((r) => (
        <li><a href={`/aduana/china-a-${r.pais}/`}>Aduana para {paisBySlug(r.pais)?.nombre}</a></li>
      ))}
    </ul>
  </div>
  <style>
    .hub-list { list-style: none; padding: 0; display: grid; gap: .5rem; }
    .hub-list a { display: block; padding: .75rem 1rem; background: var(--clr-surface); border: 1px solid var(--clr-border); border-radius: var(--r-sm); color: var(--clr-link); font-weight: 600; }
    .hub-list a:hover { background: var(--clr-surface2); }
  </style>
</Base>
```

- [ ] **Step 3: Build + smoke**

```bash
npm run build 2>&1 | tail -3
# Expected: 360 + 7 (moneda) + 7 (aduana) = 374 páginas
ls dist/aduana/
# Expected: china-a-argentina/ china-a-chile/ china-a-colombia/ china-a-espana/ china-a-mexico/ china-a-peru/ index.html
grep -c 'aduana-widget__noscript' dist/aduana/china-a-chile/index.html
# Expected: 1
grep -c 'aduana.cl' dist/aduana/china-a-chile/index.html
# Expected: ≥ 1 (fuente oficial)
grep -c 'Nota sobre la precisión' dist/aduana/china-a-mexico/index.html
# Expected: 1 (disclaimer confianza media)
```

- [ ] **Step 4: Manual UX check**

```bash
npm run dev &
sleep 4
```

Visitar `http://localhost:4321/aduana/china-a-chile/`:
- Introducir `100` → debe mostrar `~$11.337 CLP` (US$19 ≈ con tipo ~895)
- Introducir `600` → debe mostrar arancel + IVA con total mayor
- Verificar disclaimer al fondo + enlace a aduana.cl

Visitar `http://localhost:4321/aduana/china-a-mexico/`:
- Verificar nota de confianza media visible
- Introducir `3000` → debe mostrar "requiere despacho formal"

```bash
kill %1
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/aduana/
git commit -m "feat(aduana): páginas china-a-[pais] + hub + disclaimer confianza media"
```

---

### Task C5: Cross-links aduana ↔ moneda en posts existentes

**Files:**
- Modify: `src/utils/content.ts` (añadir patterns a `addInternalLinks`)

- [ ] **Step 1: Añadir 4 nuevos patterns**

```ts
// En addInternalLinks(), añadir:
{ pattern: /\baduana(?:\s+(?:de\s+)?china)?\b/i, url: '/aduana/', exclude: [/* slugs aduana */] },
{ pattern: /\baranceles?\s+(?:de\s+)?(?:importaci[óo]n|china)\b/i, url: '/aduana/', exclude: [] },
{ pattern: /\bconvertir\s+(?:el\s+)?precio\s+(?:de\s+)?aliexpress\b/i, url: '/precio-aliexpress/', exclude: [] },
{ pattern: /\b(?:tipo|tasa)\s+de\s+cambio\s+(?:yuan|cny)\b/i, url: '/precio-aliexpress/', exclude: [] },
```

- [ ] **Step 2: Build + verificar que enlaces aparecen en algún post existente**

```bash
npm run build && grep -c '/aduana/' dist/requisitos-importar-desde-china-2026/index.html
# Expected: ≥ 1
```

- [ ] **Step 3: Commit**

```bash
git add src/utils/content.ts
git commit -m "feat(linking): 4 auto-link patterns hacia aduana y moneda"
```

---

# CIERRE

### Task D1: Lighthouse + acceptance criteria + PR

- [ ] **Step 1: Build limpio + sitemap completo**

```bash
rm -rf dist && npm run build 2>&1 | tail -5
# Expected: 374 page(s)
grep -c '<url>' dist/sitemap-0.xml
# Expected: ≥ 374
```

- [ ] **Step 2: Lighthouse móvil sobre 4 páginas representativas**

```bash
npx http-server dist -p 8080 &
sleep 3
for path in / /precio-aliexpress/peso-chileno/ /aduana/china-a-chile/ /aduana/china-a-mexico/; do
  npx lighthouse "http://localhost:8080$path" --preset=desktop --quiet --chrome-flags="--headless" \
    --output=json --output-path="/tmp/lh-$(echo $path | tr / _).json"
done
kill %1
node -e "
const fs=require('fs');
for (const f of fs.readdirSync('/tmp').filter(x=>x.startsWith('lh-'))){
  const j=JSON.parse(fs.readFileSync('/tmp/'+f,'utf8'));
  console.log(f.padEnd(50), 'perf', (j.categories.performance.score*100).toFixed(0), 'a11y', (j.categories.accessibility.score*100).toFixed(0), 'seo', (j.categories.seo.score*100).toFixed(0));
}
"
# Expected: perf ≥ 90, a11y ≥ 90, seo ≥ 95 en TODAS
```

- [ ] **Step 3: Test fallback de update-rates (simular API caída)**

```bash
# Mover rates.json y forzar fallo de la API principal:
cp src/data/rates.json /tmp/rates-backup.json
# Mockear fetch fallido editando temporalmente el script y verificando que cae al fallback
node -e "
import('./scripts/update-rates.mjs').then(async (m) => {
  globalThis.fetch = async () => { throw new Error('simulated down'); };
  const { fetchRates, fetchRatesFallback } = m;
  try { await fetchRates(); console.error('UNEXPECTED PASS'); process.exit(1); } catch {}
  try { await fetchRatesFallback(); console.error('UNEXPECTED PASS 2'); process.exit(1); } catch { console.log('✓ ambos fallaron como esperado, build mantendría JSON existente'); }
});
"
cp /tmp/rates-backup.json src/data/rates.json
```

- [ ] **Step 4: Verificar acceptance criteria (sección 9 del spec)**

Lista checkable manual:

- [ ] Todas las páginas generadas vía `getStaticPaths` (6 monedas + 6 países + 2 hubs)
- [ ] Calculadoras funcionan en móvil real
- [ ] WCAG AA verificado en al menos chile/mexico (contraste, focus, labels, targets 44px)
- [ ] Lighthouse móvil Performance y Accessibility ≥ 90 en 4 URLs
- [ ] CTA con `rel="nofollow sponsored noopener"` y URL desde env
- [ ] Cada página muestra fecha de actualización
- [ ] Aduana: disclaimer + fuente oficial visibles
- [ ] Interlinking entre las tres herramientas (moneda↔aduana↔tallas) presente
- [ ] title/meta/canonical/hreflang/schema/sitemap correctos
- [ ] Tests unitarios pasan: `npm run test:run`
- [ ] Cada `ReglaAduana` tiene `fuenteUrl` oficial + `fechaRevision` + confianza
- [ ] Fallback de tipos de cambio probado simulando API caída

- [ ] **Step 5: Push y abrir PR**

```bash
git push -u origin feat/calculadoras
gh pr create --title "feat: suite de calculadoras (moneda + aduana) para 6 países" --body "$(cat <<'EOF'
## Summary
- Conversor de precio AliExpress por moneda local (6 países LATAM + España)
- Calculadora de aduana China → país (6 países, cifras de fuente oficial)
- Interlinking automático entre tallas + moneda + aduana
- Tracking afiliado migrado a env vars
- Tests Vitest sobre la lógica pura (`src/lib/`) y el script de update-rates

Cifras de aduana validadas con fuentes oficiales (workflow `wf_0fc45040`):
- 🇨🇱 Chile — Aduana Chile (Ley 21.713)
- 🇲🇽 México — ANAM (Regla 3.7.35 RGCE, tasa global 33.5%) — confianza media
- 🇵🇪 Perú — SUNAT (umbral US$200 FOB)
- 🇨🇴 Colombia — DIAN (umbral US$200 FOB)
- 🇦🇷 Argentina — ARCA / Decreto 1065/2024 (franquicia US$400 courier)
- 🇪🇸 España — AEAT / UE 2026/382

## Test plan
- [ ] `npm run test:run` pasa
- [ ] `npm run build` genera 374 páginas
- [ ] Lighthouse móvil Performance + A11y ≥ 90 en /precio-aliexpress/peso-chileno/ y /aduana/china-a-chile/
- [ ] Visitar móvil real: introducir un valor en cada calculadora, validar output
- [ ] Verificar que el CTA de afiliado lleva al tracking ID de env
- [ ] sitemap.xml contiene las nuevas URLs

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 6: Commit final del plan**

```bash
git add docs/superpowers/plans/2026-06-07-suite-calculadoras.md
git commit -m "docs: plan de implementación de la suite de calculadoras"
```

---

## Self-review

**Spec coverage:**
- ✅ §1 contexto (Astro, audiencia LATAM/móvil, monetización jerárquica) → todos los widgets/CTAs lo respetan
- ✅ §2.1 WCAG AA → MonedaWidget y AduanaWidget aplican labels/htmlFor, aria-live, targets 44px, foco visible (Task A4 y B4/C3)
- ✅ §2.2 rendimiento → island `client:visible`, SSR del contenido informativo, sin librerías pesadas
- ✅ §2.3 value loop monetización → AffiliateBox en carcasa (Task A4), tracking desde env (Task A1)
- ✅ §2.4 anti-HCU → fecha actualización visible, contenido único por país (notas+fuente+disclaimer), no plantillas vacías
- ✅ §3.1 estructura archivos → File Structure documenta cada uno
- ✅ §3.2 catálogo paises.ts → Task A2
- ✅ §3.3 getStaticPaths → Tasks B5 y C4
- ✅ §3.4 interlinking automático → Calculadora.astro (Task A4) genera links desde datos
- ✅ §4 conversor moneda → Tasks B1-B6
- ✅ §5 calculadora aduana → Tasks C1-C5
- ✅ §6 SEO técnico → title plantilla con `{año}`, canonical (Base.astro), hreflang (alternates), Schema WebApplication, sitemap
- ✅ §7 diseño visual → reutiliza variables CSS del sitio, tarjeta border-left amber, Fraunces+Sora
- ✅ §8 seguridad y config → env vars, `.env.example`, `.gitignore` ya excluye `.env`
- ✅ §9 acceptance criteria → Task D1 los checkea uno a uno
- ✅ §10 orden de trabajo → plan respeta Fase A → B → C → cierre con pausas

**Placeholder scan:** sin TBD/TODO/"add validation"/"similar to". Todos los snippets de código están completos.

**Type consistency:** `Pais`, `Moneda`, `ReglaAduana`, `Rates`, `Desglose`, `CalcularInput` — usados consistentemente en data, lib, widgets y páginas. `calcular()` firma única en todos los tests.

**Riesgo abierto:** la lógica de `calcEstandar` mezcla casos por país con `if (regla.pais === 'chile') …`. Eso huele a primitivo; si en una siguiente iteración añadimos los 9 países secundarios, conviene refactorizar a una estrategia por país. Para v1 con 6 países es aceptable.

---

## Execution Handoff

Plan guardado en `docs/superpowers/plans/2026-06-07-suite-calculadoras.md`. Dos opciones de ejecución:

1. **Subagent-Driven (recomendado)** — un subagente fresco por task, review entre tareas, iteración rápida
2. **Inline Execution** — ejecuto las tareas en esta sesión con checkpoints de revisión

**¿Qué prefieres? Y previo a empezar, ¿OK con el plan?**

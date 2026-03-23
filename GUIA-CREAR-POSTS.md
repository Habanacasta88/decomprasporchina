# Guía: Cómo Crear Posts en decomprasporchina.com

## Arquitectura de monetización

Cada post que se publica pasa automáticamente por el sistema de inyección de `[slug].astro` que inserta **publicidad y afiliados** en posiciones estratégicas. Si el post no está bien estructurado (con suficientes párrafos `<p>`), los anuncios no se muestran correctamente.

### Estructura de monetización por post

```
┌─────────────────────────────────────────┐
│  Header (título, fecha, categoría)      │
│  Featured image                         │
├─────────────────────────────────────────┤
│  contentPart1 (primer párrafo)          │
├─────────────────────────────────────────┤
│  ██ AdSense — Slot 4427222054 ██        │  ← Tras párrafo 1
├─────────────────────────────────────────┤
│  contentPart2 (párrafos 2 y 3)          │
├─────────────────────────────────────────┤
│  ██ AffiliateBox (AliExpress+Amazon) ██ │  ← Tras párrafo 3
│  ██ AdSense — Slot 1879548363 ██        │  ← Justo después
├─────────────────────────────────────────┤
│  contentPart3 (resto del artículo)      │
├─────────────────────────────────────────┤
│  FAQs (si hay <details> en el body)     │
│  Artículos relacionados (auto)          │
└─────────────────────────────────────────┘
```

### ⚠️ REQUISITO CRÍTICO: Mínimo 4 párrafos `<p>`

El sistema `splitAtParagraph()` divide el HTML por etiquetas `</p>`:
- **Split 1**: tras el 1er `</p>` → inserta AdSense slot 1
- **Split 2**: tras el 3er `</p>` → inserta AffiliateBox + AdSense slot 2

**Si el artículo tiene menos de 4 párrafos, los anuncios no se mostrarán correctamente.**

---

## Proceso paso a paso para crear un post

### 1. Añadir el post a `src/data/posts.json`

Cada post es un objeto JSON con esta estructura:

```json
{
  "slug": "mi-nuevo-articulo",
  "title": "Título del Artículo Visible en la Página",
  "seoTitle": "Título SEO Optimizado para Google [2026]",
  "seoDescription": "Meta description de 140-160 chars con keyword principal.",
  "date": "2026-03-21",
  "modified": "2026-03-21",
  "featuredImage": "",
  "categories": ["Tecnología"],
  "body": "<!-- wp:paragraph -->\n<p>Primer párrafo...</p>\n<!-- /wp:paragraph -->\n..."
}
```

#### Campos obligatorios

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `slug` | URL del artículo (sin / inicial ni final) | `mejores-auriculares-bluetooth` |
| `title` | Título H1 visible | `Los Mejores Auriculares Bluetooth` |
| `seoTitle` | Title tag para Google (max 60 chars) | `Mejores Auriculares Bluetooth 2026` |
| `seoDescription` | Meta description (140-160 chars) | `Ranking de los mejores auriculares...` |
| `date` | Fecha publicación (YYYY-MM-DD) | `2026-03-21` |
| `modified` | Fecha última modificación | `2026-03-21` |
| `categories` | Array con 1+ categorías válidas | `["Tecnología"]` |
| `body` | HTML del artículo con formato WordPress | Ver abajo |

#### Categorías válidas
- `Tiendas Chinas`, `Ropa`, `Accesorios`, `Tecnología`, `Calzado`, `Deporte`, `Blog`, `Xiaomi`

La categoría determina qué CTA de afiliado se muestra (definido en `categoryAffiliates` de `[slug].astro`).

### 2. Escribir el body HTML

El body debe usar formato de bloques WordPress (para compatibilidad). **Es crítico tener al menos 4 párrafos `<p>` para que los ads se inserten correctamente.**

#### Plantilla mínima

```html
<!-- wp:paragraph -->
<p>Primer párrafo introductorio con la keyword principal. Este es el gancho.</p>
<!-- /wp:paragraph -->

<!-- AQUÍ SE INSERTA → AdSense Slot 1 (4427222054) -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Primer H2</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Segundo párrafo con contenido de valor.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Tercer párrafo ampliando información.</p>
<!-- /wp:paragraph -->

<!-- AQUÍ SE INSERTA → AffiliateBox + AdSense Slot 2 (1879548363) -->

<!-- wp:paragraph -->
<p>Cuarto párrafo y resto del artículo...</p>
<!-- /wp:paragraph -->

<!-- Resto de H2s, párrafos, tablas, etc. -->
```

#### Elementos HTML soportados

- `<p>` — Párrafo (CLAVE para posicionamiento de ads)
- `<h2>`, `<h3>` — Encabezados (se usan para Table of Contents automático)
- `<ul>`, `<ol>`, `<li>` — Listas
- `<table>` — Tablas (envolver en `<div class="table-responsive">` para mobile)
- `<details><summary>` — FAQs (se extraen automáticamente para schema FAQ)
- `<a>` — Enlaces (usar `rel="nofollow sponsored noopener"` en afiliados)
- `<img>` — Imágenes

### 3. Enlaces de afiliado dentro del body

Cuando incluyas enlaces de afiliado dentro del texto del artículo:

```html
<a href="https://s.click.aliexpress.com/e/_c45uyDgx" target="_blank" rel="nofollow sponsored noopener">AliExpress</a>

<a href="https://www.amazon.es/s?k=auriculares+bluetooth&tag=enjoys0d-21" target="_blank" rel="nofollow sponsored noopener">Amazon</a>
```

**Siempre incluir:**
- `target="_blank"` — abrir en pestaña nueva
- `rel="nofollow sponsored noopener"` — cumplimiento SEO y normativa

### 4. Para posts de alto tráfico: CTA personalizado

Si el artículo va a tener mucho tráfico, añade una entrada en `slugAffiliates` en `[slug].astro`:

```typescript
'mi-nuevo-articulo': {
  headline: 'Titular del CTA',
  description: 'Descripción persuasiva del CTA.',
  ctaText: 'Texto del botón principal',
  ctaUrl: ALIEXPRESS,
  secondaryCta: { text: 'Texto botón secundario', url: `https://www.amazon.es/s?k=keyword&tag=${AMAZON_TAG}` },
  platform: 'both',
},
```

### 5. Build y verificación

```bash
# Build
source ~/.nvm/nvm.sh && nvm use 22
npm run build

# Verificar que el artículo se generó
ls dist/mi-nuevo-articulo/index.html

# Verificar que los ads están presentes
grep -c 'adsbygoogle' dist/mi-nuevo-articulo/index.html
# Debe devolver 2 (dos slots de AdSense)

grep -c 'affiliate-box' dist/mi-nuevo-articulo/index.html
# Debe devolver 1 (un AffiliateBox)
```

### 6. Deploy al VPS

```bash
# Build para amd64 (el VPS es Linux x86)
docker buildx build --platform linux/amd64 -t decomprasporchina:latest --load .

# Transferir al VPS
docker save decomprasporchina:latest | ssh root@168.119.125.218 "docker load"

# Restart del contenedor
ssh root@168.119.125.218 "docker stop decomprasporchina && docker rm decomprasporchina && docker run -d --name decomprasporchina --network coolify --restart unless-stopped \
  -l 'traefik.enable=true' \
  -l 'traefik.http.routers.decomprasporchina.rule=Host(\`decomprasporchina.com\`) || Host(\`www.decomprasporchina.com\`)' \
  -l 'traefik.http.routers.decomprasporchina.entrypoints=https' \
  -l 'traefik.http.routers.decomprasporchina.tls=true' \
  -l 'traefik.http.routers.decomprasporchina.tls.certresolver=letsencrypt' \
  -l 'traefik.http.services.decomprasporchina.loadbalancer.server.port=80' \
  decomprasporchina:latest"
```

### 7. Post-deploy

1. **Verificar en producción:**
   ```bash
   ssh root@168.119.125.218 "docker exec decomprasporchina curl -s -o /dev/null -w '%{http_code}' http://localhost/mi-nuevo-articulo/"
   # Debe devolver 200
   ```

2. **Solicitar indexación en Google Search Console:**
   - Ir a Search Console → Inspección de URLs
   - Pegar: `https://decomprasporchina.com/mi-nuevo-articulo/`
   - Click "Solicitar indexación"

3. **Commit y push:**
   ```bash
   git add src/data/posts.json
   git commit -m "feat: add article about X"
   git push origin main
   ```

---

## Checklist rápido

- [ ] `slug` es URL-friendly (minúsculas, guiones, sin acentos ni espacios)
- [ ] `seoTitle` tiene la keyword principal y ≤60 chars
- [ ] `seoDescription` tiene 140-160 chars con keyword
- [ ] `categories` es un array con al menos 1 categoría válida
- [ ] El body tiene **mínimo 4 párrafos `<p>`** (para que los 2 ads + affiliate box se inserten)
- [ ] Enlaces de afiliado llevan `rel="nofollow sponsored noopener"`
- [ ] Build exitoso (`npm run build`)
- [ ] 2 AdSense slots verificados en el HTML generado
- [ ] 1 AffiliateBox verificado en el HTML generado
- [ ] Desplegado al VPS y respondiendo 200
- [ ] Solicitada indexación en Search Console

---

## Datos de monetización

| Componente | Archivo | Posición |
|-----------|---------|----------|
| AdSense Slot 1 | `AdUnit.astro` | Tras párrafo 1 |
| AffiliateBox | `AffiliateBox.astro` | Tras párrafo 3 |
| AdSense Slot 2 | `AdUnit.astro` | Tras AffiliateBox |
| Footer disclosure | `Base.astro` | Footer de toda la web |
| Affiliate links config | `[slug].astro` | Lines 12-134 |

| Cuenta | ID |
|--------|-----|
| AdSense | ca-pub-1887931946230317 |
| AdSense Slot 1 | 4427222054 |
| AdSense Slot 2 | 1879548363 |
| AliExpress affiliate | https://s.click.aliexpress.com/e/_c45uyDgx |
| Amazon tag | enjoys0d-21 |
